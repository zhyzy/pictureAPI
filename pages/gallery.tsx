import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Image {
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
}

export default function GalleryPage() {
  const [images, setImages] = useState<Image[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchImages();
  }, []);

  useEffect(() => {
    fetchImages();
  }, [selectedCategory]);

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

  const fetchImages = async () => {
    setLoading(true);
    try {
      let url = '/api/images?limit=50';
      if (selectedCategory !== 'all') {
        url += `&category_id=${selectedCategory}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setImages(data.images);
      }
    } catch (error) {
      console.error('获取图片失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>图库 - 樱道 API</title>
        <meta name="description" content="樱道 API 图库" />
      </Head>

      <Header />

      <main className="flex-grow py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-[var(--color-text)] mb-2">
              图片图库
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              探索樱道 API 的图片收藏
            </p>
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
            {categories.map((cat) => (
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

          {/* 图片网格 */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-[var(--color-bg-subtle)] rounded-md animate-pulse" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-[var(--color-text-secondary)]">该分类下暂无图片</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative bg-[var(--color-bg-subtle)] rounded-md overflow-hidden cursor-pointer select-none"
                  onClick={() => setSelectedImage(image)}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <img
                    src={image.url}
                    alt={`图片 ${image.id}`}
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
                    <span className="text-white text-xs">{image.category_name || '未分类'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 预览弹窗 */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.url}
              alt={`图片 ${selectedImage.id}`}
              className="max-w-full max-h-[85vh] object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex justify-between items-center text-white">
                <span className="text-sm">{selectedImage.category_name || '未分类'}</span>
                <button
                  onClick={() => setSelectedImage(null)}
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
