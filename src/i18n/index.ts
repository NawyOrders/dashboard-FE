import { useSyncExternalStore } from 'react';
import { ar } from './ar';
import { en as enDictionary } from './en';
import type { Dictionary, Locale } from './en';

export type { Dictionary, Locale };

const STORAGE_KEY = 'nawy_locale';
const DEFAULT_LOCALE: Locale = 'ar';

const dictionaries: Record<Locale, Dictionary> = { ar, en: enDictionary };
const listeners = new Set<() => void>();

function isLocale(value: string | null): value is Locale {
  return value === 'ar' || value === 'en';
}

function readStoredLocale(): Locale {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

let currentLocale: Locale = readStoredLocale();

export function getLocale(): Locale {
  return currentLocale;
}

export function applyLocaleToDocument(locale: Locale): void {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
}

export function setLocale(locale: Locale): void {
  if (locale === currentLocale) return;
  currentLocale = locale;
  try {
    sessionStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore
  }
  applyLocaleToDocument(locale);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getLocale, getLocale);
}

export function initializeLocale(): void {
  applyLocaleToDocument(currentLocale);
}

/**
 * Live dictionary handle: modules keep importing `en` from the old path, but every
 * property read resolves against the active locale, so strings follow the language
 * switch without re-importing or restarting the app.
 */
export const en: Dictionary = new Proxy({} as Dictionary, {
  get(_target, property) {
    if (typeof property === 'symbol') return undefined;
    return dictionaries[currentLocale][property as keyof Dictionary];
  },
});

function flattenKeys(value: unknown, prefix: string, out: string[]): string[] {
  if (value !== null && typeof value === 'object') {
    for (const key of Object.keys(value as Record<string, unknown>)) {
      flattenKeys((value as Record<string, unknown>)[key], prefix ? `${prefix}.${key}` : key, out);
    }
    return out;
  }
  out.push(prefix);
  return out;
}

if (import.meta.env.DEV) {
  const englishKeys = new Set(flattenKeys(enDictionary, '', []));
  const arabicKeys = new Set(flattenKeys(ar, '', []));
  const missingInArabic = [...englishKeys].filter((key) => !arabicKeys.has(key));
  const missingInEnglish = [...arabicKeys].filter((key) => !englishKeys.has(key));
  if (missingInArabic.length > 0 || missingInEnglish.length > 0) {
    console.error('Translation keys do not match between en and ar.', {
      missingInArabic,
      missingInEnglish,
    });
  }
}
