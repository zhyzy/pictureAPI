import React from 'react';
import { motion } from 'framer-motion';

interface CategoryButtonProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ 
  name, 
  isActive, 
  onClick,
  index
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`px-4 py-2 rounded-full font-medium transition-colors duration-300 ${
        isActive 
          ? 'bg-primary text-white shadow-md' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      onClick={onClick}
    >
      {name}
    </motion.button>
  );
};

export default CategoryButton;
