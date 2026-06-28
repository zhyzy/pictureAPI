import { withAdminAuth } from '../../../../lib/auth';
import { checkForUpdates } from '../../../../lib/update';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const status = await checkForUpdates();
    return res.status(200).json(status);
  } catch (error) {
    console.error('Update check error:', error);
    return res.status(500).json({ error: '检测更新失败', message: error.message });
  }
}

export default withAdminAuth(handler);
