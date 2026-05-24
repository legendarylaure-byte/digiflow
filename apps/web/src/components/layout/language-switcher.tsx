'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTransition } from 'react';
import { Globe } from 'lucide-react';

const locales = [
  { value: 'en', label: 'EN' },
  { value: 'ne', label: 'ने' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale(nextLocale: string) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale as 'en' | 'ne' });
    });
  }

  const currentLabel = locales.find((l) => l.value === locale)?.label || 'EN';

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        onClick={() => switchLocale(locale === 'en' ? 'ne' : 'en')}
        disabled={isPending}
      >
        <Globe className="h-4 w-4" />
        {isPending ? '...' : currentLabel}
      </button>
    </div>
  );
}
