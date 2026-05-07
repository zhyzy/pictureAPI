// pages/api/auth/login.js
import { getDbAsync } from '../../../lib/db';
import { verifyPassword, generateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码必填' });
    }

    const db = await getDbAsync();

    // 查找用户
    const user = db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 检查账号是否激活
    if (!user.is_active) {
      return res.status(403).json({ error: '账号已被禁用' });
    }

    // 生成 token
    const token = generateToken(user);

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: '登录成功',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login API error:', error);
    return res.status(500).json({ error: '服务器内部错误', message: error.message });
  }
}
