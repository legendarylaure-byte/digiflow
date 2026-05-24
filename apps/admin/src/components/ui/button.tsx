'use client';

import { cn } from '@/lib/utils/cn';

const variants = {
  default: 'bg-brand-600 text-white hover:bg-brand-700',
  destructive: 'bg-rose-600 text-white hover:bg-rose-700',
  outline: 'border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white',
  secondary: 'bg-gray-800 text-gray-300 hover:bg-gray-700',
  ghost: 'text-gray-400 hover:text-white hover:bg-gray-800',
  coral: 'bg-coral-500 text-white hover:bg-coral-600',
} as const;

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10',
} as const;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export function Button({ variant = 'default', size = 'default', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
