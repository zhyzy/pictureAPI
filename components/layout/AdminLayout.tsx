import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/auth/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (!userData.is_admin) {
      router.push('/user/dashboard');
      return;
    }

    setUser(userData);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const navItems = [
    { href: '/admin', label: '仪表盘' },
    { href: '/admin/categories', label: '分类管理' },
    { href: '/admin/apis', label: 'API管理' },
    { href: '/admin/images', label: '图片管理' },
    { href: '/admin/users', label: '用户管理' },
    { href: '/admin/settings', label: '系统设置' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Head>
        <title>{title} - 管理后台 - 樱道 API</title>
      </Head>

      {/* 顶部导航 */}
      <nav className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-14">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-md hover:bg-[var(--color-bg-subtle)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[var(--color-primary)] rounded flex items-center justify-center text-white text-sm font-serif font-bold">
                  樱
                </div>
                <span className="font-serif font-bold text-[var(--color-text)]">樱道 API</span>
              </Link>
              <span className="hidden sm:inline-flex px-2 py-0.5 bg-[var(--color-primary-subtle)] text-[var(--color-primary)] text-xs font-medium rounded">
                管理后台
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--color-text-secondary)] hidden sm:block">
                {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex max-w-7xl mx-auto">
        {/* 侧边栏 */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-64 shrink-0 border-r border-[var(--color-border)] min-h-[calc(100vh-3.5rem)]`}>
          <nav className="p-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-2.5 mt-1 rounded-md text-sm font-medium transition-colors ${
                  router.pathname === item.href
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* 主内容 */}
        <main className="flex-1 p-6 lg:p-8">
          <h1 className="text-xl font-serif font-bold text-[var(--color-text)] mb-6">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}
