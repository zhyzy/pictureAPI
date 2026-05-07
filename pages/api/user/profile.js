// pages/api/user/profile.js - 更新用户资料
import { getDbAsync } from '../../../lib/db';
import { withAuth } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const db = await getDbAsync();
    const userId = req.user.id;
    const { username, avatar } = req.body;

    // 验证用户名
    if (username && username.trim().length < 2) {
      return res.status(400).json({ error: '用户名至少需要2个字符' });
    }

    if (username && username.trim().length > 20) {
      return res.status(400).json({ error: '用户名最多20个字符' });
    }

    // 检查用户名是否已被其他用户使用
    if (username) {
      const existing = db.get(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username.trim(), userId]
      );
      if (existing) {
        return res.status(400).json({ error: '用户名已被使用' });
      }
    }

    // 更新用户资料
    if (username || avatar !== undefined) {
      const updates = [];
      const params = [];

      if (username) {
        updates.push('username = ?');
        params.push(username.trim());
      }

      if (avatar !== undefined) {
        updates.push('avatar = ?');
        params.push(avatar || '');
      }

      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(userId);

      db.run(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    // 获取更新后的用户信息
    const user = db.get(
      'SELECT id, username, email, avatar, api_key, is_admin, created_at FROM users WHERE id = ?',
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: '资料更新成功',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: '服务器内部错误', message: error.message });
  }
}

export default withAuth(handler);
