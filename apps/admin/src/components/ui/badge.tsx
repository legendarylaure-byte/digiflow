'use client';

import { cn } from '@/lib/utils/cn';

export type BadgeVariant = keyof typeof variants;

const variants = {
  default: 'bg-gray-700 text-gray-300',
  draft: 'bg-gray-500/20 text-gray-400',
  inProgress: 'bg-amber-500/20 text-amber-400',
  approved: 'bg-emerald-500/20 text-emerald-400',
  returned: 'bg-rose-500/20 text-rose-400',
  active: 'bg-emerald-500/20 text-emerald-400',
  inactive: 'bg-gray-500/20 text-gray-400',
  enabled: 'bg-emerald-500/20 text-emerald-400',
  disabled: 'bg-gray-500/20 text-gray-400',
  pending: 'bg-amber-500/20 text-amber-400',
  admin: 'bg-violet-500/20 text-violet-400',
  viewer: 'bg-blue-500/20 text-blue-400',
  creator: 'bg-cyan-500/20 text-cyan-400',
  hod: 'bg-amber-500/20 text-amber-400',
  recommender: 'bg-indigo-500/20 text-indigo-400',
  approver: 'bg-emerald-500/20 text-emerald-400',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
