import { useState } from 'react';
import { api } from '@/app/composition';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';
import { useCurrentUser } from '@/presentation/hooks/useCurrentUser';
import { useToast } from '@/presentation/hooks/useToast';
import { en } from '@/presentation/i18n/en';
import type { Tenant } from '@/domain/entities';
import { RestaurantForm } from '@/presentation/features/restaurant-form/RestaurantForm';
import { toTenantPatch } from '@/presentation/features/restaurant-form/form-model';
import { useRestaurantFormState } from '@/presentation/features/restaurant-form/useRestaurantFormState';

export interface RegistrationTabProps {
  tenant: Tenant;
  onSaved: () => void;
}

/**
 * The same schema-driven registration form, reused on the approved restaurant details
 * page (NW-246). Saving writes the form values and the activity log records the change.
 */
export function RegistrationTab({ tenant, onSaved }: RegistrationTabProps) {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const isSuperAdmin = user?.role === 'super_admin';

  const {
    schema,
    values,
    setField,
    setBranchField,
    addBranch,
    removeBranch,
    setPackageCode,
    setDurationMonths,
    reset,
    branchLimits,
  } = useRestaurantFormState(tenant);

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await api.updateApplication(tenant.id, toTenantPatch(values, tenant), user);
      toast({ title: en.applications.changesSaved, variant: 'success' });
      onSaved();
    } catch {
      toast({ title: en.applications.saveFailed, variant: 'error' });
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    reset();
    toast({ title: en.applications.discarded, variant: 'neutral' });
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-text">{en.registration.groups.details}</h3>
        {isSuperAdmin ? (
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleDiscard} disabled={saving}>
              {en.applications.discard}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? en.applications.saving : en.applications.saveChanges}
            </Button>
          </div>
        ) : null}
      </div>

      <RestaurantForm
        steps={schema.steps}
        values={values}
        branchLimits={branchLimits}
        disabled={!isSuperAdmin}
        onFieldChange={setField}
        onBranchFieldChange={setBranchField}
        onAddBranch={addBranch}
        onRemoveBranch={removeBranch}
        onPackageChange={setPackageCode}
        onDurationChange={setDurationMonths}
      />
    </Card>
  );
}
