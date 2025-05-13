import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ThemeToggle from '../ui/ThemeToggle';

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 bg-white/80 dark:bg-dark/80 backdrop-blur-md sticky top-0 z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 flex justify-between items-center"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center"
        >
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="mr-4">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#FF4C29" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="#FF4C29" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="#FF4C29" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary dark:text-accent">樱道 <span className="text-gray-600 dark:text-gray-300">API</span></h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">随机图片API接口</p>
              </div>
            </div>
          </Link>
        </motion.div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/docs">
              <button className="btn btn-primary">
                API文档
              </button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </header>
  );
};

export default Header; 