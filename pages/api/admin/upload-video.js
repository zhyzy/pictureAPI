// pages/api/admin/upload-video.js - 视频上传接口（管理员，multipart/form-data，支持大文件）
import { getDbAsync } from '../../../lib/db';
import { withAdminAuth } from '../../../lib/auth';
import { uploadFileToStorageFromPath } from '../../../lib/storage';

const formidableModule = require('formidable');
// formidable v3 的 CJS 导出是模块对象（default/formidable 属性才是构造函数）
const formidable = formidableModule.default || formidableModule.formidable || formidableModule;

// 关闭默认 bodyParser，改用 formidable 流式解析 multipart
export const config = {
  api: {
    bodyParser: false,
  },
};

const ALLOWED_VIDEO_EXT = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'flv'];
// 与 Nginx client_max_body_size 200m 对齐：超过 200MB 的请求会被 Nginx 先拦截，
// 后端限制必须不高于它，否则报错信息会变成看不懂的 413 HTML
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB

function generateRandomName() {
  const len = Math.floor(Math.random() * 4) + 3;
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * 26)]).join('');
}

function parseForm(req) {
  const form = formidable({
    maxFileSize: MAX_VIDEO_SIZE,
    allowEmptyFiles: false,
    maxFields: 10,
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        if (err.code === 1009 || /maxFileSize/i.test(err.message || '')) {
          reject(new Error(`视频超过大小限制（最大 ${Math.round(MAX_VIDEO_SIZE / 1024 / 1024)}MB）`));
        } else {
          reject(err);
        }
      } else {
        resolve({ fields, files });
      }
    });
  });
}

// formidable v3 中文件字段可能为数组或单个对象
function normalizeFiles(fileField) {
  if (!fileField) return [];
  return Array.isArray(fileField) ? fileField : [fileField];
}

function getExt(name, mimetype) {
  const extFromName = (name || '').split('.').pop().toLowerCase();
  if (extFromName && ALLOWED_VIDEO_EXT.includes(extFromName)) return extFromName;
  const map = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov', 'video/x-msvideo': 'avi', 'video/x-matroska': 'mkv', 'video/x-flv': 'flv' };
  return map[mimetype] || null;
}

async function uploadSingleVideo(db, file, categoryId, userId) {
  const ext = getExt(file.originalFilename, file.mimetype);
  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error(`视频超过大小限制（最大 ${Math.round(MAX_VIDEO_SIZE / 1024 / 1024)}MB）`);
  }

  const key = `videos/${categoryId}/${generateRandomName()}.${ext}`;
  // 流式上传：直接用 formidable 的临时文件路径，不把视频读进内存
  const result = await uploadFileToStorageFromPath(db, file.filepath, key, categoryId);
  return { result, categoryId, userId };
}

// 纯同步入库（在事务内执行，零 await，事务存活时间微秒级）
function insertVideoRecords(db, uploaded, now) {
  for (const { result, categoryId, userId } of uploaded) {
    db.run(
      `INSERT INTO images (url, cos_key, storage_provider, media_type, category_id, uploaded_by, created_at)
       VALUES (?, ?, ?, 'video', ?, ?, ?)`,
      [result.url, result.storageKey, result.provider, categoryId, userId, now]
    );
  }
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  let tempPaths = [];
  try {
    const db = await getDbAsync();
    const { fields, files } = await parseForm(req);

    // formidable v3 字段值可能是数组
    const rawCategoryId = Array.isArray(fields.category_id) ? fields.category_id[0] : fields.category_id;
    if (!rawCategoryId) {
      return res.status(400).json({ error: '分类必填，视频必须上传到视频分类' });
    }

    // 校验分类存在且为视频分类
    const category = db.get('SELECT * FROM categories WHERE id = ?', [rawCategoryId]);
    if (!category) {
      return res.status(400).json({ error: '分类不存在' });
    }
    if ((category.type || 'image') !== 'video') {
      return res.status(400).json({ error: '该分类不是视频分类，请选择视频分类后上传' });
    }

    const videoFiles = normalizeFiles(files.videos || files.video || files.file);
    if (videoFiles.length === 0) {
      return res.status(400).json({ error: '请选择视频文件' });
    }

    tempPaths = videoFiles.map((f) => f.filepath);

    // 先统一校验格式，避免部分成功留下的中间状态
    for (const f of videoFiles) {
      if (!getExt(f.originalFilename, f.mimetype)) {
        return res.status(400).json({ error: `不支持的格式: ${f.originalFilename}（支持 MP4/WebM/MOV/AVI/MKV/M4V/FLV）` });
      }
    }

    // 1) 存储上传放在事务外（耗时操作，期间可能被其他写请求插入事务）
    const uploaded = [];
    try {
      for (const f of videoFiles) {
        uploaded.push(await uploadSingleVideo(db, f, category.id, req.user.id));
      }
    } catch (uploadError) {
      // 上传失败：补偿清理已上传成功的存储文件
      for (const { result } of uploaded) {
        try {
          const { deleteStoredFile } = await import('../../../lib/storage');
          await deleteStoredFile({ cos_key: result.storageKey, storage_provider: result.provider });
        } catch (cleanupErr) {
          console.error('补偿清理存储文件失败:', cleanupErr.message);
        }
      }
      throw uploadError;
    }

    // 2) 事务只做同步 INSERT（零 await，存活时间微秒级，不受并发影响）
    const now = new Date().toISOString();
    try {
      db.run('BEGIN');
      insertVideoRecords(db, uploaded, now);
      db.run('COMMIT');
    } catch (txError) {
      // 回滚失败不能掩盖真实错误；入库失败时补偿删除已上传的存储文件
      try {
        db.run('ROLLBACK');
      } catch (rollbackErr) {
        console.error('回滚失败（事务可能已不存在）:', rollbackErr.message);
      }
      for (const { result } of uploaded) {
        try {
          const { deleteStoredFile } = await import('../../../lib/storage');
          await deleteStoredFile({ cos_key: result.storageKey, storage_provider: result.provider });
        } catch (cleanupErr) {
          console.error('补偿清理存储文件失败:', cleanupErr.message);
        }
      }
      throw txError;
    }

    // 3) 重新查询入库记录返回
    const results = uploaded.map(({ result }) => {
      const record = db.get(
        "SELECT * FROM images WHERE cos_key = ? AND media_type = 'video' ORDER BY id DESC LIMIT 1",
        [result.storageKey]
      );
      return record || { url: result.url, storage_provider: result.provider };
    });

    return res.status(201).json({ message: `成功上传 ${results.length} 个视频`, videos: results });
  } catch (error) {
    console.error('Video upload API error:', error);
    return res.status(500).json({ error: '上传失败: ' + error.message });
  } finally {
    // 清理 formidable 的临时文件
    for (const p of tempPaths) {
      try {
        require('fs').unlinkSync(p);
      } catch (e) {
        // 临时文件可能已被 formidable 清理
      }
    }
  }
}

export default withAdminAuth(handler);
