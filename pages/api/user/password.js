// pages/api/user/password.js - 更新用户密码
import { getDbAsync } from '../../../lib/db';
import { withAuth } from '../../../lib/auth';
const bcrypt = require('bcryptjs');

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const db = await getDbAsync();
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // 验证必填字段
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: '请填写所有密码字段' });
    }

    // 验证新密码长度
    if (newPassword.length < 6) {
      return res.status(400).json({ error: '新密码至少需要6个字符' });
    }

    if (newPassword.length > 50) {
      return res.status(400).json({ error: '新密码最多50个字符' });
    }

    // 获取当前用户信息
    const user = db.get('SELECT password FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 验证当前密码
    const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '当前密码错误' });
    }

    // 哈希新密码并更新
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.run(
      'UPDATE users SET password = ?, updated_at = ? WHERE id = ?',
      [hashedPassword, new Date().toISOString(), userId]
    );

    return res.status(200).json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ error: '服务器内部错误', message: error.message });
  }
}

export default withAuth(handler);
