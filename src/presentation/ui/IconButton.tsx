import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  children: ReactNode;
}

export function IconButton({ className = '', children, ...rest }: IconButtonProps) {
  return (
    <button
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface text-text transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
