import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ApiInterface } from '@/data/apiData';

interface ApiCardProps {
  api: ApiInterface;
  index: number;
}

const ApiCard: React.FC<ApiCardProps> = ({ api, index }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(api.url);
    } catch (error) {
      console.warn('复制接口地址失败:', error);
      return;
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 1, 0.5, 1] }}
      className="card card-hover group"
    >
      {/* 顶部色条 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-primary)] rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* 头部 */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-[var(--color-text)] truncate mb-1">
            {api.name}
          </h3>
          <p className="text-sm text-[var(--color-text-tertiary)] line-clamp-2">
            {api.description}
          </p>
        </div>
        <span className="badge badge-primary shrink-0">
          {api.category}
        </span>
      </div>
      
      {/* URL */}
      <div className="bg-[var(--color-bg-subtle)] rounded-md p-3 mb-4 overflow-x-auto">
        <code className="text-xs text-[var(--color-text-secondary)] whitespace-nowrap font-mono">
          {api.url}
        </code>
      </div>
      
      {/* 底部操作 */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleCopyUrl}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
            copied
              ? 'bg-success-light text-success-DEFAULT'
              : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)]'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              已复制
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              复制
            </>
          )}
        </button>
        
        <div className="text-xs text-[var(--color-text-tertiary)]">
          调用 {(api.usageCount || 0).toLocaleString()} 次
        </div>
      </div>
    </motion.div>
  );
};

export default ApiCard;
