import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: number;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="glassmorphism p-4 rounded-xl"
    >
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-primary">{value.toLocaleString()}</h3>
    </motion.div>
  );
};

export default StatsCard; 