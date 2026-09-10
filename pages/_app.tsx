import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { SiteSettingsProvider } from '@/hooks/useSiteSettings';
// 自托管字体：国内访问不再依赖 Google Fonts，构建产物自带字体文件
import '@fontsource-variable/noto-sans-sc';
import '@fontsource-variable/noto-serif-sc';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // 应用深色模式（主题由 _document 内联脚本 + SiteSettingsProvider 负责）
    const savedDarkMode = localStorage.getItem('theme');
    if (savedDarkMode === 'dark' || (!savedDarkMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <SiteSettingsProvider>
      <Component {...pageProps} />
    </SiteSettingsProvider>
  );
}

export default MyApp;
