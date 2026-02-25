import type { AppLocale } from '../i18n';

// 日付をフォーマット
export function formatDate(dateString: string, locale: AppLocale = 'ja'): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const localeTag = locale === 'ja' ? 'ja-JP' : 'en-US';
  return new Intl.DateTimeFormat(localeTag, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}
