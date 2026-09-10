import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ThemeToggle from '../ui/ThemeToggle';
import { useRouter } from 'next/router';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface HeaderLink {
  label: string;
  href: string;
}

const defaultHeaderLinks: HeaderLink[] = [
  { href: '/', label: '首页' },
  { href: '/gallery', label: '图库' },
  { href: '/docs', label: '文档' },
  { href: '/example', label: '示例' },
];

interface User {
  id?: number;
  username: string;
  email: string;
  avatar?: string;
}

interface HeaderProps {
  overlay?: boolean;
  backgroundImage?: string;
  overlayOpacity?: number;
}

const Header: React.FC<HeaderProps> = ({ overlay = false, backgroundImage = '', overlayOpacity = 0.72 }) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const siteSettings = useSiteSettings();
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 从 localStorage 读取登录状态
  const loadUser = () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        setUser(JSON.parse(userStr));
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data?.user) {
              localStorage.setItem('user', JSON.stringify(data.user));
              setUser(data.user);
            }
          })
          .catch(() => {});
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    // 监听登录/登出事件（跨组件同步状态）
    window.addEventListener('auth-change', loadUser);
    // Next.js 路由切换后也刷新登录状态
    router.events.on('routeChangeComplete', loadUser);
    return () => {
      window.removeEventListener('auth-change', loadUser);
      router.events.off('routeChangeComplete', loadUser);
    };
  }, [router.events]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 解析顶部导航链接
  const headerLinks = useMemo<HeaderLink[]>(() => {
    if (siteSettings.header_links) {
      try {
        const parsed = JSON.parse(siteSettings.header_links);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        console.error('解析 header_links 失败');
      }
    }
    return defaultHeaderLinks;
  }, [siteSettings.header_links]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  };

  // Logo 显示首字
  const logoChar = siteSettings.site_name ? siteSettings.site_name.charAt(0) : 'Z';

  // 用户头像/初始字母
  const userInitial = user ? (user.username ? user.username.charAt(0).toUpperCase() : '?') : '';

  const renderUserAvatar = () => {
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.username}
          className="w-8 h-8 rounded-full object-cover border border-[var(--color-border)]"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }

    return (
      <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold">
        {userInitial}
      </div>
    );
  };

  const overlayActive = !scrolled && overlay && backgroundImage;
  const headerStyle = overlayActive ? ({
    '--hero-bg-image': `url("${backgroundImage}")`,
    '--hero-overlay-alpha': overlayOpacity,
    backgroundPosition: 'center top',
  } as React.CSSProperties) : undefined;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--color-bg)]/95 backdrop-blur-sm shadow-subtle border-b border-[var(--color-border)]'
          : overlayActive
            ? 'hero-background-surface hero-header-on-image border-b border-[var(--color-border)]'
            : 'bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-border)]'
      }`}
      style={headerStyle}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {siteSettings.site_logo ? (
              <img
                src={siteSettings.site_logo}
                alt={siteSettings.site_name}
                className="w-8 h-8 object-contain rounded transition-transform duration-200 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 bg-[var(--color-primary)] rounded-md flex items-center justify-center text-white text-sm font-serif font-bold transition-transform duration-200 group-hover:scale-105">
                {logoChar}
              </div>
            )}
            <span className="hero-header-title text-lg font-serif font-bold text-[var(--color-text)] leading-tight">
              {siteSettings.site_name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {headerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hero-header-link px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-md hover:bg-[var(--color-bg-subtle)] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {user ? (
              /* 已登录：用户头像 + 下拉菜单 */
              <div className="hidden md:flex items-center relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="hero-header-account flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-[var(--color-bg-subtle)] transition-colors"
                >
                  {renderUserAvatar()}
                  <span className="hero-header-user text-sm text-[var(--color-text)] max-w-[100px] truncate">
                    {user.username}
                  </span>
                  <svg className="w-3 h-3 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 下拉菜单 */}
                {dropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-44 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg shadow-lg py-1 z-50">
                    <Link
                      href="/user/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                    >
                      个人中心
                    </Link>
                    <Link
                      href="/user/docs"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                    >
                      我的文档
                    </Link>
                    <div className="my-1 border-t border-[var(--color-border)]"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-error-DEFAULT hover:bg-[var(--color-bg-subtle)]"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* 未登录：登录/注册按钮 */
              <div className="hidden md:flex items-center gap-2 ml-2">
                <Link
                  href="/auth/login"
                  className="hero-header-link px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-md hover:bg-[var(--color-bg-subtle)] transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary text-sm"
                >
                  注册
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="hero-header-link md:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-md hover:bg-[var(--color-bg-subtle)] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-[var(--color-border)]">
            <div className="flex flex-col gap-1">
              {headerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hero-header-link px-3 py-2.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2.5 border-t border-[var(--color-border)] mt-1">
                    {renderUserAvatar()}
                    <span className="hero-header-user text-sm text-[var(--color-text)]">{user.username}</span>
                  </div>
                  <Link
                    href="/user/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] rounded-md"
                  >
                    个人中心
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left px-3 py-2.5 text-sm text-error-DEFAULT hover:bg-[var(--color-bg-subtle)] rounded-md"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hero-header-link flex-1 text-center px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-bg-subtle)] transition-colors"
                  >
                    登录
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center px-4 py-2.5 text-sm font-medium bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>

      {/* 点击外部关闭下拉菜单 */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
      )}
    </header>
  );
};

export default Header;
