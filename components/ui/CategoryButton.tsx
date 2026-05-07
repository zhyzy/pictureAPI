import React from 'react';

interface CategoryButtonProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ 
  name, 
  isActive, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
        isActive 
          ? 'bg-[var(--color-primary)] text-white' 
          : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-text-tertiary)] hover:text-[var(--color-text)]'
      }`}
    >
      {name}
    </button>
  );
};

export default CategoryButton;
