import type { UseFormReturn } from 'react-hook-form';
import { Input } from '@/presentation/components/ui/Input';
import { en } from '@/presentation/i18n/en';
import { tokens } from '@/presentation/theme/tokens';
import type { CreateRestaurantValues } from './schema';

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function ColorField({ label, value, onChange, error }: ColorFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-2xs font-medium text-text">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : tokens.colors.primary.DEFAULT}
          onChange={(event) => onChange(event.target.value)}
          className="size-11 shrink-0 cursor-pointer rounded-panel border border-border bg-card p-1"
        />
        <input
          type="text"
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={tokens.colors.primary.DEFAULT}
          className="h-11 w-full rounded-panel border border-border bg-card px-3 font-mono text-[13px] text-text focus:border-primary focus:outline-none"
        />
      </div>
      {error && <span className="text-2xs text-error">{error}</span>}
    </div>
  );
}

export function BasicsStep({ form }: { form: UseFormReturn<CreateRestaurantValues> }) {
  const { register, formState } = form;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Input
        label={en.create.basics.businessName}
        error={formState.errors.businessName?.message}
        {...register('businessName')}
      />
      <Input
        label={en.create.basics.restaurantName}
        error={formState.errors.restaurantName?.message}
        {...register('restaurantName')}
      />
      <Input
        label={en.create.basics.phone}
        error={formState.errors.contact?.phone?.message}
        {...register('contact.phone')}
      />
      <Input
        label={en.create.basics.email}
        type="email"
        error={formState.errors.contact?.email?.message}
        {...register('contact.email')}
      />
      <Input
        label={en.create.basics.logo}
        hint={en.create.basics.logoHint}
        error={formState.errors.logoUrl?.message}
        {...register('logoUrl')}
      />

      <div className="grid grid-cols-2 gap-4">
        <ColorField
          label={en.create.basics.primaryColor}
          value={form.watch('brandColors.primary')}
          onChange={(value) => form.setValue('brandColors.primary', value, { shouldValidate: true })}
          error={formState.errors.brandColors?.primary?.message}
        />
        <ColorField
          label={en.create.basics.secondaryColor}
          value={form.watch('brandColors.secondary')}
          onChange={(value) => form.setValue('brandColors.secondary', value, { shouldValidate: true })}
          error={formState.errors.brandColors?.secondary?.message}
        />
      </div>

      <div className="sm:col-span-2">
        <p className="mb-2 text-2xs font-medium text-text-muted">{en.create.basics.socials}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label={en.create.basics.facebook} error={formState.errors.socialLinks?.facebook?.message} {...register('socialLinks.facebook')} />
          <Input label={en.create.basics.instagram} error={formState.errors.socialLinks?.instagram?.message} {...register('socialLinks.instagram')} />
          <Input label={en.create.basics.tiktok} error={formState.errors.socialLinks?.tiktok?.message} {...register('socialLinks.tiktok')} />
          <Input label={en.create.basics.website} error={formState.errors.socialLinks?.website?.message} {...register('socialLinks.website')} />
        </div>
      </div>
    </div>
  );
}