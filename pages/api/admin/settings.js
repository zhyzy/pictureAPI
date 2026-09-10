// pages/api/admin/settings.js
import { getDbAsync } from '../../../lib/db';
import { withAdminAuth } from '../../../lib/auth';
import { getStorageStatus } from '../../../lib/storage';

async function handler(req, res) {
  try {
    const db = await getDbAsync();

    if (req.method === 'GET') {
      const settings = db.all('SELECT * FROM settings');
      const settingsObj = {};
      for (const setting of settings) {
        settingsObj[setting.key] = setting.value;
      }
      return res.status(200).json({ settings: settingsObj, storage: getStorageStatus() });
    }

    if (req.method === 'PUT') {
      const { key, value } = req.body;

      if (!key) {
        return res.status(400).json({ error: 'key必填' });
      }

      db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, String(value)]);

      return res.status(200).json({ message: '设置更新成功' });
    }

    if (req.method === 'POST') {
      const { settings } = req.body;

      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ error: 'settings必填，且为对象' });
      }

      for (const [key, value] of Object.entries(settings)) {
        db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, String(value)]);
      }

      return res.status(200).json({ message: '设置批量更新成功' });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (error) {
    console.error('Admin settings API error:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}

export default withAdminAuth(handler);
