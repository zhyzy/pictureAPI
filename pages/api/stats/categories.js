// pages/api/stats/categories.js - 获取分类列表（公开）
import { getDbAsync } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  const db = await getDbAsync();
  const categories = db.all('SELECT * FROM categories ORDER BY id ASC');
  return res.status(200).json({ categories });
}
