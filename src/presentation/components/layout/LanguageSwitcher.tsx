import { en, setLocale, useLocale } from '@/i18n';
import type { Locale } from '@/i18n';
import { cn } from '@/presentation/lib/cn';

export function LanguageSwitcher() {
  const locale = useLocale();
  const options: { value: Locale; label: string }[] = [
    { value: 'ar', label: en.language.arabic },
    { value: 'en', label: en.language.english },
  ];

  return (
    <div
      role="group"
      aria-label={en.language.label}
      className="inline-flex items-center rounded-panel border border-border bg-card p-0.5"
    >
      {options.map((option) => {
        const active = option.value === locale;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => setLocale(option.value)}
            className={cn(
              'rounded-[6px] px-2 py-1 text-2xs font-medium transition-colors duration-150',
              active ? 'bg-primary text-white' : 'text-text-muted hover:text-text',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
