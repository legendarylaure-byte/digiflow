'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <DialogPrimitive.Title className={cn('text-lg font-semibold text-gray-900', className)}>{children}</DialogPrimitive.Title>;
}

export function DialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <DialogPrimitive.Description className={cn('mt-1 text-sm text-gray-500', className)}>{children}</DialogPrimitive.Description>;
}
