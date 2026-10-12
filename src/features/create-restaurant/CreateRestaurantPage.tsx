import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/PageHeader';
import { PermissionDenied } from '@/components/shared/PermissionDenied';
import { usePermission } from '@/hooks/usePermission';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import { api } from '@/services';
import { endDateFromDuration } from '@/lib/subscription';
import { startOfToday, toIsoDate } from '@/lib/date';
import { en } from '@/i18n/en';
import type { CreateTenantInput, SocialLinks, Tenant } from '@/types';
import { STEPS, STEP_FIELDS, createRestaurantSchema } from './schema';
import type { CreateRestaurantValues, StepKey } from './schema';
import { CreateStepper } from './CreateStepper';
import { BasicsStep } from './BasicsStep';
import { SubscriptionStep } from './SubscriptionStep';
import { BranchesStep } from './BranchesStep';
import { ReviewStep } from './ReviewStep';
import { CreateSuccess } from './CreateSuccess';

function cleanSocials(socials: CreateRestaurantValues['socialLinks']): SocialLinks {
  const result: SocialLinks = {};
  if (socials.facebook) result.facebook = socials.facebook;
  if (socials.instagram) result.instagram = socials.instagram;
  if (socials.tiktok) result.tiktok = socials.tiktok;
  if (socials.website) result.website = socials.website;
  return result;
}

export function CreateRestaurantPage() {
  const { allowed } = usePermission('restaurant.create');
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [created, setCreated] = useState<Tenant | null>(null);

  const startIso = toIsoDate(startOfToday());

  const form = useForm<CreateRestaurantValues>({
    resolver: zodResolver(createRestaurantSchema),
    mode: 'onTouched',
    defaultValues: {
      businessName: '',
      restaurantName: '',
      contact: { phone: '', email: '' },
      logoUrl: '',
      brandColors: { primary: '#E43820', secondary: '#FF6B63' },
      socialLinks: { facebook: '', instagram: '', tiktok: '', website: '' },
      packageCode: 'start',
      durationMonths: 3,
      status: 'active',
      startDate: startIso,
      endDate: endDateFromDuration(startIso, 3),
      branches: [{ name: '', address: '', phone: '' }],
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateRestaurantValues) => {
      const input: CreateTenantInput = {
        businessName: values.businessName,
        restaurantName: values.restaurantName,
        contact: values.contact,
        logoUrl: values.logoUrl || null,
        brandColors: values.brandColors,
        socialLinks: cleanSocials(values.socialLinks),
        status: values.status,
        packageCode: values.packageCode,
        durationMonths: values.durationMonths,
        startDate: values.startDate,
        endDate: values.endDate,
        branches: values.branches.map((branch) => ({ ...branch, status: 'active' as const })),
      };
      return api.createTenant(input, user!);
    },
    onSuccess: (tenant) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      setCreated(tenant);
    },
    onError: (error: Error) => {
      toast({ title: en.common.somethingWentWrong, description: error.message, variant: 'error' });
    },
  });

  async function next() {
    const fields = STEP_FIELDS[STEPS[step]!];
    const valid = fields.length === 0 || (await form.trigger(fields));
    if (valid) setStep((value) => Math.min(value + 1, STEPS.length - 1));
  }

  function back() {
    setStep((value) => Math.max(value - 1, 0));
  }

  if (!allowed) {
    return (
      <div>
        <PageHeader title={en.create.title} subtitle={en.create.subtitle} />
        <PermissionDenied action="restaurant.create" />
      </div>
    );
  }

  if (created) {
    return (
      <div>
        <PageHeader title={en.create.title} />
        <CreateSuccess tenant={created} />
      </div>
    );
  }

  const currentStep: StepKey = STEPS[step]!;
  const isLast = step === STEPS.length - 1;

  return (
    <div>
      <PageHeader title={en.create.title} subtitle={en.create.subtitle} />
      <div className="rounded-card border border-border bg-card p-6 shadow-card">
        <CreateStepper steps={[...STEPS]} current={step} />

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (isLast) {
              void form.handleSubmit((values) => createMutation.mutate(values))();
            } else {
              void next();
            }
          }}
        >
          {currentStep === 'basics' && <BasicsStep form={form} />}
          {currentStep === 'subscription' && <SubscriptionStep form={form} />}
          {currentStep === 'branches' && <BranchesStep form={form} />}
          {currentStep === 'review' && <ReviewStep form={form} />}

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-6">
            {step > 0 && (
              <button
                type="button"
                onClick={back}
                className="inline-flex h-11 items-center rounded-panel border border-border bg-card px-4 text-sm font-medium text-text transition-colors duration-150 hover:bg-bg-2"
              >
                {en.common.back}
              </button>
            )}
            {isLast ? (
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex h-11 items-center gap-2 rounded-panel bg-primary px-4 text-sm font-medium text-white shadow-primary transition-colors duration-150 hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/50"
              >
                {createMutation.isPending && (
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {createMutation.isPending ? en.create.review.creating : en.create.review.createButton}
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex h-11 items-center rounded-panel bg-primary px-4 text-sm font-medium text-white shadow-primary transition-colors duration-150 hover:bg-primary-dark"
              >
                {en.common.next}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}