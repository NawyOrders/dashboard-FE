import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { api } from '@/app/composition';
import { Button } from '@/presentation/components/ui/Button';
import { ConfirmDialog } from '@/presentation/components/ui/ConfirmDialog';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Input } from '@/presentation/components/ui/Input';
import { PasswordInput } from '@/presentation/components/ui/PasswordInput';
import { PackagePill } from '@/presentation/components/shared/PackagePill';
import { TenantLogo } from '@/presentation/components/shared/TenantLogo';
import { useCurrentUser } from '@/presentation/hooks/useCurrentUser';
import { useToast } from '@/presentation/hooks/useToast';
import { en } from '@/presentation/i18n/en';
import { cn } from '@/presentation/lib/cn';
import type { Tenant } from '@/domain/entities';
import type { RegistrationProblem } from '@/domain/rules/registration-validation';
import { validateRegistrationForApprove } from '@/domain/rules/registration-validation';
import { RestaurantForm } from '@/presentation/features/restaurant-form/RestaurantForm';
import { FORM_GROUP_IDS } from '@/presentation/features/restaurant-form/form-groups';
import { toTenantPatch } from '@/presentation/features/restaurant-form/form-model';
import { useRestaurantFormState } from '@/presentation/features/restaurant-form/useRestaurantFormState';

interface ApplicationDialogProps {
  tenant: Tenant | null;
  onClose: () => void;
  onApproved: () => void;
  onDeleted: () => void;
  onSaved: () => void;
}

function problemMessage(problem: RegistrationProblem): string {
  if (problem.message) return problem.message;
  switch (problem.reason) {
    case 'required':
      return en.registration.requiredField;
    case 'maxLength':
      return en.registration.tooLong(problem.maxLength ?? 0);
    case 'minLength':
      return en.registration.tooShort(problem.minLength ?? 0);
    case 'digits':
      return en.registration.digitsOnly;
    case 'range':
      return en.registration.outOfRange(problem.min ?? 0, problem.max ?? 0);
    case 'email':
      return en.registration.invalidEmail;
    case 'pattern':
      return en.registration.invalidPhone;
    case 'option':
      return en.registration.invalidOption;
    case 'branchCount':
      return en.registration.branchCount(problem.min ?? 0, problem.max ?? 0);
    default:
      return en.registration.invalidValue;
  }
}

/** DOM id of the field a problem belongs to. */
function problemFieldId(problem: RegistrationProblem): string {
  if (problem.fieldKey === 'branches') return FORM_GROUP_IDS.branches;
  if (problem.scope === 'branch' && problem.branchId) {
    return `rf-branch-${problem.branchId}-${problem.fieldKey}`;
  }
  return `rf-field-${problem.fieldKey}`;
}

export function ApplicationDialog({ tenant, onClose, onApproved, onDeleted, onSaved }: ApplicationDialogProps) {
  if (!tenant) return null;
  return (
    <ApplicationDialogContent
      tenant={tenant}
      onClose={onClose}
      onApproved={onApproved}
      onDeleted={onDeleted}
      onSaved={onSaved}
    />
  );
}

function ApplicationDialogContent({
  tenant,
  onClose,
  onApproved,
  onDeleted,
  onSaved,
}: ApplicationDialogProps & { tenant: Tenant }) {
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

  const [problems, setProblems] = useState<RegistrationProblem[]>([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    for (const problem of problems) {
      if (problem.scope !== 'field') continue;
      errors[problem.fieldKey] = problemMessage(problem);
    }
    return errors;
  }, [problems]);

  const branchErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    for (const problem of problems) {
      if (problem.scope !== 'branch' || !problem.branchId) continue;
      errors[`${problem.branchId}.${problem.fieldKey}`] = problemMessage(problem);
    }
    return errors;
  }, [problems]);

  function focusField(problem: RegistrationProblem) {
    const element = document.getElementById(problemFieldId(problem));
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.focus({ preventScroll: true });
  }

  function scrollToGroup(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

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
    setProblems([]);
    toast({ title: en.applications.discarded, variant: 'neutral' });
  }

  async function handleApprove() {
    if (!user) return;
    const result = validateRegistrationForApprove(
      { ...tenant, ...toTenantPatch(values, tenant) } as Tenant,
      schema,
      branchLimits,
      { label: en.applications.adminPasswordLabel, value: adminPassword },
    );
    if (!result.ok) {
      setProblems(result.problems);
      const first = result.problems[0];
      if (first) {
        window.setTimeout(() => focusField(first), 0);
      }
      return;
    }
    setProblems([]);
    setApproving(true);
    try {
      // The approval is based on what the reviewer sees, so the form is stored first.
      await api.updateApplication(tenant.id, toTenantPatch(values, tenant), user);
      await api.approveApplication(tenant.id, adminPassword, user);
      setAdminPassword('');
      toast({
        title: en.applications.approveSuccess,
        description: en.applications.adminPasswordCreated,
        variant: 'success',
      });
      onApproved();
    } catch {
      toast({ title: en.applications.approveError, variant: 'error' });
    } finally {
      setApproving(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    if (deleteReason.trim().length < 5) return;
    setDeleting(true);
    try {
      await api.deleteApplication(tenant.id, deleteReason.trim(), user);
      toast({ title: en.applications.deleted, variant: 'success' });
      setShowDeleteConfirm(false);
      onDeleted();
    } catch {
      toast({ title: en.applications.deleteFailed, variant: 'error' });
    } finally {
      setDeleting(false);
    }
  }

  const links = [
    { id: FORM_GROUP_IDS.details, label: en.registration.groups.details },
    { id: FORM_GROUP_IDS.branches, label: en.registration.groups.branches },
    { id: FORM_GROUP_IDS.subscription, label: en.registration.groups.subscription },
  ];

  return (
    <>
      <Dialog
        open
        onClose={onClose}
        title={en.applications.viewTitle}
        size="full"
        footer={
          <>
            {isSuperAdmin ? (
              <Button
                variant="ghost"
                className="me-auto text-danger-fg"
                onClick={() => setShowDeleteConfirm(true)}
              >
                {en.applications.delete}
              </Button>
            ) : null}
            {isSuperAdmin ? (
              <>
                <Button variant="secondary" onClick={handleDiscard} disabled={saving || approving}>
                  {en.applications.discard}
                </Button>
                <Button variant="secondary" onClick={handleSave} disabled={saving || approving}>
                  {saving ? en.applications.saving : en.applications.saveChanges}
                </Button>
                <Button onClick={handleApprove} disabled={approving || saving}>
                  {approving ? en.applications.approving : en.applications.approve}
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={onClose}>
                {en.common.close}
              </Button>
            )}
          </>
        }
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="flex flex-col gap-4 md:sticky md:top-0 md:self-start">
            <div className="flex flex-col items-start gap-3 rounded-card border border-border bg-bg-2/50 p-4">
              {tenant.logoUrl ? (
                <img
                  src={tenant.logoUrl}
                  alt=""
                  className="size-16 rounded-card border border-border object-cover"
                />
              ) : (
                <TenantLogo name={tenant.restaurantName} size="lg" />
              )}
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-text">{tenant.restaurantName}</span>
                <span className="text-2xs text-text-muted">{tenant.contact.email}</span>
                <span className="font-mono text-2xs text-text-muted">{tenant.tenantId}</span>
              </div>
              <PackagePill code={tenant.subscription.packageCode} />
            </div>

            <nav className="flex flex-col gap-1" aria-label={en.applications.viewTitle}>
              {links.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollToGroup(link.id)}
                  className={cn(
                    'rounded-panel px-3 py-2 text-start text-2xs font-medium text-text-muted',
                    'transition-colors duration-150 hover:bg-bg-2 hover:text-text',
                  )}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex flex-col gap-6">
            {problems.length > 0 ? (
              <div className="flex flex-col gap-2 rounded-card border border-danger bg-danger-bg p-4">
                <span className="flex items-center gap-2 text-sm font-semibold text-danger-fg">
                  <AlertTriangle aria-hidden="true" className="size-4" />
                  {en.applications.validationTitle}
                </span>
                <span className="text-2xs text-danger-fg">{en.applications.validationHint}</span>
                <ul className="flex flex-col gap-1">
                  {problems.map((problem, index) => (
                    <li key={`${problem.fieldKey}-${problem.branchId ?? ''}-${index}`}>
                      <button
                        type="button"
                        onClick={() => focusField(problem)}
                        className="text-start text-2xs text-danger-fg underline underline-offset-2 hover:text-text"
                      >
                        {problem.scope === 'branch' && problem.branchIndex !== undefined
                          ? `${problem.label} — ${en.registration.groups.branches} ${problem.branchIndex + 1}`
                          : problem.label}
                        : {problemMessage(problem)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-card border border-border bg-card p-4">
              <PasswordInput
                id="rf-field-adminPassword"
                label={en.applications.adminPasswordLabel}
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                error={fieldErrors.adminPassword}
                hint={en.applications.adminPasswordHint}
                disabled={!isSuperAdmin}
                autoComplete="new-password"
              />
            </div>

            <RestaurantForm
              steps={schema.steps}
              values={values}
              branchLimits={branchLimits}
              disabled={!isSuperAdmin}
              errors={fieldErrors}
              branchErrors={branchErrors}
              onFieldChange={setField}
              onBranchFieldChange={setBranchField}
              onAddBranch={addBranch}
              onRemoveBranch={removeBranch}
              onPackageChange={setPackageCode}
              onDurationChange={setDurationMonths}
            />
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={showDeleteConfirm}
        title={en.applications.deleteTitle}
        body={en.applications.deleteBody(tenant.restaurantName)}
        confirmLabel={en.applications.delete}
        cancelLabel={en.common.cancel}
        loading={deleting}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      >
        <div className="mt-3">
          <label htmlFor="delete-reason" className="mb-1 block text-2xs font-medium text-text">
            {en.applications.deleteReason}
          </label>
          <Input
            id="delete-reason"
            value={deleteReason}
            onChange={(event) => setDeleteReason(event.target.value)}
            placeholder={en.applications.deleteReasonPlaceholder}
          />
          {deleteReason.trim().length > 0 && deleteReason.trim().length < 5 ? (
            <p className="mt-1 text-2xs text-error">{en.applications.deleteReasonTooShort}</p>
          ) : null}
        </div>
      </ConfirmDialog>
    </>
  );
}
