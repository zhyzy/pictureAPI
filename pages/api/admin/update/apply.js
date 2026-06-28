import { withAdminAuth } from '../../../../lib/auth';
import { applyUpdate } from '../../../../lib/update';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const result = await applyUpdate();
    if (!result.success) {
      return res.status(result.code === 'UPDATE_DISABLED' || result.code === 'NOT_GIT_CHECKOUT' ? 400 : 500).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Apply update error:', error);
    return res.status(500).json({ error: '执行更新失败', message: error.message });
  }
}

export default withAdminAuth(handler);
