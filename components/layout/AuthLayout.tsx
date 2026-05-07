import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[var(--color-bg)]">
      <Head>
        <title>{title} - 樱道 API</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Serif+SC:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      {/* 统一容器：确保标题和表单完全居中对齐 */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <div className="w-12 h-12 bg-[var(--color-primary)] rounded-lg flex items-center justify-center text-white text-xl font-serif font-bold">
            樱
          </div>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-serif font-bold text-[var(--color-text)]">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--color-text-tertiary)]">
          樱道 API - 图片接口服务
        </p>

        {/* 表单直接放在标题容器内，确保完全对齐 */}
        <div className="mt-8">
          <div className="bg-[var(--color-bg-elevated)] py-8 px-4 shadow-soft rounded-lg sm:px-10 border border-[var(--color-border)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
