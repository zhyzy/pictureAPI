import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/layout/AdminLayout';
import Link from 'next/link';

interface Stats {
  totalApis: number;
  totalCategories: number;
  totalRequests: number;
  todayRequests: number;
  totalUsers: number;
  todayNewUsers: number;
  activeUsers: number;
  totalImages: number;
  apiTrend: { date: string; count: number }[];
  userTrend: { date: string; count: number }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('获取统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="仪表盘">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-primary)] border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { label: 'API接口', value: stats?.totalApis || 0, href: '/admin/apis' },
    { label: '分类', value: stats?.totalCategories || 0, href: '/admin/categories' },
    { label: '图片', value: stats?.totalImages || 0, href: '/admin/images' },
    { label: '用户', value: stats?.totalUsers || 0, href: '/admin/users' },
    { label: '总请求', value: stats?.totalRequests || 0, href: null },
    { label: '今日请求', value: stats?.todayRequests || 0, href: null },
    { label: '今日新增', value: stats?.todayNewUsers || 0, href: '/admin/users' },
    { label: '活跃用户', value: stats?.activeUsers || 0, href: '/admin/users' },
  ];

  const maxApiCount = Math.max(...(stats?.apiTrend.map(t => t.count) || [1]));
  const maxUserCount = Math.max(...(stats?.userTrend.map(t => t.count) || [1]));

  return (
    <AdminLayout title="仪表盘">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="card card-hover">
            <p className="text-sm text-[var(--color-text-tertiary)] mb-1">{card.label}</p>
            <p className="text-2xl font-serif font-bold text-[var(--color-text)]">
              {card.value.toLocaleString()}
            </p>
            {card.href && (
              <Link href={card.href} className="text-xs text-[var(--color-primary)] hover:underline mt-2 inline-block">
                查看详情
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* 趋势 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API调用趋势 */}
        <div className="card">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">API 调用趋势（近7天）</h3>
          <div className="space-y-3">
            {stats?.apiTrend.map((item) => (
              <div key={item.date} className="flex items-center gap-3">
                <span className="w-14 text-xs text-[var(--color-text-tertiary)] shrink-0">
                  {item.date.slice(5)}
                </span>
                <div className="flex-1 h-6 bg-[var(--color-bg-subtle)] rounded overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-primary)] rounded transition-all duration-500"
                    style={{ width: `${Math.min(100, (item.count / maxApiCount) * 100)}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-medium text-[var(--color-text-secondary)] shrink-0">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 用户注册趋势 */}
        <div className="card">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">用户注册趋势（近7天）</h3>
          <div className="space-y-3">
            {stats?.userTrend.map((item) => (
              <div key={item.date} className="flex items-center gap-3">
                <span className="w-14 text-xs text-[var(--color-text-tertiary)] shrink-0">
                  {item.date.slice(5)}
                </span>
                <div className="flex-1 h-6 bg-[var(--color-bg-subtle)] rounded overflow-hidden">
                  <div
                    className="h-full bg-neutral-500 rounded transition-all duration-500"
                    style={{ width: `${Math.min(100, (item.count / maxUserCount) * 100)}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-medium text-[var(--color-text-secondary)] shrink-0">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="mt-8">
        <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">快速操作</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin/apis" className="card text-center hover:border-[var(--color-primary)] transition-colors">
            <div className="text-lg font-semibold text-[var(--color-text)] mb-1">管理 API</div>
            <p className="text-xs text-[var(--color-text-tertiary)]">添加或编辑接口</p>
          </Link>
          <Link href="/admin/images" className="card text-center hover:border-[var(--color-primary)] transition-colors">
            <div className="text-lg font-semibold text-[var(--color-text)] mb-1">上传图片</div>
            <p className="text-xs text-[var(--color-text-tertiary)]">添加图片到图库</p>
          </Link>
          <Link href="/admin/categories" className="card text-center hover:border-[var(--color-primary)] transition-colors">
            <div className="text-lg font-semibold text-[var(--color-text)] mb-1">管理分类</div>
            <p className="text-xs text-[var(--color-text-tertiary)]">编辑分类信息</p>
          </Link>
          <Link href="/admin/users" className="card text-center hover:border-[var(--color-primary)] transition-colors">
            <div className="text-lg font-semibold text-[var(--color-text)] mb-1">管理用户</div>
            <p className="text-xs text-[var(--color-text-tertiary)]">查看和管理用户</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
