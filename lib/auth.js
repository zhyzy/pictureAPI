// 认证工具函数
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDbAsync } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// 生成 JWT Token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, is_admin: user.is_admin },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 验证 JWT Token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// 获取当前用户（异步）
async function getCurrentUserAsync(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const db = await getDbAsync();
  const user = db.get('SELECT * FROM users WHERE id = ?', [decoded.id]);
  return user || null;
}

// 认证中间件
function withAuth(handler) {
  return async (req, res) => {
    const user = await getCurrentUserAsync(req);
    if (!user) {
      return res.status(401).json({ error: '未授权' });
    }

    req.user = user;
    return handler(req, res);
  };
}

// 管理员认证中间件
function withAdminAuth(handler) {
  return async (req, res) => {
    const user = await getCurrentUserAsync(req);
    if (!user) {
      return res.status(401).json({ error: '未授权' });
    }

    if (!user.is_admin) {
      return res.status(403).json({ error: '需要管理员权限' });
    }

    req.user = user;
    return handler(req, res);
  };
}

// 验证密码
function verifyPassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}

// 加密密码
function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

module.exports = {
  generateToken,
  verifyToken,
  getCurrentUserAsync,
  withAuth,
  withAdminAuth,
  verifyPassword,
  hashPassword,
  JWT_SECRET,
};
