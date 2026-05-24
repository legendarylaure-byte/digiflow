'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/hooks/use-auth';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    } else if (!loading && isAuthenticated && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return <>{children}</>;
}
