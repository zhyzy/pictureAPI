import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface CopyApiButtonProps {
  /** 构造复制内容：base 为完整域名（无末尾斜杠），apiKey 为当前登录用户的 Key */
  buildText: (base: string, apiKey: string) => string;
  /** 按钮附加样式（覆盖默认尺寸等） */
  className?: string;
  /** 自定义按钮文案（默认"复制使用"/"复制"，登录后已复制时仍显示"已复制（含Key）"） */
  label?: string;
}

// 从 localStorage 读取当前登录用户的 API Key（与个人中心同源）
const getUserApiKey = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr)?.api_key || null : null;
  } catch {
    return null;
  }
};

/**
 * API 复制按钮：
 * - 已登录：显示"复制使用"，复制自带 Key 的内容，粘贴即可调用
 * - 未登录：点击弹出登录/注册引导弹窗（复制的内容需要 Key 才能调用）
 */
const CopyApiButton: React.FC<CopyApiButtonProps> = ({ buildText, className = '', label }) => {
  const siteSettings = useSiteSettings();
  const [loggedIn, setLoggedIn] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    setLoggedIn(Boolean(getUserApiKey()));
  }, []);

  const handleCopy = useCallback(async () => {
    const apiKey = getUserApiKey();
    if (!apiKey) {
      setShowLoginModal(true);
      return;
    }
    const base = (siteSettings.site_url || window.location.origin).replace(/\/+$/, '');
    try {
      await navigator.clipboard.writeText(buildText(base, apiKey));
    } catch (error) {
      console.warn('复制失败:', error);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [buildText, siteSettings.site_url]);

  return (
    <>
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-1.5 font-medium rounded-md transition-all duration-200 ${
          copied
            ? 'bg-success-light text-success-DEFAULT'
            : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)]'
        } ${className || 'px-3 py-1.5 text-sm'}`}
      >
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            已复制（含Key）
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {loggedIn ? (label || '复制使用') : (label || '复制')}
          </>
        )}
      </button>

      {/* 未登录引导弹窗 */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="bg-[var(--color-bg-elevated)] rounded-xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-primary-subtle)] mx-auto mb-4">
              <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 2a8 8 0 11-16 0 8 8 0 0116 0zm-4 4v1.5a2.5 2.5 0 005 0V13a8 8 0 10-4 6.9" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] text-center mb-2">
              登录后复制可直接使用
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] text-center mb-6">
              调用接口需要 API Key。登录或注册后即可获取你的专属 Key，复制的内容将自动携带，粘贴即可调用。
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/auth/login"
                className="btn-primary w-full text-center py-2.5"
              >
                立即登录
              </Link>
              <Link
                href="/auth/register"
                className="btn-secondary w-full text-center py-2.5"
              >
                注册账号
              </Link>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] py-1.5 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CopyApiButton;
