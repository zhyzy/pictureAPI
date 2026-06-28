import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  const siteSettings = useSiteSettings();
  const logoChar = siteSettings.site_name.charAt(0) || '樱';

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[var(--color-bg)]">
      <Head>
        <title>{title} - {siteSettings.site_name}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Serif+SC:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          {siteSettings.site_logo ? (
            <img
              src={siteSettings.site_logo}
              alt={siteSettings.site_name}
              className="w-12 h-12 object-contain rounded-lg"
            />
          ) : (
            <div className="w-12 h-12 bg-[var(--color-primary)] rounded-lg flex items-center justify-center text-white text-xl font-serif font-bold">
              {logoChar}
            </div>
          )}
        </Link>
        <h2 className="mt-6 text-center text-2xl font-serif font-bold text-[var(--color-text)]">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--color-text-tertiary)]">
          {siteSettings.site_name} - 图片接口服务
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--color-bg-elevated)] py-8 px-4 shadow-soft rounded-lg sm:px-10 border border-[var(--color-border)]">
          {children}
        </div>
      </div>
    </div>
  );
}
