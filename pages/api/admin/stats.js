// pages/api/admin/stats.js
import { getDbAsync, getTotalApiCalls } from '../../../lib/db';
import { withAdminAuth } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const db = await getDbAsync();

    const totalApisResult = db.get('SELECT COUNT(*) as count FROM apis WHERE is_active = 1');
    const totalApis = totalApisResult ? totalApisResult.count : 0;

    const totalCategoriesResult = db.get('SELECT COUNT(*) as count FROM categories');
    const totalCategories = totalCategoriesResult ? totalCategoriesResult.count : 0;

    // 总请求数（含已清理日志的补偿计数）
    const totalRequests = getTotalApiCalls(db);

    const today = new Date().toISOString().split('T')[0];
    const todayRequestsResult = db.get('SELECT COUNT(*) as count FROM api_logs WHERE created_at LIKE ?', [`${today}%`]);
    const todayRequests = todayRequestsResult ? todayRequestsResult.count : 0;

    const totalUsersResult = db.get('SELECT COUNT(*) as count FROM users');
    const totalUsers = totalUsersResult ? totalUsersResult.count : 0;

    const todayNewUsersResult = db.get('SELECT COUNT(*) as count FROM users WHERE created_at LIKE ?', [`${today}%`]);
    const todayNewUsers = todayNewUsersResult ? todayNewUsersResult.count : 0;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const activeUsersResult = db.get('SELECT COUNT(DISTINCT user_id) as count FROM api_logs WHERE created_at >= ?', [sevenDaysAgo]);
    const activeUsers = activeUsersResult ? activeUsersResult.count : 0;

    const totalImagesResult = db.get('SELECT COUNT(*) as count FROM images');
    const totalImages = totalImagesResult ? totalImagesResult.count : 0;

    // API调用趋势（最近7天）
    const apiTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const countResult = db.get('SELECT COUNT(*) as count FROM api_logs WHERE created_at LIKE ?', [`${date}%`]);
      apiTrend.push({ date, count: countResult ? countResult.count : 0 });
    }

    // 用户注册趋势（最近7天）
    const userTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const countResult = db.get('SELECT COUNT(*) as count FROM users WHERE created_at LIKE ?', [`${date}%`]);
      userTrend.push({ date, count: countResult ? countResult.count : 0 });
    }

    return res.status(200).json({
      totalApis, totalCategories, totalRequests, todayRequests,
      totalUsers, todayNewUsers, activeUsers, totalImages,
      apiTrend, userTrend,
    });
  } catch (error) {
    console.error('Admin stats API error:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}

export default withAdminAuth(handler);
