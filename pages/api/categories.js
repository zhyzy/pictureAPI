// pages/api/categories.js - 从数据库获取分类列表
import { getDbAsync } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const db = await getDbAsync();

    const categories = db.all(`
      SELECT id, name, slug, description, type
      FROM categories ORDER BY id
    `);

    return res.status(200).json({ categories });
  } catch (error) {
    console.error('Categories list error:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}
