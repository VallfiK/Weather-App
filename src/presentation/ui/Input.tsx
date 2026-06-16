import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-lg bg-surface px-4 py-2 text-text placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
      {...rest}
    />
  );
});
