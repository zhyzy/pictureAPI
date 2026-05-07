import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  api_key: string;
  is_admin: number;
  created_at: string;
}

interface UserStats {
  totalRequests: number;
  todayRequests: number;
  recentLogs: any[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copyField, setCopyField] = useState('');

  // 编辑功能状态
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editMessage, setEditMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // 获取完整的 API 基础 URL
  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  // 复制文本到剪贴板
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopyField(field);
    setTimeout(() => setCopyField(''), 2000);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/auth/login');
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);
    fetchStats(token);
    fetchCategories();
  }, []);

  // 从 API 动态获取分类列表
  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/categories?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error('获取分类列表失败:', e);
    }
  };

  const fetchStats = async (token: string) => {
    try {
      const res = await fetch('/api/user/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('获取统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const copyApiKey = () => {
    if (user?.api_key) {
      navigator.clipboard.writeText(user.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 开始编辑资料
  const startEdit = () => {
    setEditUsername(user?.username || '');
    setEditAvatar(user?.avatar || '');
    setIsEditing(true);
    setEditMessage(null);
  };

  // 保存资料
  const saveProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editUsername,
          avatar: editAvatar,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setEditMessage({ type: 'success', text: '资料更新成功' });
        // 更新本地存储的用户信息
        const updatedUser = { ...user, username: editUsername, avatar: editAvatar };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditing(false);
      } else {
        setEditMessage({ type: 'error', text: data.error || '更新失败' });
      }
    } catch (e) {
      setEditMessage({ type: 'error', text: '网络错误，请重试' });
    }
  };

  // 修改密码
  const savePassword = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (newPassword !== confirmPassword) {
      setEditMessage({ type: 'error', text: '两次输入的密码不一致' });
      return;
    }

    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setEditMessage({ type: 'success', text: '密码修改成功' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsEditingPassword(false);
      } else {
        setEditMessage({ type: 'error', text: data.error || '修改失败' });
      }
    } catch (e) {
      setEditMessage({ type: 'error', text: '网络错误，请重试' });
    }
  };

  // 获取用户头像
  const getUserAvatar = () => {
    if (user?.avatar && user.avatar.trim()) {
      return user.avatar;
    }
    // 默认头像
    return `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'U'}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-primary)] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-[var(--color-text-tertiary)]">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Head>
        <title>用户仪表盘 - 樱道 API</title>
      </Head>

      <Header />

      <main className="flex-grow py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* 欢迎区域 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {/* 头像 */}
              <img
                src={getUserAvatar()}
                alt="头像"
                className="w-16 h-16 rounded-full bg-[var(--color-bg-subtle)] border-2 border-[var(--color-border)]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'U'}`;
                }}
              />
              <div>
                <h1 className="text-2xl font-serif font-bold text-[var(--color-text)] mb-1">
                  欢迎回来，{user?.username}
                </h1>
                <p className="text-sm text-[var(--color-text-tertiary)]">
                  注册于 {new Date(user?.created_at || '').toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setIsEditing(true); setEditMessage(null); }}
                className="btn-secondary text-sm"
              >
                编辑资料
              </button>
              {user?.is_admin === 1 && (
                <Link href="/admin" className="btn-primary text-sm">
                  管理后台
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm"
              >
                退出登录
              </button>
            </div>
          </div>

          {/* 消息提示 */}
          {editMessage && (
            <div className={`mb-4 p-3 rounded-md text-sm ${
              editMessage.type === 'success'
                ? 'bg-success-light/20 text-success-DEFAULT border border-success-DEFAULT/30'
                : 'bg-error-light/20 text-error-DEFAULT border border-error-DEFAULT/30'
            }`}>
              {editMessage.text}
            </div>
          )}

          {/* 编辑资料面板 */}
          {isEditing && (
            <div className="card mb-6 border-2 border-[var(--color-primary)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">编辑资料</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]"
                >
                  ✕
                </button>
              </div>

              {/* 头像编辑 */}
              <div className="mb-4">
                <label className="label">头像</label>
                <div className="flex items-center gap-4">
                  <img
                    src={editAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${editUsername || 'U'}`}
                    alt="头像预览"
                    className="w-16 h-16 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border)]"
                  />
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="输入头像图片URL"
                    className="input flex-1"
                  />
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                  填写图片URL地址（如 https://example.com/avatar.jpg）
                </p>
              </div>

              {/* 用户名编辑 */}
              <div className="mb-4">
                <label className="label">用户名</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="输入用户名"
                  className="input"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={saveProfile} className="btn-primary">
                  保存资料
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={() => { setIsEditing(false); setIsEditingPassword(true); setEditMessage(null); }}
                  className="btn-secondary"
                >
                  修改密码
                </button>
              </div>
            </div>
          )}

          {/* 修改密码面板 */}
          {isEditingPassword && (
            <div className="card mb-6 border-2 border-[var(--color-primary)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">修改密码</h2>
                <button
                  onClick={() => setIsEditingPassword(false)}
                  className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <label className="label">当前密码</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="输入当前密码"
                  className="input"
                />
              </div>

              <div className="mb-4">
                <label className="label">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="输入新密码（至少6位）"
                  className="input"
                />
              </div>

              <div className="mb-4">
                <label className="label">确认新密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入新密码"
                  className="input"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={savePassword} className="btn-primary">
                  确认修改
                </button>
                <button
                  onClick={() => setIsEditingPassword(false)}
                  className="btn-secondary"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* API Key */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">
              API Key
            </h2>
            <p className="text-sm text-[var(--color-text-tertiary)] mb-4">
              使用此 Key 调用 API 接口，请妥善保管
            </p>
            <div className="flex items-center gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={user?.api_key || ''}
                readOnly
                className="input font-mono text-sm flex-1"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="btn-secondary p-2.5"
                title={showKey ? '隐藏' : '显示'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showKey ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
              <button
                onClick={copyApiKey}
                className={`btn-primary p-2.5 ${copied ? 'bg-success-DEFAULT' : ''}`}
                title="复制"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <Link
                href={`/example?key=${user?.api_key || ''}`}
                className="btn-secondary text-sm whitespace-nowrap"
              >
                体验 API
              </Link>
            </div>
            {copied && (
              <p className="text-xs text-success-DEFAULT mt-2">已复制到剪贴板</p>
            )}
          </div>

          {/* 统计 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="card">
              <p className="text-sm text-[var(--color-text-tertiary)] mb-1">今日请求</p>
              <p className="text-3xl font-serif font-bold text-[var(--color-text)]">
                {stats?.todayRequests || 0}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-[var(--color-text-tertiary)] mb-1">累计请求</p>
              <p className="text-3xl font-serif font-bold text-[var(--color-text)]">
                {stats?.totalRequests || 0}
              </p>
            </div>
          </div>

          {/* API 使用示例 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
              API 使用示例
            </h2>

            {/* 完整链接示例 */}
            <div className="mb-4">
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">🔗 完整 API 链接（可直接在浏览器中打开）</p>
              {(categories.length > 0 ? categories : []).map((cat) => (
                <div key={cat.slug} className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-[var(--color-text-tertiary)] w-16 shrink-0">{cat.name}</span>
                  <code className="flex-1 text-xs bg-[var(--color-bg-subtle)] rounded px-2 py-1.5 truncate">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/random/{cat.slug}?key={user?.api_key}
                  </code>
                  <button
                    onClick={() => copyToClipboard(
                      `${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/random/${cat.slug}?key=${user?.api_key}`,
                      cat.slug
                    )}
                    className="text-xs px-2 py-1 rounded bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors shrink-0"
                  >
                    {copyField === cat.slug ? '已复制' : '复制'}
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-xs text-[var(--color-text-tertiary)]">正在加载分类...</p>
              )}
            </div>

            {/* curl 示例 */}
            <div className="mb-4">
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">📦 cURL 示例</p>
              <div className="bg-[var(--color-bg-subtle)] rounded-md p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-[var(--color-text)]">
                  <code>{`# 获取随机图片
curl "${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/random/random?key=${user?.api_key}"

# 获取动漫图片
curl "${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/random/anime?key=${user?.api_key}"

# 获取小姐姐图片
curl "${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/random/girl?key=${user?.api_key}"`}</code>
                </pre>
              </div>
            </div>

            {/* JavaScript 示例 */}
            <div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">📦 JavaScript 示例</p>
              <div className="bg-[var(--color-bg-subtle)] rounded-md p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-[var(--color-text)]">
                  <code>{`// 使用 fetch API
fetch("${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/random/random?key=${user?.api_key}")
  .then(res => res.json())
  .then(data => {
    console.log('图片URL:', data.url);
    // 直接使用图片URL
    document.getElementById('myImage').src = data.url;
  });`}</code>
                </pre>
              </div>
            </div>

            <div className="mt-4 text-sm text-[var(--color-text-secondary)]">
              <p>✅ 支持的分类：{categories.map(c => `${c.slug}（${c.name}）`).join('、') || '正在加载...'}</p>
              <p className="mt-1">🔑 API Key 可以通过 URL 参数 <code className="text-xs bg-[var(--color-bg-subtle)] px-1 rounded">?key=YOUR_KEY</code> 或请求头 <code className="text-xs bg-[var(--color-bg-subtle)] px-1 rounded">X-API-Key: YOUR_KEY</code> 传递</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
