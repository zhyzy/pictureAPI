import React from 'react';
import { motion } from 'framer-motion';
import { ApiInterface } from '@/data/apiData';
import CopyApiButton from '@/components/ui/CopyApiButton';

interface ApiCardProps {
  api: ApiInterface;
  index: number;
}

const ApiCard: React.FC<ApiCardProps> = ({ api, index }) => {
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
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="text-base font-semibold text-[var(--color-text)] truncate">
              {api.name}
            </h3>
            {api.type === 'video' ? (
              <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                视频
              </span>
            ) : (
              <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded badge-primary">
                图片
              </span>
            )}
          </div>
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
        <CopyApiButton
          buildText={(base, apiKey) => `${base}${api.url}?key=${apiKey}`}
          className="px-3 py-1.5 text-sm"
        />

        <div className="text-xs text-[var(--color-text-tertiary)]">
          调用 {(api.usageCount || 0).toLocaleString()} 次
        </div>
      </div>
    </motion.div>
  );
};

export default ApiCard;
