import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface SiteSettings {
  site_name: string;
  site_logo?: string;
  site_icp?: string;
  site_theme?: string;
  site_favicon?: string;
  footer_links?: string;
  header_links?: string;
  hero_tagline?: string;
  hero_title?: string;
  hero_subtitle?: string;
  cta_title?: string;
  cta_background_image?: string;
  hero_carousel_enabled?: string;
  hero_carousel_mode?: string;
  hero_carousel_interval?: string;
  hero_carousel_height?: string;
  hero_carousel_overlay_opacity?: string;
  hero_carousel_slides?: string;
  [key: string]: string | undefined;
}

const defaultSettings: SiteSettings = {
  site_name: 'ZL-综合API',
};

const SiteSettingsContext = createContext<SiteSettings>(defaultSettings);

// 主题归一化：与 _document.tsx 内联脚本保持一致
export function normalizeTheme(theme?: string | null) {
  return theme && theme !== 'default' ? theme : 'nature';
}

function initThemeEffects(themeId: string) {
  import('../lib/theme-effects.js')
    .then((module) => {
      if (module.initThemeEffects) module.initThemeEffects(themeId);
    })
    .catch(() => {});
}

function applyFavicon(faviconUrl?: string) {
  if (!faviconUrl) return;
  let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = faviconUrl;
}

/**
 * 全站设置唯一数据源：
 * 挂载后单例轮询 /api/settings/public（30 秒 + 窗口聚焦时），
 * 负责把站点主题和 favicon 同步到 <html>，各组件通过 useSiteSettings() 读取。
 */
export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    // 先用本地缓存恢复，避免首屏闪默认值
    try {
      const cached = localStorage.getItem('site_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') setSettings({ ...defaultSettings, ...parsed });
      }
    } catch {}

    // data-theme 已由 _document 内联脚本在首帧前设置，这里只负责初始化主题特效
    initThemeEffects(document.documentElement.getAttribute('data-theme') || 'nature');

    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/settings/public', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data?.settings) return;

        const next: SiteSettings = { ...defaultSettings, ...data.settings };
        setSettings(next);
        try {
          localStorage.setItem('site_settings', JSON.stringify(data.settings));
        } catch {}

        // 主题同步：与当前应用的主题不同才切换并重载特效
        const theme = normalizeTheme(next.site_theme);
        try {
          localStorage.setItem('site_theme', theme);
        } catch {}
        if (document.documentElement.getAttribute('data-theme') !== theme) {
          document.documentElement.setAttribute('data-theme', theme);
          initThemeEffects(theme);
        }

        applyFavicon(next.site_favicon);
      } catch {
        // 网络失败时沿用本地缓存
      }
    };

    load();
    const interval = setInterval(load, 30000);
    window.addEventListener('focus', load);

    // 跨标签页主题同步
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'site_theme' && e.newValue) {
        const nextTheme = normalizeTheme(e.newValue);
        document.documentElement.setAttribute('data-theme', nextTheme);
        initThemeEffects(nextTheme);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('focus', load);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
