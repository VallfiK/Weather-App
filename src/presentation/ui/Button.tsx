import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  children: ReactNode;
}

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50';
  const styles = variant === 'primary'
    ? 'bg-accent text-white hover:opacity-90'
    : 'bg-transparent text-text hover:bg-surface';
  return <button className={`${base} ${styles} ${className}`} {...rest}>{children}</button>;
}
