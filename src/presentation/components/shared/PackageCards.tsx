import { Check } from 'lucide-react';
import { PACKAGE_LIST } from '@/config/packages';
import { packageFeatureLabel, packageName, packageTagline } from '@/presentation/lib/package-copy';
import { cn } from '@/presentation/lib/cn';
import type { PackageCode } from '@/domain/entities';

export interface PackageCardsProps {
  value: PackageCode;
  onChange: (code: PackageCode) => void;
  disabled?: boolean;
}

export function PackageCards({ value, onChange, disabled }: PackageCardsProps) {
  return (
    <div role="radiogroup" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {PACKAGE_LIST.map((pkg) => {
        const selected = pkg.code === value;
        return (
          <button
            key={pkg.code}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(pkg.code)}
            className={cn(
              'flex flex-col gap-2 rounded-panel border p-4 text-start transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60',
              selected ? 'border-primary bg-bg-2/60' : 'border-border hover:border-primary-light',
            )}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-text">{packageName(pkg.code)}</span>
              {selected && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white">
                  <Check aria-hidden="true" className="size-3" />
                </span>
              )}
            </span>
            <span className="text-2xs text-text-muted">{packageTagline(pkg.code)}</span>
            <span className="mt-1 flex flex-wrap gap-1">
              {pkg.features.map((feature) => (
                <span key={feature} className="rounded-pill bg-card px-2 py-0.5 text-2xs text-text-muted">
                  {packageFeatureLabel(feature)}
                </span>
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
}