// pages/api/admin/upload.js - 图片上传接口（管理员，支持单张/批量）
import { getDbAsync } from '../../../lib/db';
import { withAdminAuth } from '../../../lib/auth';
import { uploadFileToStorage, deleteStoredFile } from '../../../lib/storage';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

function parseBase64Image(base64) {
  const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('图片格式错误');
  }
  const type = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  return { type, buffer };
}

function generateRandomName() {
  const len = Math.floor(Math.random() * 4) + 3;
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * 26)]).join('');
}

async function uploadSingleImage(db, image, categoryId, apiId, userId) {
  // 校验分类真实存在，防止非法值拼进存储路径
  let validCategoryId = null;
  if (categoryId !== undefined && categoryId !== null && categoryId !== '') {
    const cat = db.get('SELECT id FROM categories WHERE id = ?', [categoryId]);
    if (!cat) {
      throw new Error('分类不存在');
    }
    validCategoryId = cat.id;
  }

  const { type, buffer } = parseBase64Image(image);
  const randomName = generateRandomName();
  const extension = type.split('/')[1] || 'png';
  const key = `images/${validCategoryId || 'uncategorized'}/${randomName}.${extension}`;

  const result = await uploadFileToStorage(db, buffer, key, validCategoryId);
  return { result, validCategoryId, apiId, userId };
}

// 纯同步入库（在事务内执行，零 await，事务存活时间微秒级）
function insertImageRecords(db, uploaded, now) {
  for (const { result, validCategoryId, apiId, userId } of uploaded) {
    db.run(
      `INSERT INTO images (url, cos_key, storage_provider, category_id, api_id, uploaded_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [result.url, result.storageKey, result.provider, validCategoryId, apiId || null, userId, now]
    );
  }
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { image, images, category_id, api_id } = req.body;
    const db = await getDbAsync();

    if (Array.isArray(images) && images.length > 0) {
      // 先统一校验全部图片格式，减少中途失败留下的存储文件
      images.forEach((img) => parseBase64Image(img));

      // 存储上传放事务外（await 期间其他写请求可能插入事务，事务内只做同步 INSERT）
      const uploaded = [];
      try {
        for (const img of images) {
          uploaded.push(await uploadSingleImage(db, img, category_id, api_id, req.user.id));
        }
      } catch (uploadError) {
        for (const { result } of uploaded) {
          try {
            await deleteStoredFile({ cos_key: result.storageKey, storage_provider: result.provider });
          } catch (cleanupErr) {
            console.error('补偿清理存储文件失败:', cleanupErr.message);
          }
        }
        throw uploadError;
      }

      const now = new Date().toISOString();
      try {
        db.run('BEGIN');
        insertImageRecords(db, uploaded, now);
        db.run('COMMIT');
      } catch (txError) {
        try {
          db.run('ROLLBACK');
        } catch (rollbackErr) {
          console.error('回滚失败（事务可能已不存在）:', rollbackErr.message);
        }
        for (const { result } of uploaded) {
          try {
            await deleteStoredFile({ cos_key: result.storageKey, storage_provider: result.provider });
          } catch (cleanupErr) {
            console.error('补偿清理存储文件失败:', cleanupErr.message);
          }
        }
        throw txError;
      }

      const results = uploaded.map(({ result }) =>
        db.get('SELECT * FROM images WHERE cos_key = ? ORDER BY id DESC LIMIT 1', [result.storageKey])
      );
      return res.status(201).json({ message: `成功上传 ${results.length} 张图片`, images: results });
    }

    if (!image) {
      return res.status(400).json({ error: '图片数据必填' });
    }

    const { result, validCategoryId, apiId, userId } = await uploadSingleImage(db, image, category_id, api_id, req.user.id);
    const now = new Date().toISOString();
    try {
      db.run('BEGIN');
      insertImageRecords(db, [{ result, validCategoryId, apiId, userId }], now);
      db.run('COMMIT');
    } catch (txError) {
      try {
        db.run('ROLLBACK');
      } catch (rollbackErr) {
        console.error('回滚失败（事务可能已不存在）:', rollbackErr.message);
      }
      try {
        await deleteStoredFile({ cos_key: result.storageKey, storage_provider: result.provider });
      } catch (cleanupErr) {
        console.error('补偿清理存储文件失败:', cleanupErr.message);
      }
      throw txError;
    }
    const savedImage = db.get('SELECT * FROM images WHERE cos_key = ? ORDER BY id DESC LIMIT 1', [result.storageKey]);

    return res.status(201).json({ message: '图片上传成功', image: savedImage });
  } catch (error) {
    console.error('Upload API error:', error);
    return res.status(500).json({ error: '上传失败: ' + error.message });
  }
}

export default withAdminAuth(handler);
