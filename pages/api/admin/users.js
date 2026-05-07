// pages/api/admin/users.js
import { getDbAsync, generateApiKey } from '../../../lib/db';
import { withAdminAuth, hashPassword } from '../../../lib/auth';

async function handler(req, res) {
  try {
    const db = await getDbAsync();

    if (req.method === 'GET') {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const search = req.query.search;

      let query = 'SELECT * FROM users WHERE 1=1';
      let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
      let params = [];
      let countParams = [];

      if (search) {
        query += ' AND (username LIKE ? OR email LIKE ?)';
        countQuery += ' AND (username LIKE ? OR email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
        countParams.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const users = db.all(query, params);
      const totalResult = db.get(countQuery, countParams);
      const total = totalResult ? totalResult.total : 0;
      const totalPages = Math.ceil(total / limit);

      const usersWithoutPassword = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return res.status(200).json({
        users: usersWithoutPassword,
        pagination: { page, limit, total, totalPages },
      });
    }

    if (req.method === 'POST') {
      const { username, password, email, is_admin, rate_limit } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码必填' });
      }

      const hashedPassword = hashPassword(password);
      const apiKey = generateApiKey();
      const now = new Date().toISOString();

      try {
        db.run(
          `INSERT INTO users (username, password, email, api_key, is_admin, is_active, rate_limit, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [username, hashedPassword, email || null, apiKey, is_admin ? 1 : 0, 1, rate_limit || null, now, now]
        );

        const lastId = db.get('SELECT last_insert_rowid() as id');
        const user = db.get('SELECT * FROM users WHERE id = ?', [lastId.id]);
        const { password: _, ...userWithoutPassword } = user;

        return res.status(201).json({ message: '用户创建成功', user: userWithoutPassword });
      } catch (error) {
        if (error.message.includes('UNIQUE')) {
          return res.status(400).json({ error: '用户名或邮箱已存在' });
        }
        throw error;
      }
    }

    if (req.method === 'PUT') {
      const { id, email, password, is_admin, is_active, rate_limit } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'id必填' });
      }

      const now = new Date().toISOString();
      const updates = [];
      const params = [];

      if (email !== undefined) { updates.push('email = ?'); params.push(email); }
      if (password) { updates.push('password = ?'); params.push(hashPassword(password)); }
      if (is_admin !== undefined) { updates.push('is_admin = ?'); params.push(is_admin ? 1 : 0); }
      if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }
      if (rate_limit !== undefined) { updates.push('rate_limit = ?'); params.push(rate_limit); }
      updates.push('updated_at = ?');
      params.push(now);
      params.push(id);

      db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

      const user = db.get('SELECT * FROM users WHERE id = ?', [id]);
      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).json({ message: '用户更新成功', user: userWithoutPassword });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'id必填' });
      }

      if (id == req.user.id) {
        return res.status(400).json({ error: '不能删除自己' });
      }

      db.run('DELETE FROM users WHERE id = ?', [id]);
      return res.status(200).json({ message: '用户删除成功' });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (error) {
    console.error('Admin users API error:', error);
    return res.status(500).json({ error: '服务器内部错误', message: error.message });
  }
}

export default withAdminAuth(handler);
