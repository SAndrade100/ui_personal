import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dark';
};

export const Card: React.FC<Props> = ({ children, className = '', variant = 'default' }) => {
  const isDark = variant === 'dark';
  return (
    <div
      className={`rounded-card p-6 ${className}`}
      style={{
        background: isDark
          ? 'linear-gradient(135deg, var(--color-hero-from) 0%, var(--color-hero-to) 100%)'
          : 'var(--color-khaki)',
        boxShadow: isDark ? 'var(--card-shadow-dark)' : 'var(--card-shadow)',
        color: isDark ? 'white' : 'inherit',
      }}
    >
      {children}
    </div>
  );
};

export default Card;
