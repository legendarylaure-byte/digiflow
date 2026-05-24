import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const routing = {
  locales: ['en', 'ne'] as const,
  defaultLocale: 'en' as const,
  localeDetection: true,
  localePrefix: 'always',
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as 'en' | 'ne')) {
    locale = routing.defaultLocale;
  }

  try {
    const messages = (await import(`../../messages/${locale}.json`)).default;
    return {
      locale,
      messages,
    };
  } catch {
    notFound();
  }
});
