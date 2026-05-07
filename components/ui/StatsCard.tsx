import React from 'react';

interface StatsCardProps {
  label: string;
  value: number;
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, isLoading = false }) => {
  const formattedValue = value.toLocaleString();
  
  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-text)] mb-1">
        {isLoading ? (
          <span className="inline-block w-12 h-8 bg-[var(--color-bg-subtle)] rounded animate-pulse" />
        ) : (
          formattedValue
        )}
      </div>
      <div className="text-sm text-[var(--color-text-tertiary)]">
        {label}
      </div>
    </div>
  );
};

export default StatsCard;
