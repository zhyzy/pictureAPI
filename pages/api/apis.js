// pages/api/apis.js - 从数据库获取API列表
import { getDbAsync } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const db = await getDbAsync();

    const apis = db.all(`
      SELECT a.id, a.name, a.endpoint as url, a.description, c.name as category
      FROM apis a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.is_active = 1
      ORDER BY a.id
    `);

    return res.status(200).json({ apis });
  } catch (error) {
    console.error('APIs list error:', error);
    return res.status(500).json({ error: '服务器内部错误', message: error.message });
  }
}
