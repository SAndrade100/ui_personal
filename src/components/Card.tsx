import React from 'react';
import {
  Card as UiCard,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from './ui/card';
import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dark';
};

export const Card: React.FC<Props> = ({ children, className = '', variant = 'default' }) => {
  if (variant === 'dark') {
    return (
      <div
        className={cn(
          'rounded-lg p-6 text-white shadow-[var(--card-shadow-dark)]',
          className
        )}
        style={{
          background: 'linear-gradient(135deg, var(--color-hero-from) 0%, var(--color-hero-to) 100%)',
        }}
      >
        {children}
      </div>
    );
  }
  return (
    <UiCard className={cn('p-6', className)}>
      {children}
    </UiCard>
  );
};

export { CardHeader, CardContent, CardFooter, CardTitle, CardDescription };
export default Card;

