// pages/api/auth/verify-email.js - 验证邮箱验证码
import { getDbAsync, generateApiKey } from '../../../lib/db';
import { hashPassword, generateToken } from '../../../lib/auth';
import { sendVerificationEmail } from '../../../lib/email';

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { email, action, username, password, verification_code } = req.body;

    if (!email) {
      return res.status(400).json({ error: '邮箱必填' });
    }

    const db = await getDbAsync();

    // 发送验证码
    if (action === 'send') {
      const existingEmail = db.get('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
      if (existingEmail) {
        return res.status(400).json({ error: '邮箱已被注册' });
      }

      const code = generateVerificationCode();
      const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      // 删除旧验证码记录
      db.run('DELETE FROM users WHERE email = ? AND is_active = 0', [email]);

      const now = new Date().toISOString();
      const apiKey = generateApiKey();

      db.run(
        `INSERT INTO users (username, password, email, email_verify_code, email_verify_expires, api_key, is_admin, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`temp_${Date.now()}`, hashPassword(Math.random().toString()), email, code, expires, apiKey, 0, 0, now, now]
      );

      const emailResult = await sendVerificationEmail(email, code);

      if (!emailResult.success) {
        return res.status(500).json({ error: '验证码发送失败', message: emailResult.error });
      }

      return res.status(200).json({ message: '验证码已发送', email });
    }

    // 验证验证码并注册
    if (action === 'verify') {
      if (!username || !password || !verification_code) {
        return res.status(400).json({ error: '用户名、密码和验证码必填' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: '密码长度至少6位' });
      }

      const existingUser = db.get('SELECT * FROM users WHERE username = ?', [username]);
      if (existingUser) {
        return res.status(400).json({ error: '用户名已存在' });
      }

      const pendingUser = db.get(
        'SELECT * FROM users WHERE email = ? AND email_verify_code = ? AND email_verify_expires > ? AND is_active = 0',
        [email, verification_code, new Date().toISOString()]
      );

      if (!pendingUser) {
        return res.status(400).json({ error: '验证码错误或已过期' });
      }

      const hashedPassword = hashPassword(password);
      db.run(
        'UPDATE users SET email_verified = 1, email_verify_code = NULL, email_verify_expires = NULL, password = ?, username = ?, is_active = 1 WHERE id = ?',
        [hashedPassword, username, pendingUser.id]
      );

      const user = db.get('SELECT * FROM users WHERE id = ?', [pendingUser.id]);
      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).json({ message: '注册成功', token, user: userWithoutPassword });
    }

    return res.status(400).json({ error: '无效的操作' });
  } catch (error) {
    console.error('Verify email API error:', error);
    return res.status(500).json({ error: '服务器内部错误', message: error.message });
  }
}
