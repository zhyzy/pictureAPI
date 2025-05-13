import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ApiCard from '@/components/ui/ApiCard';
import StatsCard from '@/components/ui/StatsCard';
import CategoryButton from '@/components/ui/CategoryButton';
import { apiInterfaces, apiCategories, usageStats } from '@/data/apiData';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [filteredApis, setFilteredApis] = useState(apiInterfaces);
  const [searchTerm, setSearchTerm] = useState('');

  // 根据选择的分类筛选API
  useEffect(() => {
    if (selectedCategory === '全部') {
      setFilteredApis(apiInterfaces);
    } else {
      setFilteredApis(apiInterfaces.filter(api => api.category === selectedCategory));
    }
  }, [selectedCategory]);

  // 处理搜索功能
  useEffect(() => {
    if (searchTerm.trim() === '') {
      if (selectedCategory === '全部') {
        setFilteredApis(apiInterfaces);
      } else {
        setFilteredApis(apiInterfaces.filter(api => api.category === selectedCategory));
      }
    } else {
      const results = apiInterfaces.filter(api => {
        return (
          (selectedCategory === '全部' || api.category === selectedCategory) &&
          (api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            api.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            api.url.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
      setFilteredApis(results);
    }
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col text-gray-900 dark:text-gray-100">
      <Head>
        <title>樱道API - 随机图片API接口</title>
        <meta name="description" content="高质量二次元随机图片API接口服务" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* 背景装饰 */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 right-0 bg-primary dark:bg-accent opacity-5 rounded-full w-96 h-96 -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 bg-accent dark:bg-primary opacity-5 rounded-full w-[40rem] h-[40rem] translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        </div>

        {/* 英雄区域 */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="text-center py-10 mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent dark:from-accent dark:to-primary">
              随机图片API接口
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            高质量、稳定、快速的随机图片API服务，支持多种分类和格式，适用于各种开发场景
          </p>
          
          {/* 快速导航按钮 */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link href="/docs">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary"
              >
                查看API文档
              </motion.button>
            </Link>
            <Link href="/example">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-secondary"
              >
                体验API示例
              </motion.button>
            </Link>
          </div>
          
          {/* 统计数据 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-10">
            <StatsCard title="今日调用次数" value={usageStats.today} delay={0.1} />
            <StatsCard title="昨日调用次数" value={usageStats.yesterday} delay={0.2} />
            <StatsCard title="本周调用次数" value={usageStats.thisWeek} delay={0.3} />
            <StatsCard title="本月调用次数" value={usageStats.thisMonth} delay={0.4} />
            <StatsCard title="总共调用次数" value={usageStats.total} delay={0.5} />
          </div>
        </motion.section>

        {/* 搜索和分类区域 */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative w-full md:w-96"
            >
              <input
                type="text"
                placeholder="搜索API..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent pl-10 bg-white dark:bg-dark dark:text-gray-100"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap gap-2 justify-center"
            >
              <CategoryButton
                name="全部"
                isActive={selectedCategory === '全部'}
                onClick={() => setSelectedCategory('全部')}
                index={0}
              />
              {apiCategories.map((category, idx) => (
                <CategoryButton
                  key={category.id}
                  name={category.name}
                  isActive={selectedCategory === category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  index={idx + 1}
                />
              ))}
            </motion.div>
          </div>
        </section>

        {/* API列表区域 */}
        <section>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory + searchTerm}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredApis.length > 0 ? (
                filteredApis.map((api, index) => (
                  <ApiCard key={api.id} api={api} index={index} />
                ))
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10"
                >
                  没有找到匹配的API接口，请尝试其他关键词
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      <Footer />
    </div>
  );
} 