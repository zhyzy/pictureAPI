// pages/api/settings/public.js - 公开获取网站设置
import { getDbAsync } from '../../../lib/db';
import { rewriteToProxyUrl } from '../../../lib/qiniu';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const db = await getDbAsync();

    const publicKeys = [
      'site_name', 'site_logo', 'site_icp', 'site_theme', 'site_favicon', 'site_url',
      'hero_tagline', 'hero_title', 'hero_subtitle', 'cta_title', 'cta_background_image',
      'hero_carousel_enabled', 'hero_carousel_mode', 'hero_carousel_interval', 'hero_carousel_height',
      'hero_carousel_overlay_opacity', 'hero_carousel_slides',
      'footer_links', 'header_links',
    ];
    const allowed = new Set(publicKeys);
    const settings = {};
    for (const key of publicKeys) settings[key] = '';

    // 一次取全表，再过滤公开字段
    const rows = db.all('SELECT key, value FROM settings');
    for (const row of rows) {
      if (allowed.has(row.key)) {
        settings[row.key] = row.value ?? '';
      }
    }

    // CSS 背景图无法设置 crossOrigin，七牛外链在部分浏览器会被 ORB 拦截，
    // 输出前把本桶外链统一重写为同源代理路径（仅展示层重写，不影响 DB 存储的原始值）
    for (const key of ['site_logo', 'site_favicon', 'cta_background_image']) {
      settings[key] = rewriteToProxyUrl(settings[key]);
    }
    try {
      const slides = JSON.parse(settings.hero_carousel_slides || '[]');
      if (Array.isArray(slides)) {
        settings.hero_carousel_slides = JSON.stringify(
          slides.map((slide) => ({ ...slide, background: rewriteToProxyUrl(slide.background) }))
        );
      }
    } catch {
      // 轮播内容 JSON 异常时保持原样，由页面侧容错
    }

    return res.status(200).json({ settings });
  } catch (error) {
    console.error('Public settings API error:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}
