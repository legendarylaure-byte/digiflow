import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-700',
        draft: 'bg-gray-100 text-gray-700 border border-gray-200',
        inProgress: 'bg-amber-50 text-amber-700 border border-amber-200',
        approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        returned: 'bg-red-50 text-red-700 border border-red-200',
        confidential: 'bg-purple-50 text-purple-700 border border-purple-200',
        high: 'bg-red-50 text-red-700',
        medium: 'bg-amber-50 text-amber-700',
        low: 'bg-blue-50 text-blue-700',
        active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        inactive: 'bg-gray-100 text-gray-500 border border-gray-200',
        enabled: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        disabled: 'bg-gray-100 text-gray-500 border border-gray-200',
        pending: 'bg-amber-50 text-amber-700 border border-amber-200',
        admin: 'bg-violet-50 text-violet-700 border border-violet-200',
        viewer: 'bg-blue-50 text-blue-700 border border-blue-200',
        creator: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
        hod: 'bg-amber-50 text-amber-700 border border-amber-200',
        recommender: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
        approver: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
