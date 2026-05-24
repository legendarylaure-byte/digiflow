'use client';

import { useState } from 'react';
import { usePathname } from '@/i18n/routing';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard, Users, Shield, GitBranch, Building2, BarChart3, FileSearch,
  Bell, Cpu, Database, ChevronRight, Menu, X, LogOut, ArrowLeft,
} from 'lucide-react';
import { Link } from '@/i18n/routing';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/roles', label: 'Roles', icon: Shield },
  { href: '/admin/workflow', label: 'Workflows', icon: GitBranch },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/audit', label: 'Audit Log', icon: FileSearch },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/ai-config', label: 'AI Config', icon: Cpu },
  { href: '/admin/backup', label: 'Backup', icon: Database },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') return pathname === '/admin/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <button
        className="fixed left-4 top-4 z-50 rounded-lg bg-gray-800 p-2 shadow-md lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
      </button>

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-800 bg-gray-950 transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className={cn('flex items-center border-b border-gray-800 p-4', collapsed && 'justify-center')}>
          <span className="text-lg font-bold text-white">{collapsed ? 'D' : 'DigiFlow Admin'}</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-brand-600/20 text-brand-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200',
                  collapsed && 'justify-center px-2',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden border-t border-gray-800 p-3 text-gray-500 hover:text-gray-300 lg:flex items-center justify-center"
        >
          <ChevronRight className={cn('h-4 w-4 transition-transform', !collapsed && 'rotate-180')} />
        </button>

        <div className="border-t border-gray-800 p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {!collapsed && <span>Back to App</span>}
          </Link>
          <button
            onClick={logout}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
