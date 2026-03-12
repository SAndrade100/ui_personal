import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'accent' | 'outline' | 'outline-white';
  fullWidth?: boolean;
};

export const Button: React.FC<Props> = ({ variant = 'primary', children, className, fullWidth, ...rest }) => {
  const base = 'px-5 py-2.5 font-medium text-sm inline-flex items-center justify-center gap-2 transition-all duration-200 select-none cursor-pointer';
  const rounded = 'rounded-[var(--radius-btn)]';
  let cls = '';
  if (variant === 'primary')       cls = `${base} ${rounded} bg-camel text-white hover:bg-cocoa shadow hover:shadow-md active:scale-95`;
  if (variant === 'accent')        cls = `${base} ${rounded} bg-[var(--color-accent)] text-white hover:opacity-90 shadow hover:shadow-md active:scale-95`;
  if (variant === 'outline')       cls = `${base} ${rounded} bg-transparent border-2 border-camel text-espresso hover:bg-[rgba(178,150,125,0.08)] active:scale-95`;
  if (variant === 'outline-white') cls = `${base} ${rounded} bg-transparent border border-white/50 text-white hover:bg-white/10 hover:border-white active:scale-95`;
  if (variant === 'ghost')         cls = `${base} ${rounded} bg-transparent text-camel hover:bg-[rgba(178,150,125,0.1)] active:scale-95`;
  const merged = `${cls}${fullWidth ? ' w-full' : ''}${className ? ' ' + className : ''}`.trim();
  return (
    <button className={merged} {...rest}>
      {children}
    </button>
  );
};

export default Button;
