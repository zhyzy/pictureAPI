import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const normalizeTheme = (theme?: string | null) => theme && theme !== 'default' ? theme : 'nature';

    // 从服务器端获取主题设置（确保全站一致）
    const applyThemeFromServer = async () => {
      try {
        const res = await fetch('/api/settings/public');
        if (res.ok) {
          const data = await res.json();
          const serverTheme = normalizeTheme(data.settings?.site_theme);
          if (serverTheme) {
            document.documentElement.setAttribute('data-theme', serverTheme);
            localStorage.setItem('site_theme', serverTheme);
            // 应用主题特效
            initThemeEffectsClient(serverTheme);
          }
        }
      } catch {
        // 降级：使用本地存储的主题
      }
    };

    // 先用 localStorage 快速应用（避免主题闪烁）
    const savedTheme = normalizeTheme(localStorage.getItem('site_theme'));
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // 应用主题特效
    initThemeEffectsClient(savedTheme);

    // 再从服务器同步（覆盖为管理员设置的全局主题）
    applyThemeFromServer();

    // 应用深色模式
    const savedDarkMode = localStorage.getItem('theme');
    if (savedDarkMode === 'dark' || (!savedDarkMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 动态更新 favicon（从后台设置读取）
    const updateFavicon = async () => {
      try {
        const res = await fetch('/api/settings/public?_t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          const faviconUrl = data.settings?.site_favicon;
          if (faviconUrl) {
            // 更新或添加 favicon link 标签
            let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = faviconUrl;
          }
        }
      } catch (e) {
        // 使用默认 favicon
      }
    };
    updateFavicon();

    // 监听主题变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'site_theme' && e.newValue) {
        const nextTheme = normalizeTheme(e.newValue);
        document.documentElement.setAttribute('data-theme', nextTheme);
        initThemeEffectsClient(nextTheme);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return <Component {...pageProps} />;
}

/**
 * 客户端初始化主题特效
 */
function initThemeEffectsClient(themeId: string) {
  // 动态导入主题特效模块
  import('../lib/theme-effects.js').then(module => {
    if (module.initThemeEffects) {
      module.initThemeEffects(themeId);
    }
  }).catch(err => {
    console.warn('加载主题特效失败:', err);
  });
}

export default MyApp;
