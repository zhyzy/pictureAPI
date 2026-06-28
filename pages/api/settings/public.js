// pages/api/settings/public.js - 公开获取网站设置
import { getDbAsync } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const db = await getDbAsync();

    const publicKeys = [
      'site_name', 'site_logo', 'site_icp', 'site_theme', 'site_favicon',
      'hero_tagline', 'hero_title', 'hero_subtitle', 'cta_title', 'cta_background_image',
      'hero_carousel_enabled', 'hero_carousel_mode', 'hero_carousel_interval', 'hero_carousel_height',
      'hero_carousel_overlay_opacity', 'hero_carousel_slides',
      'footer_links', 'header_links',
    ];
    const settings = {};

    for (const key of publicKeys) {
      const result = db.get('SELECT value FROM settings WHERE key = ?', [key]);
      settings[key] = result ? result.value : '';
    }

    return res.status(200).json({ settings });
  } catch (error) {
    console.error('Public settings API error:', error);
    return res.status(500).json({ error: '服务器内部错误', message: error.message });
  }
}
