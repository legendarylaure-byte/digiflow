'use client';

import { useState } from 'react';
import { usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Inbox,
  CheckCircle2,
  History,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from '@/i18n/routing';

const navItems = [
  { href: '/dashboard', label: 'dashboard', icon: LayoutDashboard },
  { href: '/documents', label: 'documents', icon: FileText },
  { href: '/documents/upload', label: 'upload', icon: Upload },
  { href: '/inbox', label: 'inbox', icon: Inbox },
  { href: '/documents/approved', label: 'approved', icon: CheckCircle2 },
  { href: '/history', label: 'history', icon: History },
  { href: '/chat', label: 'chat', icon: MessageSquare },
  { href: '/settings', label: 'settings', icon: Settings },
];

export function Sidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-md lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center border-b border-gray-100 p-4', collapsed && 'justify-center')}>
          {collapsed ? (
            <img src="/favicon.ico" alt="DF" className="h-8 w-8" />
          ) : (
            <img src="/logo.png" alt="DigiFlow" className="h-8" />
          )}
        </div>

        {/* Navigation */}
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
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  collapsed && 'justify-center px-2',
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0', isActive(item.href) ? 'text-brand-600' : 'text-gray-400')} />
                {!collapsed && <span>{t(item.label)}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden border-t border-gray-100 p-3 text-gray-400 hover:text-gray-600 lg:flex items-center justify-center"
        >
          <ChevronRight className={cn('h-4 w-4 transition-transform', !collapsed && 'rotate-180')} />
        </button>

        {/* User section */}
        <div className={cn('border-t border-gray-100 p-3', collapsed && 'text-center')}>
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {user?.displayName || 'User'}
                </p>
                <p className="truncate text-xs text-gray-500">{profile?.role || 'Loading...'}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className={cn(
              'mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors',
              collapsed && 'justify-center',
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
