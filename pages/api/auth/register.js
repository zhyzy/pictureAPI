// pages/api/auth/register.js
import { getDbAsync, generateApiKey } from '../../../lib/db';
import { hashPassword, generateToken } from '../../../lib/auth';
import { sendVerificationEmail } from '../../../lib/email';

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizeEmail(email) {
  return typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
}

function isValidUsername(username) {
  return /^[a-zA-Z0-9_-]{3,32}$/.test(username);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getRandomDefaultAvatar() {
  const avatars = ['/avatars/default-cat.png', '/avatars/default-penguin.png'];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const email = normalizeEmail(req.body.email);
    const verification_code = typeof req.body.verification_code === 'string' ? req.body.verification_code.trim() : '';

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码必填' });
    }

    if (!isValidUsername(username)) {
      return res.status(400).json({ error: '用户名需为3-32位字母、数字、下划线或短横线' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少6位' });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: '邮箱格式不正确' });
    }

    const db = await getDbAsync();

    // 检查用户名是否已存在
    const existingUser = db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
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
        'UPDATE users SET email_verified = 1, email_verify_code = NULL, email_verify_expires = NULL, password = ?, username = ?, avatar = ?, is_active = 1, updated_at = ? WHERE id = ?',
        [hashPassword(password), username, getRandomDefaultAvatar(), new Date().toISOString(), pendingUser.id]
      );

      const user = db.get('SELECT * FROM users WHERE id = ?', [pendingUser.id]);
      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).json({ message: '注册成功', token, user: userWithoutPassword });
    }

    // 如果提供了邮箱但没有验证码，发送验证码
    if (email && !verification_code) {
      const existingEmail = db.get('SELECT * FROM users WHERE email = ? AND email_verified = 1', [email]);
      if (existingEmail) {
        return res.status(400).json({ error: '邮箱已被注册' });
      }

      const code = generateVerificationCode();
      const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const now = new Date().toISOString();
      const apiKey = generateApiKey();
      const tempUsername = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      db.run(
        `INSERT INTO users (username, password, email, email_verify_code, email_verify_expires, api_key, is_admin, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tempUsername, hashPassword(Math.random().toString()), email, code, expires, apiKey, 0, 0, now, now]
      );

      const emailResult = await sendVerificationEmail(email, code);

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
      `INSERT INTO users (username, password, email, avatar, api_key, is_admin, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, email || null, getRandomDefaultAvatar(), apiKey, 0, 1, now, now]
    );

    const user = db.get('SELECT * FROM users WHERE username = ?', [username]);
    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({ message: '注册成功', token, user: userWithoutPassword });
  } catch (error) {
    console.error('Register API error:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}
