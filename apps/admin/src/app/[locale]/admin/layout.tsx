'use client';

import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminAuthGuard } from '@/components/layout/admin-auth-guard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname.endsWith('/login');

  if (isLogin) return <>{children}</>;

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-950">
        <AdminSidebar />
        <main className="lg:pl-64">
          <div className="p-6 pt-16 lg:pt-6">
            {children}
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
}
