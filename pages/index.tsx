import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ApiCard from '@/components/ui/ApiCard';
import StatsCard from '@/components/ui/StatsCard';
import CategoryButton from '@/components/ui/CategoryButton';
import { apiInterfaces, apiCategories, ApiInterface } from '@/data/apiData';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface HeroSlide {
  tagline?: string;
  title?: string;
  subtitle?: string;
  background?: string;
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ today: 0, thisWeek: 0, thisMonth: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const siteSettings = useSiteSettings();
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [endpointStats, setEndpointStats] = useState<Record<string, number>>({});
  const [apiList, setApiList] = useState<ApiInterface[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string, slug: string, type?: string}[]>([]);
  const [isLoadingApis, setIsLoadingApis] = useState(true);
  // 分类筛选条：默认只显示热门前 5，其余收进"···"，保证单行不换行
  const [categoryExpanded, setCategoryExpanded] = useState(false);

  // 获取分类列表（从数据库动态读取）
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

  // 获取 API 列表（从数据库动态读取）
  const fetchApis = async () => {
    try {
      const res = await fetch(`/api/apis?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setApiList(data.apis || []);
      }
    } catch (e) {
      console.error('获取API列表失败:', e);
    } finally {
      setIsLoadingApis(false);
    }
  };

  // 将真实调用次数合并到 API 列表（优先使用动态获取的 apiList；视频分类自动补随机视频接口卡）
  const displayApis = useMemo(() => {
    const base = apiList.length > 0 ? apiList : apiInterfaces;
    const videoCards = categories
      .filter((cat) => cat.type === 'video')
      .filter((cat) => !base.some((api) => api.url === `/api/v1/video/${cat.slug}`))
      .map((cat) => ({
        id: 100000 + cat.id,
        name: `${cat.name}随机视频`,
        url: `/api/v1/video/${cat.slug}`,
        description: `获取${cat.name}分类的随机视频`,
        category: cat.name,
      }));
    return [...base, ...videoCards].map((api) => ({
      ...api,
      type: (api.url.includes('/api/v1/video/') ? 'video' : 'image') as 'video' | 'image',
    }));
  }, [apiList, categories]);

  const apisWithStats = useMemo(() => {
    return displayApis.map(api => ({
      ...api,
      usageCount: endpointStats[api.url] || 0,
    }));
  }, [displayApis, endpointStats]);

  // 分类按调用热度排序（分类下所有接口的调用次数之和），热门优先展示
  const HOT_CATEGORY_COUNT = 5;
  const sortedCategories = useMemo(() => {
    const usage: Record<string, number> = {};
    apisWithStats.forEach((api) => {
      if (api.category) usage[api.category] = (usage[api.category] || 0) + api.usageCount;
    });
    const list = categories.length > 0 ? categories : apiCategories;
    return [...list].sort((a, b) => (usage[b.name] || 0) - (usage[a.name] || 0));
  }, [categories, apisWithStats]);

  // 收起时只显示：热门前 5 + 当前选中（选中冷门分类时保持可见）
  const visibleCategories = useMemo(() => {
    if (categoryExpanded) return sortedCategories;
    const hotNames = new Set(sortedCategories.slice(0, HOT_CATEGORY_COUNT).map(c => c.name));
    return sortedCategories.filter(c => hotNames.has(c.name) || c.name === selectedCategory);
  }, [sortedCategories, categoryExpanded, selectedCategory]);

  // 筛选后的列表
  const filteredApis = useMemo(() => {
    let result = apisWithStats;
    if (selectedCategory !== '全部') {
      result = result.filter(api => api.category === selectedCategory);
    }
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(api =>
        api.name.toLowerCase().includes(term) ||
        api.description.toLowerCase().includes(term) ||
        api.url.toLowerCase().includes(term)
      );
    }
    return result;
  }, [apisWithStats, selectedCategory, searchTerm]);

  const fallbackHeroSlide = useMemo<HeroSlide>(() => ({
    tagline: siteSettings.hero_tagline || '图片 API 服务平台',
    title: siteSettings.hero_title || siteSettings.site_name || 'ZL-综合API',
    subtitle: siteSettings.hero_subtitle || '稳定、高效的图片接口服务，为你的项目提供丰富的视觉内容。\n支持多种分类，一键接入，即刻使用。',
    background: '',
  }), [siteSettings.hero_tagline, siteSettings.hero_title, siteSettings.hero_subtitle, siteSettings.site_name]);

  const heroSlides = useMemo<HeroSlide[]>(() => {
    if (siteSettings.hero_carousel_enabled !== 'true') {
      return [fallbackHeroSlide];
    }

    try {
      const parsed = JSON.parse(siteSettings.hero_carousel_slides || '[]');
      if (!Array.isArray(parsed)) return [fallbackHeroSlide];

      const slides = parsed
        .filter((slide) => slide && typeof slide === 'object')
        .map((slide) => ({
          tagline: String(slide.tagline || '').trim(),
          title: String(slide.title || '').trim(),
          subtitle: String(slide.subtitle || '').trim(),
          background: String(slide.background || '').trim(),
        }))
        .filter((slide) => slide.tagline || slide.title || slide.subtitle || slide.background);

      return slides.length > 0 ? slides : [fallbackHeroSlide];
    } catch {
      return [fallbackHeroSlide];
    }
  }, [fallbackHeroSlide, siteSettings.hero_carousel_enabled, siteSettings.hero_carousel_slides]);

  const currentHeroSlide = heroSlides[activeHeroSlide] || heroSlides[0] || fallbackHeroSlide;
  const heroBackground = siteSettings.hero_carousel_mode === 'full' ? currentHeroSlide.background : '';
  const heroInterval = Math.max(parseInt(siteSettings.hero_carousel_interval || '6000', 10) || 6000, 3000);
  const heroHeight = Math.min(Math.max(parseInt(siteSettings.hero_carousel_height || '460', 10) || 460, 320), 760);
  const heroOverlayOpacity = Math.min(Math.max(parseInt(siteSettings.hero_carousel_overlay_opacity || '72', 10) || 72, 0), 95) / 100;
  const heroBackgroundStyle = heroBackground ? ({
    '--hero-bg-image': `url("${heroBackground}")`,
    '--hero-overlay-alpha': heroOverlayOpacity,
  } as React.CSSProperties) : undefined;

  useEffect(() => {
    setActiveHeroSlide(0);
  }, [siteSettings.hero_carousel_enabled, siteSettings.hero_carousel_slides]);

  useEffect(() => {
    if (siteSettings.hero_carousel_enabled !== 'true' || heroSlides.length <= 1 || isHeroPaused) return;

    const interval = setInterval(() => {
      setActiveHeroSlide((index) => (index + 1) % heroSlides.length);
    }, heroInterval);

    return () => clearInterval(interval);
  }, [heroInterval, heroSlides.length, isHeroPaused, siteSettings.hero_carousel_enabled]);

  const fetchEndpointStats = async () => {
    try {
      const res = await fetch(`/api/stats/endpoints?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        console.log('[首页] 获取到端点统计:', data);
        setEndpointStats(data);
      }
    } catch (e) {
      console.error('获取接口统计失败:', e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/stats/public?_t=${Date.now()}`);
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {
      console.error('获取统计失败:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchEndpointStats();
    fetchApis();
    fetchCategories();

    const interval = setInterval(() => {
      fetchStats();
      fetchEndpointStats();
      fetchApis();
      fetchCategories();
    }, 30000);

    const handleFocus = () => {
      fetchEndpointStats();
      fetchApis();
      fetchCategories();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{`${siteSettings.site_name || 'ZL-综合API'} - 高质量图片接口服务`}</title>
        <meta name="description" content="稳定、快速的图片API接口服务，支持动漫、风景、动物等多种分类" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Header overlay={Boolean(heroBackground)} backgroundImage={heroBackground} overlayOpacity={heroOverlayOpacity} />

      <main className="flex-grow">
        {/* Hero Section */}
        <div
          className={`relative overflow-hidden border-b border-[var(--color-border)] ${
            heroBackground ? 'hero-background-surface' : ''
          }`}
          style={heroBackgroundStyle}
        >
          <div className="relative">
            <section
              className="px-4 sm:px-6 lg:px-8"
              onMouseEnter={() => setIsHeroPaused(true)}
              onMouseLeave={() => setIsHeroPaused(false)}
              style={{ minHeight: `${heroHeight}px` }}
            >
              <div className="max-w-5xl mx-auto text-center flex min-h-[inherit] flex-col items-center justify-center py-10">
                <motion.div
                  key={activeHeroSlide}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full"
                >
                  <p className="hero-foreground-accent text-sm font-medium tracking-wider text-[var(--color-primary)] uppercase mb-4">
                    {currentHeroSlide.tagline || fallbackHeroSlide.tagline}
                  </p>
                  <h1 className="hero-foreground-title text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[var(--color-primary)] mb-6 tracking-tight">
                    {currentHeroSlide.title || fallbackHeroSlide.title}
                  </h1>
                  <p className="hero-foreground-muted text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed whitespace-pre-line">
                    {currentHeroSlide.subtitle || fallbackHeroSlide.subtitle}
                  </p>
                </motion.div>

                <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link href="/docs" className="btn-primary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                查看文档
              </Link>
              <Link href="/example" className="btn-secondary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                在线体验
              </Link>
              <Link href="/gallery" className="btn-ghost">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                浏览全部内容
              </Link>
                </motion.div>

                {siteSettings.hero_carousel_enabled === 'true' && heroSlides.length > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    {heroSlides.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActiveHeroSlide(index)}
                        className={`h-2 rounded-full transition-all ${
                          activeHeroSlide === index
                            ? 'w-8 bg-[var(--color-primary)]'
                            : 'w-2 bg-[var(--color-border)] hover:bg-[var(--color-primary)]/50'
                        }`}
                        aria-label={`切换到第 ${index + 1} 张轮播`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Stats Section */}
        <section className="py-12 border-t border-[var(--color-border)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
            >
              <StatsCard label="今日调用" value={stats.today} isLoading={isLoading} />
              <StatsCard label="本周调用" value={stats.thisWeek} isLoading={isLoading} />
              <StatsCard label="本月调用" value={stats.thisMonth} isLoading={isLoading} />
              <StatsCard label="累计调用" value={stats.total} isLoading={isLoading} />
            </motion.div>
          </div>
        </section>

        {/* API List Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-text)] mb-3">
                API 接口
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                丰富的图片接口，满足各类应用场景
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8"
            >
              <div className="relative w-full sm:w-64 shrink-0">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="搜索接口..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>

              {/* 分类条：单行不换行，超出部分收进"···"；点击展开全部 */}
              <div
                className={`flex-1 min-w-0 ${
                  categoryExpanded
                    ? 'flex flex-wrap gap-2'
                    : 'flex items-center gap-2 flex-nowrap overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]'
                }`}
              >
                <CategoryButton
                  name="全部"
                  isActive={selectedCategory === '全部'}
                  onClick={() => setSelectedCategory('全部')}
                />
                {visibleCategories.map((cat) => (
                  <CategoryButton
                    key={cat.id}
                    name={cat.name}
                    isActive={selectedCategory === cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                  />
                ))}
                {sortedCategories.length > HOT_CATEGORY_COUNT && (
                  <button
                    onClick={() => setCategoryExpanded(!categoryExpanded)}
                    title={categoryExpanded ? '收起分类' : '展开全部分类'}
                    className={`shrink-0 px-3 py-1.5 text-sm font-medium rounded-md border border-dashed transition-all duration-200 ${
                      categoryExpanded
                        ? 'bg-[var(--color-primary)] text-white border-transparent'
                        : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] border-[var(--color-border)] hover:border-[var(--color-text-tertiary)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    {categoryExpanded ? '收起' : '···'}
                  </button>
                )}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingApis ? (
                <div className="col-span-full text-center py-16">
                  <p className="text-[var(--color-text-secondary)]">加载中...</p>
                </div>
              ) : filteredApis.length > 0 ? (
                filteredApis.map((api, index) => (
                  <ApiCard key={api.id} api={api} index={index} />
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <svg className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-[var(--color-text-secondary)] text-lg mb-1">
                    未找到匹配的接口
                  </p>
                  <p className="text-[var(--color-text-tertiary)] text-sm">
                    尝试其他关键词或分类
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden bg-[var(--color-primary)] rounded-xl p-8 sm:p-12 text-white"
              style={siteSettings.cta_background_image ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.42), rgba(0,0,0,0.42)), url("${siteSettings.cta_background_image}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : undefined}
            >
              <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-4">
                {siteSettings.cta_title || `开始使用${siteSettings.site_name || 'ZL-综合API'}`}
              </h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto leading-relaxed">
                注册账号获取专属 API Key，即刻接入高质量图片接口服务
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/auth/register" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[var(--color-primary)] font-medium rounded-md hover:bg-white/90 transition-colors">
                  立即注册
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/docs" className="inline-flex items-center gap-2 px-6 py-3 bg-transparent text-white font-medium rounded-md border border-white/30 hover:bg-white/10 transition-colors">
                  阅读文档
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
