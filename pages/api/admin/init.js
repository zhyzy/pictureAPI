// pages/api/admin/init.js - 初始化默认API数据
import { getDbAsync } from '../../../lib/db';
import { withAdminAuth } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const db = await getDbAsync();

    const existingApis = db.get('SELECT COUNT(*) as count FROM apis');
    if (existingApis && existingApis.count > 0) {
      return res.status(400).json({ error: 'API数据已存在，无需初始化' });
    }

    const categories = db.all('SELECT * FROM categories');

    const now = new Date().toISOString();
    const apis = [
      { name: '随机动漫图', description: '获取随机动漫二次元图片', endpoint: '/api/v1/random/anime', category: 'anime', method: 'GET', active: 1 },
      { name: '随机小姐姐图', description: '获取精美小姐姐图片', endpoint: '/api/v1/random/girl', category: 'girl', method: 'GET', active: 1 },
      { name: '随机风景图', description: '获取自然风景图片', endpoint: '/api/v1/random/scenery', category: 'scenery', method: 'GET', active: 1 },
      { name: '随机动物图', description: '获取可爱动物图片', endpoint: '/api/v1/random/animal', category: 'animal', method: 'GET', active: 1 },
      { name: '随机美食图', description: '获取美食图片', endpoint: '/api/v1/random/food', category: 'food', method: 'GET', active: 1 },
      { name: '随机图片', description: '获取随机图片', endpoint: '/api/v1/random/random', category: 'random', method: 'GET', active: 1 },
    ];

    let count = 0;
    for (const api of apis) {
      const category = categories.find(c => c.slug === api.category);
      if (category) {
        db.run(
          `INSERT INTO apis (name, description, endpoint, category_id, method, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [api.name, api.description, api.endpoint, category.id, api.method, api.active, now, now]
        );
        count++;
      }
    }

    return res.status(200).json({ message: 'API数据初始化成功', count });
  } catch (error) {
    console.error('Init API error:', error);
    return res.status(500).json({ error: '服务器内部错误', message: error.message });
  }
}

export default withAdminAuth(handler);
