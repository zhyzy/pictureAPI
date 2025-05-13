import React from 'react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 mt-10 bg-white/50 dark:bg-dark/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 text-center"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} 樱道API - 随机图片API接口 | <span className="text-primary dark:text-accent">苏ICP备12345678号-1</span>
        </p>
        <div className="flex justify-center mt-4 space-x-4">
          <a href="#" className="text-gray-400 hover:text-primary dark:hover:text-accent transition-colors">
            使用条款
          </a>
          <a href="#" className="text-gray-400 hover:text-primary dark:hover:text-accent transition-colors">
            隐私政策
          </a>
          <a href="#" className="text-gray-400 hover:text-primary dark:hover:text-accent transition-colors">
            API文档
          </a>
          <a href="#" className="text-gray-400 hover:text-primary dark:hover:text-accent transition-colors">
            联系我们
          </a>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer; 