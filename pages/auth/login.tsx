import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AuthLayout from '../../components/layout/AuthLayout';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '登录失败');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('auth-change'));
      if (data.user.is_admin) {
        router.push('/admin');
      } else {
        router.push('/user/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="登录">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-error-light text-error-DEFAULT p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="username" className="label">
            用户名
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
            placeholder="请输入用户名"
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="请输入密码"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>

      <div className="mt-5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3 text-xs text-[var(--color-text-secondary)]">
        <p className="font-medium text-[var(--color-text)] mb-1">首次部署默认管理员</p>
        <p>用户名：admin</p>
        <p>密码：未设置 ADMIN_PASSWORD 时为 zl939921104；如果 .env.local 设置了 ADMIN_PASSWORD，请使用你设置的密码。</p>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-[var(--color-text-tertiary)]">
          还没有账号？{' '}
          <Link href="/auth/register" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
            立即注册
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
