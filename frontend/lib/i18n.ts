import type { Language } from '@/types';

const LANG_KEY = 'lang_pref';

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  return (localStorage.getItem(LANG_KEY) as Language) ?? 'en';
}

export function setLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANG_KEY, lang);
}

export function t(en: string, am: string, lang?: Language): string {
  const l = lang ?? getLanguage();
  return l === 'am' ? am : en;
}
