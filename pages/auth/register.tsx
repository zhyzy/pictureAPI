import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AuthLayout from '../../components/layout/AuthLayout';

/** 生成数学验证题 */
function generateCaptcha() {
  const ops = ['+', '-', '\u00d7']; // + - ×
  const op = ops[Math.floor(Math.random() * 3)];
  let a = Math.floor(Math.random() * 20) + 1;
  let b = Math.floor(Math.random() * 15) + 1;
  // 保证结果非负
  if (op === '-' && a < b) { const t = a; a = b; b = t; }
  if (op === '\u00d7') { a = Math.floor(Math.random() * 9) + 1; b = Math.floor(Math.random() * 9) + 1; }
  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  return { question: `${a} ${op} ${b} = ?`, answer };
}

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const [captcha, setCaptcha] = useState({ question: '', answer: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 只在客户端生成验证码，避免 hydration 错误
  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [countdown]);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
  }, []);

  /** 发送邮箱验证码 */
  const handleSendCode = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    // 先验证数学验证码
    if (!captchaInput || parseInt(captchaInput) !== captcha.answer) {
      setError('计算验证错误，请重新计算');
      refreshCaptcha();
      return;
    }

    setSendingCode(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '发送失败');

      setInfo('验证码已发送，请查收邮箱（30分钟内有效）');
      setCountdown(60);
      refreshCaptcha(); // 刷掉验证码防重放
    } catch (err: any) {
      setError(err.message);
      refreshCaptcha();
    } finally {
      setSendingCode(false);
    }
  };

  /** 提交注册 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    // 前端校验
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (password.length < 6) {
      setError('密码长度至少6位');
      return;
    }
    if (!email) {
      setError('邮箱为必填项');
      return;
    }
    if (!emailCode) {
      setError('请输入邮箱验证码');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email,
          username,
          password,
          verification_code: emailCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '注册失败');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('auth-change'));
      router.push('/user/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="注册">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-error-light text-error-DEFAULT p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        {info && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200">
            {info}
          </div>
        )}

        {/* 用户名 */}
        <div>
          <label htmlFor="username" className="label">
            用户名 <span className="text-[var(--color-primary)]">*</span>
          </label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
            placeholder="请输入用户名"
          />
        </div>

        {/* 邮箱 */}
        <div>
          <label htmlFor="email" className="label">
            邮箱 <span className="text-[var(--color-primary)]">*</span>
          </label>
          <div className="flex gap-2">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input flex-1"
              placeholder="请输入邮箱"
            />
          </div>
        </div>

        {/* 邮箱验证码 */}
        <div>
          <label htmlFor="emailCode" className="label">
            邮箱验证码 <span className="text-[var(--color-primary)]">*</span>
          </label>
          <div className="flex gap-2">
            <input
              id="emailCode"
              type="text"
              required
              maxLength={6}
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
              className="input flex-1"
              placeholder="6位验证码"
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={sendingCode || countdown > 0}
              className="btn-secondary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {sendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '发送验证码'}
            </button>
          </div>
        </div>

        {/* 数学验证码 */}
        <div>
          <label htmlFor="captcha" className="label">
            验证计算 <span className="text-[var(--color-primary)]">*</span>
          </label>
          <div className="flex gap-2 items-center">
            {/* SVG 验证码展示 */}
            <svg
              width="120"
              height="40"
              viewBox="0 0 120 40"
              className="bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0 cursor-pointer select-none"
              onClick={refreshCaptcha}
            >
              {/* 干扰线 */}
              <line x1="5" y1="10" x2="115" y2="30" stroke="#d1d5db" strokeWidth="1" />
              <line x1="10" y1="35" x2="100" y2="5" stroke="#e5e7eb" strokeWidth="1" />
              {/* 验证码文字 */}
              <text
                x="60"
                y="26"
                textAnchor="middle"
                fill="var(--color-primary, #c75b39)"
                fontSize="18"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {captcha.question}
              </text>
            </svg>
            <input
              id="captcha"
              type="text"
              required
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value.replace(/[^\d\-]/g, ''))}
              className="input w-28"
              placeholder="=?"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={refreshCaptcha}
              className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] transition-colors"
            >
              换一题
            </button>
          </div>
        </div>

        {/* 密码 */}
        <div>
          <label htmlFor="password" className="label">
            密码 <span className="text-[var(--color-primary)]">*</span>
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="至少6位字符"
          />
        </div>

        {/* 确认密码 */}
        <div>
          <label htmlFor="confirmPassword" className="label">
            确认密码 <span className="text-[var(--color-primary)]">*</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input"
            placeholder="再次输入密码"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '注册中...' : '注册'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[var(--color-text-tertiary)]">
          已有账号？{' '}
          <Link href="/auth/login" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
            立即登录
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
