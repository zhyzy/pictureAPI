import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

type AdminIconName = 'dashboard' | 'categories' | 'apis' | 'images' | 'users' | 'settings' | 'update';

const adminIconPaths: Record<AdminIconName, string> = {
  dashboard: 'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0L6.75 21M7.5 9.75v.008h.008V9.75H7.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 9.75v.008h.008V9.75H12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0v.008h.008V9.75H16.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  categories: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
  apis: 'M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.648.349-1.015C15 3.077 14.172 2.25 13.136 2.25c-.367 0-.725.128-1.015.349-.283.215-.604.401-.959.401h-.324c-.355 0-.676-.186-.959-.401A1.84 1.84 0 008.864 2.25C7.828 2.25 7 3.077 7 4.113c0 .367.128.725.349 1.015.215.283.401.604.401.959v.324c0 .355-.186.676-.401.959A1.84 1.84 0 007 8.386c0 1.036.828 1.864 1.864 1.864.367 0 .725-.128 1.015-.349.283-.215.604-.401.959-.401h.324c.355 0 .676.186.959.401.29.221.648.349 1.015.349 1.036 0 1.864-.828 1.864-1.864 0-.367-.128-.725-.349-1.015-.215-.283-.401-.604-.401-.959v-.324zM12 12.75v6.75m0 0l-3-3m3 3l3-3',
  images: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  users: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a5.971 5.971 0 00-.941 3.197m0 0l-.001.031c0 .225.012.447.037.666M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
  settings: 'M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.35.78.746.944.082.034.163.07.242.107.38.18.833.113 1.174-.137l.737-.54a1.125 1.125 0 011.45.12l.773.774c.389.389.44 1.002.12 1.45l-.54.737c-.25.341-.317.793-.137 1.174.037.08.073.16.107.242.164.397.52.676.944.746l.894.149c.542.09.94.56.94 1.11v1.093c0 .55-.398 1.02-.94 1.11l-.894.149c-.424.07-.78.35-.944.746a7.7 7.7 0 01-.107.242c-.18.38-.113.833.137 1.174l.54.737c.32.448.269 1.061-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.737-.54c-.341-.25-.793-.317-1.174-.137a6.932 6.932 0 01-.242.107c-.397.164-.676.52-.746.944l-.149.894c-.09.542-.56.94-1.11.94h-1.093c-.55 0-1.02-.398-1.11-.94l-.149-.894c-.07-.424-.35-.78-.746-.944a6.932 6.932 0 01-.242-.107c-.38-.18-.833-.113-1.174.137l-.737.54a1.125 1.125 0 01-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.54-.737c.25-.341.317-.793.137-1.174a7.7 7.7 0 01-.107-.242c-.164-.397-.52-.676-.944-.746l-.894-.149a1.125 1.125 0 01-.94-1.11v-1.093c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.78-.35.944-.746.034-.082.07-.163.107-.242.18-.38.113-.833-.137-1.174l-.54-.737a1.125 1.125 0 01.12-1.45l.774-.773a1.125 1.125 0 011.449-.12l.737.54c.341.25.793.317 1.174.137.08-.037.16-.073.242-.107.397-.164.676-.52.746-.944l.149-.894zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
  update: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M21.015 4.356v4.992m0 0h-4.992m4.992 0l-3.181-3.183a8.25 8.25 0 00-13.803 3.7',
};

function AdminNavIcon({ name }: { name: AdminIconName }) {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={adminIconPaths[name]} />
    </svg>
  );
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState({ site_name: '樱道 API', site_logo: '' });

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

  useEffect(() => {
    fetch(`/api/settings/public?_t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.settings) {
          setSiteSettings({
            site_name: data.settings.site_name || '樱道 API',
            site_logo: data.settings.site_logo || '',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const navItems = [
    { href: '/admin', label: '仪表盘', icon: 'dashboard' as const },
    { href: '/admin/categories', label: '分类管理', icon: 'categories' as const },
    { href: '/admin/apis', label: 'API管理', icon: 'apis' as const },
    { href: '/admin/images', label: '图片管理', icon: 'images' as const },
    { href: '/admin/users', label: '用户管理', icon: 'users' as const },
    { href: '/admin/settings', label: '系统设置', icon: 'settings' as const },
    { href: '/admin/update', label: '系统更新', icon: 'update' as const },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Head>
        <title>{title} - 管理后台 - {siteSettings.site_name}</title>
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
                {siteSettings.site_logo ? (
                  <img
                    src={siteSettings.site_logo}
                    alt={siteSettings.site_name}
                    className="w-7 h-7 object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-7 h-7 bg-[var(--color-primary)] rounded flex items-center justify-center text-white text-sm font-serif font-bold">
                    {siteSettings.site_name.charAt(0) || '樱'}
                  </div>
                )}
                <span className="font-serif font-bold text-[var(--color-text)]">{siteSettings.site_name}</span>
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
                className={`flex items-center gap-3 px-3 py-2.5 mt-1 rounded-md text-sm font-medium transition-colors ${
                  router.pathname === item.href
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]'
                }`}
              >
                <AdminNavIcon name={item.icon} />
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
