import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { api } from '@/app/composition';
import { Button } from '@/presentation/components/ui/Button';
import { Checkbox } from '@/presentation/components/ui/Checkbox';
import { ConfirmDialog } from '@/presentation/components/ui/ConfirmDialog';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Input } from '@/presentation/components/ui/Input';
import { PasswordInput } from '@/presentation/components/ui/PasswordInput';
import { PackagePill } from '@/presentation/components/shared/PackagePill';
import { TenantLogo } from '@/presentation/components/shared/TenantLogo';
import { useCurrentUser } from '@/presentation/hooks/useCurrentUser';
import { useOffers } from '@/presentation/hooks/queries';
import { useToast } from '@/presentation/hooks/useToast';
import { en } from '@/presentation/i18n/en';
import { formatDateTime } from '@/domain/rules/date';
import { cn } from '@/presentation/lib/cn';
import { paymentStatusMeta } from '@/presentation/lib/status';
import { StatusPill } from '@/presentation/components/ui/StatusPill';
import type { Tenant, TenantProvisioning } from '@/domain/entities';
import type { RegistrationProblem } from '@/domain/rules/registration-validation';
import { validateRegistrationForApprove } from '@/domain/rules/registration-validation';
import {
  isTenantProvisioningActive,
  isTenantProvisioningFailed,
} from '@/domain/rules/tenant-provisioning';
import { RestaurantForm } from '@/presentation/features/restaurant-form/RestaurantForm';
import { FORM_GROUP_IDS } from '@/presentation/features/restaurant-form/form-groups';
import { fieldLabelByKey } from '@/presentation/features/restaurant-form/localized-schema';
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
function problemFieldId(problem: RegistrationProblem): string {  if (problem.fieldKey === 'branches') return FORM_GROUP_IDS.branches;
  if (problem.scope === 'branch' && problem.branchId) {
    return `rf-branch-${problem.branchId}-${problem.fieldKey}`;
  }
  return `rf-field-${problem.fieldKey}`;
}

/** The JSON field label is Arabic; the screen shows the label of the active locale. */
function problemLabel(problem: RegistrationProblem): string {
  const scope = problem.scope === 'branch' ? 'branch' : 'restaurant';
  return fieldLabelByKey(problem.fieldKey, scope) ?? problem.label;
}

function provisioningHint(status: string): string {
  if (isTenantProvisioningActive(status)) return en.applications.provisioning.activeHint;
  if (isTenantProvisioningFailed(status)) return en.applications.provisioning.failedHint;
  return en.applications.provisioning.pendingHint;
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
    reset,
    branchLimits,
  } = useRestaurantFormState(tenant);

  const offers = useOffers();

  const [problems, setProblems] = useState<RegistrationProblem[]>([]);
  const [paid, setPaid] = useState(tenant.paymentStatus === 'paid');
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [provisioning, setProvisioning] = useState<TenantProvisioning | null>(null);
  const provisioningKeyRef = useRef<string | null>(null);
  const provisioningDoneRef = useRef(false);

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

  useEffect(() => {
    setPaid(tenant.paymentStatus === 'paid');
  }, [tenant.id, tenant.paymentStatus]);

  useEffect(() => {
    if (!provisioning || provisioningDoneRef.current) return;
    if (!isTenantProvisioningActive(provisioning.status)) return;
    provisioningDoneRef.current = true;
    toast({
      title: en.applications.approveSuccess,
      description: en.applications.adminPasswordCreated,
      variant: 'success',
    });
    onApproved();
  }, [provisioning, toast, onApproved]);

  async function handlePaymentChange(next: boolean) {
    if (!user || paymentSaving) return;
    const previous = paid;
    setPaid(next);
    setPaymentSaving(true);
    try {
      await api.updateApplicationPayment(tenant.id, next, user);
      // The toast is shown only after the PATCH resolves successfully.
      toast({ title: en.applications.paymentUpdated, variant: 'success' });
      onSaved();
    } catch {
      setPaid(previous);
    } finally {
      setPaymentSaving(false);
    }
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
    if (!paid) {
      document
        .getElementById('payment-approval-blocker')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
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
    const idempotencyKey = crypto.randomUUID();
    provisioningKeyRef.current = idempotencyKey;
    setApproving(true);
    try {
      const next = await api.approveApplication(tenant.id, adminPassword, user, idempotencyKey);
      setAdminPassword('');
      setProvisioning(next);
    } catch {
      provisioningKeyRef.current = null;
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
                <Button
                  variant="secondary"
                  onClick={handleDiscard}
                  disabled={saving || approving || provisioning !== null}
                >
                  {en.applications.discard}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleSave}
                  disabled={saving || approving || provisioning !== null}
                >
                  {saving ? en.applications.saving : en.applications.saveChanges}
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={approving || saving || provisioning !== null}
                >
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
                <span dir="ltr" className="text-sm font-semibold text-text">
                  {tenant.restaurantName}
                </span>
                {tenant.restaurantNameAr ? (
                  <span dir="rtl" className="text-2xs text-text-muted">
                    {tenant.restaurantNameAr}
                  </span>
                ) : null}
                <span className="text-2xs text-text-muted">{tenant.contact.email}</span>
                <span className="font-mono text-2xs text-text-muted">{tenant.tenantId}</span>
                <span className="text-2xs text-text-muted">
                  {en.applications.branchCount}: {tenant.branches.length}
                </span>
                <span className="text-2xs text-text-muted">
                  {en.applications.submittedAt}:{' '}
                  {formatDateTime(tenant.submittedAtUtc ?? tenant.createdAt)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <PackagePill code={tenant.subscription.packageCode} />
                <StatusPill meta={paymentStatusMeta(paid ? 'paid' : 'unpaid')} />
              </div>
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
            {provisioning ? (
              <div
                role="status"
                aria-live="polite"
                className="flex flex-col gap-2 rounded-card border border-border bg-card p-4"
              >
                <span className="text-sm font-semibold text-text">
                  {en.applications.provisioning.title}
                </span>
                <div className="flex flex-wrap items-center gap-2 text-2xs text-text-muted">
                  <span>{en.applications.provisioning.statusLabel}:</span>
                  <span className="rounded-panel border border-border bg-bg-2 px-2 py-1 font-medium text-text">
                    {en.applications.provisioning.statusValue(provisioning.status)}
                  </span>
                </div>
                {provisioning.activatedAtUtc ? (
                  <span className="text-2xs text-text-muted">
                    {en.applications.provisioning.activatedAt}:{' '}
                    {formatDateTime(provisioning.activatedAtUtc)}
                  </span>
                ) : null}
                <p className="text-2xs text-text-muted">{provisioningHint(provisioning.status)}</p>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 rounded-card border border-border bg-card p-4">
              <Checkbox
                id="rf-field-paid"
                label={en.applications.paymentCompleted}
                checked={paid}
                disabled={!isSuperAdmin || paymentSaving}
                onChange={(event) => void handlePaymentChange(event.target.checked)}
              />
              {!paid ? (
                <p
                  id="payment-approval-blocker"
                  role="alert"
                  className="rounded-panel border border-warning-fg bg-warning-bg px-3 py-2 text-2xs font-medium text-warning-fg"
                >
                  {en.applications.paymentRequiredBeforeApproval}
                </p>
              ) : null}
            </div>

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
                          ? `${problemLabel(problem)} — ${en.registration.groups.branches} ${problem.branchIndex + 1}`
                          : problemLabel(problem)}
                        : {problemMessage(problem)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* OPEN: not in submit DTO, backend to confirm. */}
            <div className="rounded-card border border-border bg-card p-4">
              <PasswordInput
                id="rf-field-adminPassword"
                label={en.applications.adminPasswordLabel}
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                error={fieldErrors.adminPassword}
                hint={en.applications.adminPasswordHint}
                disabled={!isSuperAdmin || provisioning !== null}
                autoComplete="new-password"
              />
            </div>

            <RestaurantForm
              steps={schema.steps}
              values={values}
              branchLimits={branchLimits}
              paymentStatus={paid ? 'paid' : 'unpaid'}
              disabled={!isSuperAdmin}
              offers={offers.data}
              subscriptionReadOnly
              submittedPrice={tenant.agreedPrice}
              errors={fieldErrors}
              branchErrors={branchErrors}
              onFieldChange={setField}
              onBranchFieldChange={setBranchField}
              onAddBranch={addBranch}
              onRemoveBranch={removeBranch}
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
