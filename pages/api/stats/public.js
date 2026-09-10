// pages/api/stats/public.js - 公开统计API
import { getDbAsync, getTotalApiCalls } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const db = await getDbAsync();

    // 总请求数（含已清理日志的补偿计数）
    const total = getTotalApiCalls(db);

    // 今日请求数
    const todayResult = db.get(
      `SELECT COUNT(*) as count FROM api_logs WHERE date(created_at) = date('now')`
    );
    const today = todayResult ? todayResult.count : 0;

    // 本周请求数（最近7天滚动窗口）
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const weekResult = db.get(
      'SELECT COUNT(*) as count FROM api_logs WHERE created_at >= ?',
      [weekStart]
    );
    const thisWeek = weekResult ? weekResult.count : 0;

    // 本月请求数（最近30天滚动窗口）
    const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const monthResult = db.get(
      'SELECT COUNT(*) as count FROM api_logs WHERE created_at >= ?',
      [monthStart]
    );
    const thisMonth = monthResult ? monthResult.count : 0;

    return res.status(200).json({ today, thisWeek, thisMonth, total });
  } catch (error) {
    console.error('Stats API error:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}
