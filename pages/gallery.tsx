import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface MediaItem {
  id: number;
  url: string;
  category_id: number;
  category_name: string;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  type: string;
}

export default function GalleryPage() {
  const siteSettings = useSiteSettings();
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  // 是否已完成过第一次加载：之后所有切换都用半透明过渡，不再出现骨架屏
  // （不能用 mediaItems.length 判断——内容为空的分类每次都会误判成"首次加载"导致闪烁）
  const hasFetchedRef = useRef(false);

  // 网站仅作预览展示，完整内容通过 API 开放
  const GALLERY_LIMIT = 30;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // 切换媒体类型时重置分类筛选
    setSelectedCategory('all');
  }, [mediaType]);

  useEffect(() => {
    fetchMedia();
  }, [mediaType, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/stats/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const fetchMedia = async () => {
    // 仅页面第一次加载显示骨架屏；之后的切换一律保留旧内容做半透明过渡
    if (!hasFetchedRef.current) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      let url = `/api/images?limit=${GALLERY_LIMIT}&media_type=${mediaType}`;
      if (selectedCategory !== 'all') {
        url += `&category_id=${selectedCategory}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMediaItems(data.images);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('获取媒体失败:', error);
    } finally {
      hasFetchedRef.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  };

  const visibleCategories = categories.filter((cat) => (cat.type || 'image') === mediaType);
  const isVideo = mediaType === 'video';

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{`图库 - ${siteSettings.site_name}`}</title>
        <meta name="description" content={`${siteSettings.site_name}图库`} />
      </Head>

      <Header />

      <main className="flex-grow py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-serif font-bold text-[var(--color-text)] mb-2">
              图片视频库
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              探索{siteSettings.site_name}的图片与视频收藏
            </p>
          </div>

          {/* 媒体类型切换 */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md border border-[var(--color-border)] overflow-hidden">
              <button
                onClick={() => setMediaType('image')}
                className={`px-5 py-2 text-sm font-medium transition-colors ${
                  mediaType === 'image'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                🖼️ 图片
              </button>
              <button
                onClick={() => setMediaType('video')}
                className={`px-5 py-2 text-sm font-medium transition-colors ${
                  mediaType === 'video'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                🎬 视频
              </button>
            </div>
          </div>

          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text)]'
              }`}
            >
              全部
            </button>
            {visibleCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(String(cat.id))}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  selectedCategory === String(cat.id)
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text)]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 媒体网格 */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) =>
                isVideo ? (
                  <div key={i} className="aspect-video bg-[var(--color-bg-subtle)] rounded-md animate-pulse" />
                ) : (
                  <div key={i} className="aspect-square bg-[var(--color-bg-subtle)] rounded-md animate-pulse" />
                )
              )}
            </div>
          ) : mediaItems.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isVideo ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                )}
              </svg>
              <p className="text-[var(--color-text-secondary)]">该分类下暂无{isVideo ? '视频' : '图片'}</p>
            </div>
          ) : (
            <div
              key={`${mediaType}-${selectedCategory}`}
              className={`columns-2 md:columns-3 lg:columns-4 gap-3 gallery-fade transition-opacity duration-200 ${
                refreshing ? 'opacity-40 pointer-events-none' : 'opacity-100'
              }`}
            >
              {mediaItems.map((item) =>
                isVideo ? (
                  <div
                    key={item.id}
                    className="group relative bg-black rounded-md overflow-hidden cursor-pointer select-none break-inside-avoid mb-3"
                    onClick={() => setPreviewItem(item)}
                  >
                    <video
                      src={item.url}
                      crossOrigin="anonymous"
                      className="w-full h-auto pointer-events-none"
                      style={{ aspectRatio: '16 / 9' }}
                      onLoadedMetadata={(e) => {
                        // 元数据加载后按视频真实宽高比显示，横竖版都完整展示不裁剪
                        const el = e.currentTarget;
                        if (el.videoWidth && el.videoHeight) {
                          el.style.aspectRatio = `${el.videoWidth} / ${el.videoHeight}`;
                        }
                      }}
                      preload="metadata"
                      muted
                      playsInline
                    />
                    {/* 播放图标 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-black/50 group-hover:bg-[var(--color-primary)]/80 rounded-full flex items-center justify-center transition-colors">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-white text-xs">{item.category_name || '未分类'}</span>
                    </div>
                  </div>
                ) : (
                  <div
                    key={item.id}
                    className="group relative bg-[var(--color-bg-subtle)] rounded-md overflow-hidden cursor-pointer select-none break-inside-avoid mb-3"
                    onClick={() => setPreviewItem(item)}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <img
                      src={item.url}
                      alt={`图片 ${item.id}`}
                      crossOrigin="anonymous"
                      className="w-full h-auto transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {/* 透明遮罩：阻止右键直接保存图片 */}
                    <div
                      className="absolute inset-0 z-10"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-white text-xs">{item.category_name || '未分类'}</span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* 内容超过预览上限时的提示 */}
          {!loading && totalCount > GALLERY_LIMIT && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
              <p className="text-sm text-[var(--color-text-secondary)] text-center sm:text-left">
                本页仅展示最新 {GALLERY_LIMIT} 个{isVideo ? '视频' : '图片'}，库内共 {totalCount} 个内容——<strong className="text-[var(--color-text)]">全部内容已通过 API 开放</strong>，欢迎使用！
              </p>
              <Link
                href="/docs"
                className="btn-primary text-xs px-4 py-2 shrink-0"
              >
                查看 API 文档
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* 预览弹窗 */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setPreviewItem(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {isVideo ? (
              <video
                src={previewItem.url}
                crossOrigin="anonymous"
                className="w-full max-h-[85vh] bg-black"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={previewItem.url}
                alt={`图片 ${previewItem.id}`}
                crossOrigin="anonymous"
                className="w-full max-h-[85vh] object-contain"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex justify-between items-center text-white">
                <span className="text-sm">{previewItem.category_name || '未分类'}</span>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="text-sm px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
