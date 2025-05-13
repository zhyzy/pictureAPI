import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface ApiResponse {
  code: number;
  msg: string;
  data: {
    url: string;
    width: number;
    height: number;
    size: number;
    format: string;
    tags: string[];
    source: string;
    source_id: string;
  } | null;
}

const ExamplePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('anime');
  const [selectedSize, setSelectedSize] = useState('regular');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  const categories = [
    { value: 'anime', label: '动漫' },
    { value: 'scenery', label: '风景' },
    { value: 'game', label: '游戏' },
    { value: 'girl', label: '美女' }
  ];

  const sizes = [
    { value: 'small', label: '小图' },
    { value: 'regular', label: '普通' },
    { value: 'large', label: '大图' },
    { value: 'original', label: '原图' }
  ];

  const formats = [
    { value: 'all', label: '全部' },
    { value: 'jpg', label: 'JPG' },
    { value: 'png', label: 'PNG' },
    { value: 'gif', label: 'GIF' }
  ];

  const fetchImage = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://api.zhihuiyun.work/image/api/image.php?category=${selectedCategory}&size=${selectedSize}&format=${selectedFormat}&type=json`);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const data = await response.json() as ApiResponse;
      setApiResponse(data);
      
      if (data.code === 200 && data.data) {
        setImageUrl(data.data.url);
      } else {
        setError(data.msg || '获取图片失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取图片时发生未知错误');
      console.error('Error fetching image:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 页面加载时获取一张图片
  useEffect(() => {
    fetchImage();
  }, []);

  return (
    <div className="min-h-screen flex flex-col text-gray-900 dark:text-gray-100">
      <Head>
        <title>API示例 - 樱道API</title>
        <meta name="description" content="樱道API接口调用示例" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-6 text-center text-primary dark:text-accent"
          >
            API调用示例
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card p-6 mb-8"
          >
            <h2 className="text-xl font-bold mb-4 text-secondary dark:text-accent">参数配置</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">图片分类</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">图片尺寸</label>
                <select 
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent"
                >
                  {sizes.map(size => (
                    <option key={size.value} value={size.value}>{size.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">图片格式</label>
                <select 
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent"
                >
                  {formats.map(format => (
                    <option key={format.value} value={format.value}>{format.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchImage}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? '加载中...' : '获取图片'}
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card p-6"
          >
            <h2 className="text-xl font-bold mb-4 text-secondary dark:text-accent">图片展示</h2>
            
            {error ? (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-4 rounded-lg mb-4">
                <p>{error}</p>
              </div>
            ) : null}
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-accent"></div>
              </div>
            ) : imageUrl ? (
              <div className="flex flex-col items-center">
                <div className="relative rounded-lg overflow-hidden mb-4 max-w-full">
                  <img 
                    src={imageUrl} 
                    alt={`随机${categories.find(c => c.value === selectedCategory)?.label}图片`}
                    className="max-w-full h-auto max-h-[500px] object-contain"
                    onError={() => setError('图片加载失败')}
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open(imageUrl, '_blank')}
                  className="btn btn-secondary mb-4"
                >
                  在新窗口打开
                </motion.button>
                
                {apiResponse && apiResponse.data && (
                  <div className="w-full mt-4">
                    <h3 className="text-lg font-semibold mb-2">API响应数据</h3>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-xs">
                      <code>{JSON.stringify(apiResponse, null, 2)}</code>
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <p>点击"获取图片"按钮加载图片</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExamplePage; 