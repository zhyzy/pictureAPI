// pages/api/auth/me.js
import { getCurrentUserAsync } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const user = await getCurrentUserAsync(req);
    
    if (!user) {
      return res.status(401).json({ error: '未授权' });
    }

    // 返回用户信息（不包含密码）
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Me API error:', error);
    return res.status(500).json({ error: '服务器内部错误', message: error.message });
  }
}
