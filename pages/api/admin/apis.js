// pages/api/admin/apis.js
import { getDbAsync } from '../../../lib/db';
import { withAdminAuth } from '../../../lib/auth';

async function handler(req, res) {
  try {
    const db = await getDbAsync();

    if (req.method === 'GET') {
      const apis = db.all(`
        SELECT apis.*, categories.name as category_name
        FROM apis
        LEFT JOIN categories ON apis.category_id = categories.id
        ORDER BY apis.id ASC
      `);
      return res.status(200).json({ apis });
    }

    if (req.method === 'POST') {
      const { name, description, endpoint, category_id, method, params, example, is_active } = req.body;

      if (!name || !endpoint) {
        return res.status(400).json({ error: 'name和endpoint必填' });
      }

      const now = new Date().toISOString();

      try {
        db.run(
          `INSERT INTO apis (name, description, endpoint, category_id, method, params, example, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [name, description || null, endpoint, category_id || null, method || 'GET',
           params ? JSON.stringify(params) : null, example || null, is_active !== undefined ? is_active : 1, now, now]
        );

        const lastId = db.get('SELECT last_insert_rowid() as id');
        const api = db.get(`
          SELECT apis.*, categories.name as category_name
          FROM apis LEFT JOIN categories ON apis.category_id = categories.id
          WHERE apis.id = ?`, [lastId.id]
        );

        return res.status(201).json({ message: 'API接口创建成功', api });
      } catch (error) {
        if (error.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'endpoint已存在' });
        }
        throw error;
      }
    }

    if (req.method === 'PUT') {
      const { id, name, description, endpoint, category_id, method, params, example, is_active } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'id必填' });
      }

      const now = new Date().toISOString();

      try {
        db.run(
          `UPDATE apis SET name = ?, description = ?, endpoint = ?, category_id = ?, method = ?, params = ?, example = ?, is_active = ?, updated_at = ? WHERE id = ?`,
          [name, description || null, endpoint, category_id || null, method || 'GET',
           params ? JSON.stringify(params) : null, example || null, is_active !== undefined ? is_active : 1, now, id]
        );

        const api = db.get(`
          SELECT apis.*, categories.name as category_name
          FROM apis LEFT JOIN categories ON apis.category_id = categories.id
          WHERE apis.id = ?`, [id]
        );

        return res.status(200).json({ message: 'API接口更新成功', api });
      } catch (error) {
        if (error.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'endpoint已存在' });
        }
        throw error;
      }
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'id必填' });
      }

      db.run('DELETE FROM apis WHERE id = ?', [id]);
      return res.status(200).json({ message: 'API接口删除成功' });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (error) {
    console.error('Admin APIs API error:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}

export default withAdminAuth(handler);
