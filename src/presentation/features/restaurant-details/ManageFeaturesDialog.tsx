import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { ConfirmDialog } from '@/presentation/components/ui/ConfirmDialog';
import { Switch } from '@/presentation/components/ui/Switch';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { Badge } from '@/presentation/components/ui/Badge';
import { useFeatureFlags } from '@/presentation/hooks/queries';
import { queryKeys } from '@/presentation/hooks/queries';
import { usePermission } from '@/presentation/hooks/usePermission';
import { useCurrentUser } from '@/presentation/hooks/useCurrentUser';
import { useToast } from '@/presentation/hooks/useToast';
import { api } from '@/app/composition';
import { packageHasFeature } from '@/domain/rules/packages';
import { packageFeatureLabel, packageName } from '@/presentation/lib/package-copy';
import { en } from '@/presentation/i18n/en';
import type { PackageFeatureKey, Tenant } from '@/domain/entities';

const FEATURES: PackageFeatureKey[] = ['website', 'pwa', 'admin_panel', 'android_app', 'ios_app'];

export interface ManageFeaturesDialogProps {
  open: boolean;
  tenant: Tenant;
  onClose: () => void;
}

export function ManageFeaturesDialog({ open, tenant, onClose }: ManageFeaturesDialogProps) {
  const flagsQuery = useFeatureFlags(tenant.id);
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { allowed } = usePermission('feature.toggle');
  const [pending, setPending] = useState<{ key: PackageFeatureKey; next: boolean } | null>(null);

  const mutation = useMutation({
    mutationFn: (input: { key: PackageFeatureKey; next: boolean }) =>
      api.setFeatureFlag(tenant.id, input.key, input.next, user!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flags(tenant.id) });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      setPending(null);
      toast({ title: en.toasts.updated, variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: en.common.somethingWentWrong, description: error.message, variant: 'error' });
    },
  });

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={en.manageFeatures.title}
        description={en.manageFeatures.subtitle}
        size="md"
      >
        <p className="mb-4 rounded-panel bg-bg-2 px-4 py-3 text-2xs text-primary-dark">
          {en.manageFeatures.entitlementNote}
        </p>

        {flagsQuery.isLoading ? (
          <div className="flex flex-col gap-3">
            {FEATURES.map((key) => (
              <Skeleton key={key} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {FEATURES.map((key) => {
              const featureAllowed = packageHasFeature(tenant.subscription.packageCode, key);
              const flag = flagsQuery.data?.find((item) => item.key === key);
              const enabled = flag?.enabled ?? false;
              const locked = !featureAllowed;
              return (
                <li key={key} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">{packageFeatureLabel(key)}</p>
                    <p className="text-2xs text-text-muted">
                      {locked
                        ? en.manageFeatures.lockedForStart
                        : enabled
                          ? en.manageFeatures.enabled
                          : en.manageFeatures.disabled}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {locked && (
                      <Badge tone="neutral">
                        <Lock aria-hidden="true" className="size-3" />
                        {packageName('growth')}
                      </Badge>
                    )}
                    <Switch
                      label={packageFeatureLabel(key)}
                      checked={enabled && featureAllowed}
                      disabled={locked || !allowed}
                      onCheckedChange={(next) => setPending({ key, next })}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-4 text-2xs text-text-muted">{en.manageFeatures.entitlementNote}</p>
      </Dialog>

      <ConfirmDialog
        open={pending !== null}
        title={en.activity.actions.feature_toggled}
        changes={
          pending
            ? [
                {
                  label: packageFeatureLabel(pending.key),
                  previous: pending.next ? en.manageFeatures.disabled : en.manageFeatures.enabled,
                  next: pending.next ? en.manageFeatures.enabled : en.manageFeatures.disabled,
                },
              ]
            : []
        }
        loading={mutation.isPending}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) mutation.mutate(pending);
        }}
      />
    </>
  );
}