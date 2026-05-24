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

const colorMap = {
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  violet: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const dotColorMap = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  violet: 'bg-violet-500',
  rose: 'bg-rose-500',
  cyan: 'bg-cyan-500',
};

export function StatCard({ label, value, description, icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 transition-colors hover:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${dotColorMap[color]}`} />
          <p className="text-sm font-medium text-gray-400">{label}</p>
        </div>
        {icon && <div className={`rounded-lg p-2 ${colorMap[color]}`}>{icon}</div>}
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
      {trend && (
        <p className={cn('mt-2 text-xs font-medium', trend.positive ? 'text-emerald-400' : 'text-rose-400')}>
          {trend.value}
        </p>
      )}
    </div>
  );
}
