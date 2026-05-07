// pages/api/admin/upload.js - 图片上传接口（管理员，支持单张/批量）
import { getDbAsync } from '../../../lib/db';
import { withAdminAuth } from '../../../lib/auth';
import { uploadFile } from '../../../lib/cos';

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

async function isWatermarkEnabled() {
  const db = await getDbAsync();
  const setting = db.get("SELECT value FROM settings WHERE key = ?", ['watermark_enabled']);
  return setting && setting.value === 'true';
}

async function uploadSingleImage(db, image, categoryId, apiId, userId) {
  const { type, buffer } = parseBase64Image(image);
  const randomName = generateRandomName();
  const extension = type.split('/')[1] || 'png';
  const key = `images/${categoryId || 'uncategorized'}/${randomName}.${extension}`;

  const result = await uploadFile(buffer, key);
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO images (url, cos_key, category_id, api_id, uploaded_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [result.url, result.cosKey, categoryId || null, apiId || null, userId, now]
  );

  const lastId = db.get('SELECT last_insert_rowid() as id');
  return db.get('SELECT * FROM images WHERE id = ?', [lastId.id]);
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { image, images, category_id, api_id } = req.body;
    const db = await getDbAsync();

    if (Array.isArray(images) && images.length > 0) {
      const results = [];
      for (const img of images) {
        const saved = await uploadSingleImage(db, img, category_id, api_id, req.user.id);
        results.push(saved);
      }
      return res.status(201).json({ message: `成功上传 ${results.length} 张图片`, images: results });
    }

    if (!image) {
      return res.status(400).json({ error: '图片数据必填' });
    }

    const savedImage = await uploadSingleImage(db, image, category_id, api_id, req.user.id);

    return res.status(201).json({ message: '图片上传成功', image: savedImage });
  } catch (error) {
    console.error('Upload API error:', error);
    return res.status(500).json({ error: '上传失败: ' + error.message });
  }
}

export default withAdminAuth(handler);
