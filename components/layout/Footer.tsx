import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface FooterLink {
  label: string;
  href: string;
}

interface SiteSettings {
  site_name: string;
  site_icp: string;
  footer_links: string;
}

const defaultFooterLinks: FooterLink[] = [
  { href: '/docs', label: 'API文档' },
  { href: '/example', label: '使用示例' },
  { href: '/gallery', label: '图库' },
  { href: '/auth/login', label: '管理后台' },
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ site_name: '樱道 API', site_icp: '', footer_links: '' });
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>(defaultFooterLinks);

  useEffect(() => {
    fetchSettings();
    
    // 每30秒刷新一次设置
    const interval = setInterval(fetchSettings, 30000);
    
    // 当页面重新获得焦点时也刷新
    window.addEventListener('focus', fetchSettings);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', fetchSettings);
    };
  }, []);

  const fetchSettings = () => {
    fetch(`/api/settings/public?_t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.settings) {
          setSiteSettings({
            site_name: data.settings.site_name || '樱道 API',
            site_icp: data.settings.site_icp || '',
            footer_links: data.settings.footer_links || '',
          });
          
          // 解析 footer_links
          if (data.settings.footer_links) {
            try {
              const parsed = JSON.parse(data.settings.footer_links);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setFooterLinks(parsed);
              }
            } catch {
              console.error('解析 footer_links 失败');
            }
          }
        }
      })
      .catch(() => {});
  };

  const logoChar = siteSettings.site_name ? siteSettings.site_name.charAt(0) : '樱';

  return (
    <footer className="border-t border-[var(--color-border)] mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Info */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <div className="w-6 h-6 bg-[var(--color-primary)] rounded flex items-center justify-center text-white text-xs font-serif font-bold">
                {logoChar}
              </div>
              <span className="font-serif font-bold text-[var(--color-text)]">{siteSettings.site_name}</span>
            </div>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              高质量图片接口服务
            </p>
          </div>
          
          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
          <p className="text-xs text-[var(--color-text-tertiary)]">
            &copy; {currentYear} {siteSettings.site_name}. 保留所有权利。
            {siteSettings.site_icp && (
              <>
                {' '}&middot;{' '}
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  {siteSettings.site_icp}
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
