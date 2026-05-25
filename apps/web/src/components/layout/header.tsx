'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search } from 'lucide-react';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { NotificationDropdown } from '@/components/notifications/notification-dropdown';
import { CommandPalette } from '@/components/layout/command-palette';

export function Header() {
  const t = useTranslations('common');
  const { user } = useAuth();
  const pathname = usePathname();

  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  // Derive page title from path
  const segments = pathname.split('/').filter(Boolean);
  const currentPage = segments[segments.length - 1] || 'dashboard';
  const pageTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-6">
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-gray-900 capitalize">
          {pageTitle === 'Dashboard' ? 'Dashboard' : pageTitle.replace(/-/g, ' ')}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <button
          onClick={() => document.dispatchEvent(new CustomEvent('open-command-palette'))}
          className="hidden md:flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400 hover:border-gray-300 transition-colors"
        >
          <Search className="h-4 w-4" />
          <span>{t('search')}</span>
          <kbd className="ml-4 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs text-gray-400">
            ⌘K
          </kbd>
        </button>

        {/* Language */}
        <LanguageSwitcher />

        {/* Notifications */}
        <NotificationDropdown />

        {/* Profile */}
        <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-brand-100">
          <AvatarImage src={user?.photoURL || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
      <CommandPalette />
    </header>
  );
}
