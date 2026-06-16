import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`rounded-2xl bg-surface p-4 shadow-sm ${className}`} {...rest}>
      {children}
    </div>
  );
}
