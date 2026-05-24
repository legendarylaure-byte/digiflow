'use client';

import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
  color?: 'blue' | 'emerald' | 'amber' | 'violet' | 'rose' | 'cyan';
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  rose: 'bg-rose-50 text-rose-600',
  cyan: 'bg-cyan-50 text-cyan-600',
};

const dotColorMap: Record<string, string> = {
  blue: 'bg-blue-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500',
  violet: 'bg-violet-500', rose: 'bg-rose-500', cyan: 'bg-cyan-500',
};

export function StatCard({ label, value, description, icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${dotColorMap[color]}`} />
          <p className="text-sm font-medium text-gray-500">{label}</p>
        </div>
        {icon && <div className={`rounded-lg p-2 ${colorMap[color]}`}>{icon}</div>}
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
      {description && <p className="mt-1 text-xs text-gray-400">{description}</p>}
      {trend && (
        <p className={cn('mt-2 text-xs font-medium', trend.positive ? 'text-emerald-600' : 'text-rose-600')}>
          {trend.value}
        </p>
      )}
    </div>
  );
}
