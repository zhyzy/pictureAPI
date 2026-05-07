// pages/api/admin/images.js
import { getDbAsync } from '../../../lib/db';
import { withAdminAuth } from '../../../lib/auth';
import { deleteFile, getFileUrl } from '../../../lib/cos';

async function handler(req, res) {
  try {
    const db = await getDbAsync();

    if (req.method === 'GET') {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const categoryId = req.query.category_id;

      let query = `
        SELECT images.*, categories.name as category_name, users.username as uploaded_by_username
        FROM images
        LEFT JOIN categories ON images.category_id = categories.id
        LEFT JOIN users ON images.uploaded_by = users.id
      `;
      let countQuery = 'SELECT COUNT(*) as total FROM images';

      if (categoryId) {
        query += ' WHERE images.category_id = ?';
        countQuery += ' WHERE category_id = ?';
      }

      query += ' ORDER BY images.id DESC LIMIT ? OFFSET ?';

      const images = db.all(query, categoryId ? [categoryId, limit, offset] : [limit, offset]);
      const totalResult = db.get(countQuery, categoryId ? [categoryId] : []);
      const total = totalResult ? totalResult.total : 0;
      const totalPages = Math.ceil(total / limit);

      const imagesWithSignedUrl = await Promise.all(
        images.map(async (image) => {
          if (image.cos_key) {
            try {
              image.url = await getFileUrl(image.cos_key, 7200);
            } catch (err) {
              console.error('生成签名URL失败:', err.message);
            }
          }
          return image;
        })
      );

      return res.status(200).json({ images: imagesWithSignedUrl, pagination: { page, limit, total, totalPages } });
    }

    if (req.method === 'POST') {
      const { url, cos_key, category_id, api_id } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'url必填' });
      }

      const now = new Date().toISOString();

      db.run(
        `INSERT INTO images (url, cos_key, category_id, api_id, uploaded_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [url, cos_key || null, category_id || null, api_id || null, req.user.id, now]
      );

      const lastId = db.get('SELECT last_insert_rowid() as id');
      const image = db.get('SELECT * FROM images WHERE id = ?', [lastId.id]);
      return res.status(201).json({ message: '图片上传成功', image });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'id必填' });
      }

      const image = db.get('SELECT * FROM images WHERE id = ?', [id]);
      if (!image) {
        return res.status(404).json({ error: '图片不存在' });
      }

      if (image.cos_key) {
        try {
          await deleteFile(image.cos_key);
        } catch (error) {
          console.error('删除COS文件失败:', error);
        }
      }

      db.run('DELETE FROM images WHERE id = ?', [id]);
      return res.status(200).json({ message: '图片删除成功' });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (error) {
    console.error('Admin images API error:', error);
    return res.status(500).json({ error: '服务器内部错误', message: error.message });
  }
}

export default withAdminAuth(handler);
