// pages/api/user/stats.js - 用户个人统计
import { getDbAsync } from '../../../lib/db';
import { withAuth } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const db = await getDbAsync();
    const userId = req.user.id;

    // 今日请求数
    const today = new Date().toISOString().split('T')[0];
    const todayRequestsResult = db.get(
      'SELECT COUNT(*) as count FROM api_logs WHERE user_id = ? AND created_at LIKE ?',
      [userId, `${today}%`]
    );
    const todayRequests = todayRequestsResult ? todayRequestsResult.count : 0;

    // 总请求数
    const totalRequestsResult = db.get(
      'SELECT COUNT(*) as count FROM api_logs WHERE user_id = ?',
      [userId]
    );
    const totalRequests = totalRequestsResult ? totalRequestsResult.count : 0;

    // 最近请求记录
    const recentLogs = db.all(
      'SELECT * FROM api_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    return res.status(200).json({ todayRequests, totalRequests, recentLogs });
  } catch (error) {
    console.error('User stats API error:', error);
    return res.status(500).json({ error: '服务器内部错误', message: error.message });
  }
}

export default withAuth(handler);
