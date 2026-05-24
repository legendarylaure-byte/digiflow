'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils/cn';

export function Tabs({ value, onValueChange, children, className }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode; className?: string }) {
  return <TabsPrimitive.Root value={value} onValueChange={onValueChange} className={cn('w-full', className)}>{children}</TabsPrimitive.Root>;
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <TabsPrimitive.List className={cn('inline-flex items-center gap-1 rounded-lg bg-gray-100 p-1', className)}>{children}</TabsPrimitive.List>;
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm',
        className,
      )}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  return <TabsPrimitive.Content value={value} className={cn('mt-4', className)}>{children}</TabsPrimitive.Content>;
}
