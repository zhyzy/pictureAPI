// pages/api/auth/register.js
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
    const { username, password, email, verification_code } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码必填' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少6位' });
    }

    const db = await getDbAsync();

    // 检查用户名是否已存在
    const existingUser = db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = db.get('SELECT * FROM users WHERE email = ?', [email]);
      if (existingEmail) {
        return res.status(400).json({ error: '邮箱已被注册' });
      }
    }

    // 如果提供了邮箱和验证码，验证验证码
    if (email && verification_code) {
      const pendingUser = db.get(
        'SELECT * FROM users WHERE email = ? AND email_verify_code = ? AND email_verify_expires > ?',
        [email, verification_code, new Date().toISOString()]
      );

      if (!pendingUser) {
        return res.status(400).json({ error: '验证码错误或已过期' });
      }

      // 更新用户为已验证
      db.run(
        'UPDATE users SET email_verified = 1, email_verify_code = NULL, email_verify_expires = NULL, password = ?, username = ? WHERE id = ?',
        [hashPassword(password), username, pendingUser.id]
      );

      const user = db.get('SELECT * FROM users WHERE id = ?', [pendingUser.id]);
      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).json({ message: '注册成功', token, user: userWithoutPassword });
    }

    // 如果提供了邮箱但没有验证码，发送验证码
    if (email && !verification_code) {
      const code = generateVerificationCode();
      const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const now = new Date().toISOString();
      const apiKey = generateApiKey();

      db.run(
        `INSERT INTO users (username, password, email, email_verify_code, email_verify_expires, api_key, is_admin, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`temp_${Date.now()}`, hashPassword(Math.random().toString()), email, code, expires, apiKey, 0, 0, now, now]
      );

      const emailResult = sendVerificationEmail(email, code);

      if (!emailResult.success) {
        return res.status(500).json({ error: '验证码发送失败', message: emailResult.error });
      }

      return res.status(200).json({ message: '验证码已发送', email, requiresVerification: true });
    }

    // 没有邮箱，直接注册
    const hashedPassword = hashPassword(password);
    const apiKey = generateApiKey();
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO users (username, password, email, api_key, is_admin, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, email || null, apiKey, 0, 1, now, now]
    );

    const user = db.get('SELECT * FROM users WHERE username = ?', [username]);
    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({ message: '注册成功', token, user: userWithoutPassword });
  } catch (error) {
    console.error('Register API error:', error);
    return res.status(500).json({ error: '服务器内部错误', message: error.message });
  }
}
