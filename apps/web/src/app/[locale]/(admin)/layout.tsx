'use client';

import { usePathname } from 'next/navigation';
import { AdminAuthGuard } from '@/components/admin/admin-auth-guard';
import { AdminLayout } from '@/components/admin/admin-layout';

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.endsWith('/login')) return <>{children}</>;

  return (
    <AdminAuthGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthGuard>
  );
}
