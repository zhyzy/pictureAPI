// pages/api/v1/video/[category].js - 公开API：获取随机视频（需 API Key）
import { getDbAsync } from '../../../../lib/db';
import { getStoredFileUrl } from '../../../../lib/storage';

function getApiKey(req) {
  const headerKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
  if (headerKey) return headerKey;
  if (req.query) {
    const q = req.query;
    if (q.key) return q.key;
    const keyEntry = Object.entries(q).find(([k]) => k.toLowerCase() === 'key');
    if (keyEntry) return keyEntry[1];
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  const apiKey = getApiKey(req);
  if (!apiKey) {
    return res.status(401).json({ error: '缺少 API Key，请在请求中携带 key 参数或 X-API-Key 请求头' });
  }

  let user = null; // 供错误日志使用（错误可能发生在赋值之前）
  try {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ error: '分类参数必填' });
    }

    const db = await getDbAsync();

    user = db.get('SELECT * FROM users WHERE api_key = ? AND is_active = 1', [apiKey]);
    if (!user) {
      return res.status(401).json({ error: 'API Key 无效或已失效' });
    }

    // 获取分类（必须是视频分类）
    const categoryObj = db.get('SELECT * FROM categories WHERE slug = ?', [category]);
    if (!categoryObj) {
      return res.status(404).json({ error: '分类不存在' });
    }
    if ((categoryObj.type || 'image') !== 'video') {
      return res.status(400).json({ error: '该分类不是视频分类，请调用图片接口或选择视频分类' });
    }

    const apiRecord = db.get('SELECT id FROM apis WHERE endpoint = ?', [`/api/v1/video/${category}`]);
    const apiId = apiRecord ? apiRecord.id : null;

    // 检查限流
    const rateLimitEnabledResult = db.get("SELECT value FROM settings WHERE key = ?", ['rate_limit_enabled']);
    const rateLimitEnabled = rateLimitEnabledResult && rateLimitEnabledResult.value === 'true';

    if (rateLimitEnabled) {
      const userRateLimit = user.rate_limit;
      const globalRateLimitResult = db.get("SELECT value FROM settings WHERE key = ?", ['rate_limit_global']);
      const globalRateLimit = parseInt(globalRateLimitResult && globalRateLimitResult.value ? globalRateLimitResult.value : '100');
      const rateLimit = userRateLimit || globalRateLimit;

      const rateLimitWindowResult = db.get("SELECT value FROM settings WHERE key = ?", ['rate_limit_window']);
      const rateLimitWindow = parseInt(rateLimitWindowResult && rateLimitWindowResult.value ? rateLimitWindowResult.value : '3600000');
      const windowStart = new Date(Date.now() - rateLimitWindow).toISOString();

      const requestCountResult = db.get('SELECT COUNT(*) as count FROM api_logs WHERE user_id = ? AND created_at >= ?', [user.id, windowStart]);
      const requestCount = requestCountResult ? requestCountResult.count : 0;

      if (requestCount >= rateLimit) {
        const now = new Date().toISOString();
        db.run(
          `INSERT INTO api_logs (user_id, api_id, endpoint, ip, user_agent, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [user.id, apiId, `/api/v1/video/${category}`,
           req.headers['x-forwarded-for'] || req.connection.remoteAddress || '',
           req.headers['user-agent'] || '', 429, now]
        );
        return res.status(429).json({ error: '请求过于频繁，请稍后再试' });
      }
    }

    // 随机取一个视频
    const randomVideo = db.get(
      "SELECT * FROM images WHERE category_id = ? AND media_type = 'video' ORDER BY RANDOM() LIMIT 1",
      [categoryObj.id]
    );
    if (!randomVideo) {
      return res.status(404).json({ error: '该分类下暂无视频' });
    }

    // 记录成功调用日志
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO api_logs (user_id, api_id, endpoint, ip, user_agent, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user.id, apiId, `/api/v1/video/${category}`,
       req.headers['x-forwarded-for'] || req.connection.remoteAddress || '',
       req.headers['user-agent'] || '', 200, now]
    );

    // 生成访问 URL（七牛公开空间直接返回外链）
    let videoUrl = randomVideo.url;
    if (randomVideo.cos_key) {
      try {
        videoUrl = await getStoredFileUrl(randomVideo, 7200);
      } catch (err) {
        console.error('生成视频URL失败:', err.message);
      }
    }

    // type=video/redirect：302 跳转到视频本身，可直接放进 <video src> 用
    const returnType = (req.query.type || 'json').toString().toLowerCase();
    if (['video', 'redirect'].includes(returnType)) {
      res.setHeader('Cache-Control', 'no-store'); // 保证每次刷新都随机
      return res.redirect(302, videoUrl);
    }

    return res.status(200).json({
      url: videoUrl,
      id: randomVideo.id,
      type: 'video',
      category: categoryObj.slug,
      category_name: categoryObj.name,
    });
  } catch (error) {
    // 记录错误日志
    try {
      const db2 = await getDbAsync();
      const now = new Date().toISOString();
      const endpoint = `/api/v1/video/${req.query.category || 'unknown'}`;
      const apiRecord = db2.get('SELECT id FROM apis WHERE endpoint = ?', [endpoint]);
      db2.run(
        `INSERT INTO api_logs (user_id, api_id, endpoint, ip, user_agent, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user ? user.id : null, apiRecord ? apiRecord.id : null, endpoint,
         req.headers['x-forwarded-for'] || req.connection.remoteAddress || '',
         req.headers['user-agent'] || '', 500, now]
      );
    } catch (logErr) {
      console.error('写入错误日志失败:', logErr);
    }
    console.error('Video API error:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}
