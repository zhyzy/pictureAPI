// pages/api/stats/endpoints.js - 按接口统计调用次数
import { getDbAsync } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const db = await getDbAsync();

    const rows = db.all(
      `SELECT endpoint, COUNT(*) as count FROM api_logs GROUP BY endpoint`
    );

    const stats = {};
    for (const row of rows) {
      stats[row.endpoint] = row.count;
    }

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Endpoints stats API error:', error);
    return res.status(500).json({ error: '服务器内部错误', message: error.message });
  }
}
