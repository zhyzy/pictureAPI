// pages/api/images.js - 获取图片列表（公开）
import { getDbAsync } from '../../lib/db';
import { getStoredFileUrl } from '../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const db = await getDbAsync();
    const page = parseInt(req.query.page) || 1;
    // 上限 100：防止 ?limit=999999 一次拉光整个图库目录
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const categoryId = req.query.category_id;
    const mediaType = req.query.media_type === 'video' ? 'video' : 'image';

    let query = `
      SELECT images.*, categories.name as category_name
      FROM images
      LEFT JOIN categories ON images.category_id = categories.id
      WHERE images.media_type = ?
    `;

    let countQuery = 'SELECT COUNT(*) as total FROM images WHERE media_type = ?';

    const whereParams = [mediaType];
    if (categoryId) {
      query += ' AND images.category_id = ?';
      countQuery += ' AND category_id = ?';
      whereParams.push(categoryId);
    }

    query += ' ORDER BY images.id DESC LIMIT ? OFFSET ?';

    const images = db.all(query, [...whereParams, limit, offset]);
    const totalResult = db.get(countQuery, whereParams);
    const total = totalResult ? totalResult.total : 0;

    // 为每个图片生成签名URL
    const imagesWithSignedUrl = await Promise.all(
      images.map(async (image) => {
        if (image.cos_key) {
          try {
            image.url = await getStoredFileUrl(image, 7200);
          } catch (err) {
            console.error('生成图片URL失败:', err.message);
          }
        }
        return image;
      })
    );

    return res.status(200).json({
      images: imagesWithSignedUrl,
      pagination: { page, limit, total },
    });
  } catch (error) {
    console.error('Images API error:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}
