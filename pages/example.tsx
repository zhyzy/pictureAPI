import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface ApiResponse {
  url: string;
  id: number;
  type?: string;
  category: string;
  category_name: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  type?: string;
}

const ExamplePage = () => {
  const siteSettings = useSiteSettings();
  const [selectedCategory, setSelectedCategory] = useState('anime');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ApiResponse | null>(null);
  const [history, setHistory] = useState<ApiResponse[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [mainTab, setMainTab] = useState<'image' | 'video'>('image');

  const isVideoCategory = categories.find((c) => c.slug === selectedCategory)?.type === 'video';
  const visibleCategories = categories.filter((c) => (c.type || 'image') === mainTab);

  // 切换主分类（图片/视频）：自动选中该类型下的第一个分类
  const handleTabChange = (tab: 'image' | 'video') => {
    setMainTab(tab);
    const first = categories.find((c) => (c.type || 'image') === tab);
    if (first) {
      setSelectedCategory(first.slug);
    } else {
      setSelectedCategory('');
    }
  };

  // 从 URL 参数读取 Key
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const keyFromUrl = params.get('key');
      if (keyFromUrl) {
        setApiKey(keyFromUrl);
      }
    }
  }, []);

  // 从 API 动态获取分类列表
  useEffect(() => {
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
    fetchCategories();
  }, []);

  const fetchImage = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = isVideoCategory ? 'video' : 'random';
      let url = `/api/v1/${endpoint}/${selectedCategory}`;
      if (apiKey.trim()) {
        url += `?key=${encodeURIComponent(apiKey.trim())}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API请求失败: ${response.status}`);
      }

      const data = await response.json() as ApiResponse;
      setImageInfo(data);
      setImageUrl(data.url);
      setHistory(prev => [data, ...prev.slice(0, 9)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取媒体时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  // 切换分类时清空上一次的展示内容，避免视频/图片混显
  useEffect(() => {
    setImageUrl(null);
    setImageInfo(null);
    setError(null);
  }, [selectedCategory]);

  useEffect(() => {
    // 如果已经有 Key，自动获取一张图片
    if (apiKey.trim()) {
      fetchImage();
    }
  }, []);

  useEffect(() => {
    if (autoRefresh && apiKey.trim()) {
      const interval = setInterval(fetchImage, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedCategory, apiKey]);

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>API体验 - {siteSettings.site_name}</title>
      </Head>

      <Header />

      <main className="flex-grow py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-[var(--color-text)] mb-2">
              API 体验
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              输入 API Key，选择分类，立即体验{siteSettings.site_name}
            </p>
          </div>

          {/* API Key 输入 */}
          <div className="card mb-6">
            <label className="label">API Key</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入你的 API Key（格式：ak_xxxx...）"
                className="input font-mono text-sm flex-1"
              />
              {apiKey && (
                <button
                  onClick={() => setApiKey('')}
                  className="btn-secondary text-sm"
                  title="清除 Key"
                >
                  清除
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              在个人中心查看你的 API Key，<strong>必须填写</strong>才能调用接口
            </p>
          </div>

          {/* 主分类 Tab：图片 / 视频 */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-lg border border-[var(--color-border)] overflow-hidden">
              <button
                onClick={() => handleTabChange('image')}
                className={`px-6 py-2.5 text-sm font-medium transition-colors ${
                  mainTab === 'image'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                🖼️ 图片分类
                <span className="ml-1.5 text-xs opacity-70">
                  {categories.filter((c) => (c.type || 'image') === 'image').length}
                </span>
              </button>
              <button
                onClick={() => handleTabChange('video')}
                className={`px-6 py-2.5 text-sm font-medium transition-colors ${
                  mainTab === 'video'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                🎬 视频分类
                <span className="ml-1.5 text-xs opacity-70">
                  {categories.filter((c) => c.type === 'video').length}
                </span>
              </button>
            </div>
          </div>

          {/* 子分类 */}
          <div className="mb-6">
            {visibleCategories.length === 0 ? (
              <p className="text-center text-sm text-[var(--color-text-tertiary)] py-2">
                暂无{mainTab === 'video' ? '视频' : '图片'}分类，请先在管理后台创建
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                {visibleCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <button
              onClick={fetchImage}
              disabled={isLoading || !selectedCategory}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading ? '加载中...' : isVideoCategory ? '获取视频' : '获取图片'}
            </button>

            <label className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md cursor-pointer text-sm text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)]"
              />
              自动刷新 (5秒)
            </label>
          </div>

          {/* 图片展示 */}
          <div className="card mb-6 overflow-hidden p-0">
            <div className="p-6">
              {error && (
                <div className="bg-error-light text-error-DEFAULT p-3 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}
              
              <div className="flex flex-col items-center">
                {isLoading && !imageUrl ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-primary)] border-t-transparent mb-3"></div>
                    <p className="text-sm text-[var(--color-text-tertiary)]">正在加载...</p>
                  </div>
                ) : imageUrl ? (
                  <>
                    <div className="relative rounded-md overflow-hidden mb-4 max-w-full bg-black">
                      {imageInfo?.type === 'video' ? (
                        <video
                          key={imageUrl}
                          src={imageUrl}
                          crossOrigin="anonymous"
                          controls
                          autoPlay
                          playsInline
                          className="max-w-full h-auto max-h-[400px]"
                        />
                      ) : (
                        <img
                          src={imageUrl}
                          alt="随机图片"
                          crossOrigin="anonymous"
                          className="max-w-full h-auto max-h-[400px] object-contain"
                          onError={() => setError('图片加载失败')}
                        />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {/* 已移除查看大图和复制链接按钮 */}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16 text-[var(--color-text-tertiary)]">
                    <p>输入 API Key 后点击{isVideoCategory ? '"获取视频"' : '"获取图片"'}</p>
                  </div>
                )}
              </div>

              {/* API响应 */}
              {imageInfo && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">API 响应</h3>
                  <pre className="text-xs bg-[var(--color-bg-subtle)] p-3 rounded-md overflow-x-auto">
                    <code>{JSON.stringify(imageInfo, null, 2)}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* 历史记录 */}
          {history.length > 0 && (
            <div className="card">
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-3">历史记录</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {history.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="relative aspect-square rounded-md overflow-hidden cursor-pointer group bg-black"
                    onClick={() => {
                      setImageUrl(item.url);
                      setImageInfo(item);
                    }}
                  >
                    {item.type === 'video' ? (
                      <>
                        <video
                          src={item.url}
                          className="w-full h-full object-cover pointer-events-none"
                          preload="metadata"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={item.url}
                        alt={`历史 ${index + 1}`}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs">查看</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ExamplePage;
