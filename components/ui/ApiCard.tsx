import React from 'react';
import { motion } from 'framer-motion';
import { Tilt } from 'react-tilt';
import { ApiInterface } from '@/data/apiData';

interface ApiCardProps {
  api: ApiInterface;
  index: number;
}

const defaultOptions = {
  reverse: false,
  max: 15,
  perspective: 1000,
  scale: 1,
  speed: 300,
  transition: true,
  axis: null,
  reset: true,
  easing: 'cubic-bezier(.03,.98,.52,.99)',
};

const ApiCard: React.FC<ApiCardProps> = ({ api, index }) => {
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(api.url);
    // 这里可以添加复制成功提示
  };

  return (
    <Tilt options={defaultOptions}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="api-card"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-primary dark:text-accent">{api.name}</h3>
          <span className="px-2 py-1 text-xs rounded-full bg-accent dark:bg-primary text-dark dark:text-white font-medium">
            {api.category}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{api.description}</p>
        
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4 overflow-x-auto">
          <code className="text-xs text-secondary dark:text-gray-300">{api.url}</code>
        </div>
        
        <div className="flex justify-between items-center">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary btn-sm text-xs py-1 px-3"
            onClick={handleCopyUrl}
          >
            复制链接
          </motion.button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            使用量: <span className="font-semibold text-secondary dark:text-gray-300">{api.usageCount.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>
    </Tilt>
  );
};

export default ApiCard; 