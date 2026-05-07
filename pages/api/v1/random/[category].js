// pages/api/v1/random/[category].js - 公开API：获取随机图片（需 API Key）
import { getDbAsync } from '../../../../lib/db';
import { getFileUrl } from '../../../../lib/cos';

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

  try {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ error: '分类参数必填' });
    }

    const db = await getDbAsync();

    const user = db.get('SELECT * FROM users WHERE api_key = ? AND is_active = 1', [apiKey]);
    if (!user) {
      return res.status(401).json({ error: 'API Key 无效或已失效' });
    }

    // 获取分类
    const categoryObj = db.get('SELECT * FROM categories WHERE slug = ?', [category]);
    if (!categoryObj) {
      return res.status(404).json({ error: '分类不存在' });
    }

    const apiRecord = db.get('SELECT id FROM apis WHERE endpoint = ?', [`/api/v1/random/${category}`]);
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
          [user.id, apiId, `/api/v1/random/${category}`,
           req.headers['x-forwarded-for'] || req.connection.remoteAddress || '',
           req.headers['user-agent'] || '', 429, now]
        );
        return res.status(429).json({ error: '请求过于频繁，请稍后再试' });
      }
    }

    // 获取该分类下的所有图片
    const images = db.all('SELECT * FROM images WHERE category_id = ?', [categoryObj.id]);
    if (images.length === 0) {
      return res.status(404).json({ error: '该分类下暂无图片' });
    }

    // 随机返回一张图片
    const randomImage = images[Math.floor(Math.random() * images.length)];

    // 记录成功调用日志
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO api_logs (user_id, api_id, endpoint, ip, user_agent, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user.id, apiId, `/api/v1/random/${category}`,
       req.headers['x-forwarded-for'] || req.connection.remoteAddress || '',
       req.headers['user-agent'] || '', 200, now]
    );

    // 为图片生成带签名的URL
    let signedUrl = randomImage.url;
    if (randomImage.cos_key) {
      try {
        signedUrl = await getFileUrl(randomImage.cos_key, 7200);
      } catch (err) {
        console.error('生成签名URL失败:', err.message);
      }
    }

    return res.status(200).json({
      url: signedUrl,
      id: randomImage.id,
      category: categoryObj.slug,
      category_name: categoryObj.name,
    });
  } catch (error) {
    // 记录错误日志
    try {
      const db2 = await getDbAsync();
      const now = new Date().toISOString();
      const endpoint = `/api/v1/random/${req.query.category || 'unknown'}`;
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
    console.error('Random API error:', error);
    return res.status(500).json({ error: '服务器内部错误', message: error.message });
  }
}
