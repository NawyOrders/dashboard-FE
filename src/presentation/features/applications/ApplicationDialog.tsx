import { useEffect, useRef, useState } from 'react';
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
import {
  isTenantProvisioningActive,
  isTenantProvisioningFailed,
  isTenantProvisioningFinal,
} from '@/domain/rules/tenant-provisioning';

const PROVISIONING_POLL_MS = 5_000;
const PROVISIONING_TIMEOUT_MS = 60_000;

import { MenuOcrSection } from './MenuOcrSection';
import { RestaurantForm } from '@/presentation/features/restaurant-form/RestaurantForm';
import { FORM_GROUP_IDS } from '@/presentation/features/restaurant-form/form-groups';
import { useRestaurantFormState } from '@/presentation/features/restaurant-form/useRestaurantFormState';

interface ApplicationDialogProps {
  tenant: Tenant | null;
  onClose: () => void;
  onApproved: () => void;
  onRejected: () => void;
  onSaved: () => void;
}

function provisioningHint(status: string): string {
  if (isTenantProvisioningActive(status)) return en.applications.provisioning.activeHint;
  if (isTenantProvisioningFailed(status)) return en.applications.provisioning.failedHint;
  return en.applications.provisioning.pendingHint;
}

export function ApplicationDialog({ tenant, onClose, onApproved, onRejected, onSaved }: ApplicationDialogProps) {
  if (!tenant) return null;
  return (
    <ApplicationDialogContent
      tenant={tenant}
      onClose={onClose}
      onApproved={onApproved}
      onRejected={onRejected}
      onSaved={onSaved}
    />
  );
}

function ApplicationDialogContent({
  tenant,
  onClose,
  onApproved,
  onRejected,
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
    branchLimits,
  } = useRestaurantFormState(tenant);

  const offers = useOffers();

  const [paid, setPaid] = useState(tenant.paymentStatus === 'paid');
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [approving, setApproving] = useState(false);
  const [provisioning, setProvisioning] = useState<TenantProvisioning | null>(null);
  const [provisioningDeadline, setProvisioningDeadline] = useState<number | null>(null);
  const [provisioningTimedOut, setProvisioningTimedOut] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const provisioningDoneRef = useRef(false);

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

  useEffect(() => {
    if (!provisioning || provisioningDoneRef.current) return;
    if (isTenantProvisioningFinal(provisioning.status)) return;
    if (provisioningTimedOut || provisioningDeadline === null) return;

    const tenantId = provisioning.tenantId;
    let cancelled = false;

    const poll = async () => {
      if (Date.now() >= provisioningDeadline) {
        setProvisioningTimedOut(true);
        return;
      }
      setStatusLoading(true);
      try {
        const next = await api.getTenantStatus(tenantId);
        if (!cancelled) setProvisioning(next);
      } catch {
        // Transient status errors are retried until the polling deadline.
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    };

    const timer = window.setInterval(() => void poll(), PROVISIONING_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [provisioning, provisioningDeadline, provisioningTimedOut]);

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

  async function handleApprove() {
    if (!user) return;
    if (!paid) {
      document
        .getElementById('payment-approval-blocker')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setApproving(true);
    try {
      const next = await api.approveApplication(tenant.id, user);
      setAdminPassword('');
      setProvisioning(next);
      if (!isTenantProvisioningFinal(next.status)) {
        setProvisioningTimedOut(false);
        setProvisioningDeadline(Date.now() + PROVISIONING_TIMEOUT_MS);
      }
    } catch {
      toast({ title: en.applications.approveError, variant: 'error' });
    } finally {
      setApproving(false);
    }
  }

  async function handleReject() {
    if (!user) return;
    const reason = rejectReason.trim();
    if (reason.length === 0) {
      setRejectError(en.applications.rejectReasonRequired);
      return;
    }
    setRejecting(true);
    try {
      await api.rejectApplication(tenant.id, reason, user);
      toast({ title: en.applications.rejected, variant: 'success' });
      setShowRejectConfirm(false);
      onRejected();
    } catch {
      toast({ title: en.applications.rejectFailed, variant: 'error' });
    } finally {
      setRejecting(false);
    }
  }

  function openRejectConfirm() {
    setRejectReason('');
    setRejectError(null);
    setShowRejectConfirm(true);
  }

  async function handleRefreshStatus() {
    if (!provisioning || statusLoading) return;
    setStatusLoading(true);
    try {
      const next = await api.getTenantStatus(provisioning.tenantId);
      setProvisioning(next);
      if (!isTenantProvisioningFinal(next.status)) {
        setProvisioningTimedOut(false);
        setProvisioningDeadline(Date.now() + PROVISIONING_TIMEOUT_MS);
      }
    } catch {
      toast({ title: en.applications.provisioning.refreshFailed, variant: 'error' });
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleRetryProvisioning() {
    if (!provisioning || retrying) return;
    // agent.md section 26: a new Idempotency-Key per attempt.
    const idempotencyKey = crypto.randomUUID();
    setRetrying(true);
    try {
      const next = await api.retryTenant(provisioning.tenantId, idempotencyKey);
      setProvisioning(next);
      if (isTenantProvisioningFinal(next.status)) {
        setProvisioningDeadline(null);
      } else {
        setProvisioningTimedOut(false);
        setProvisioningDeadline(Date.now() + PROVISIONING_TIMEOUT_MS);
      }
    } catch {
      toast({ title: en.applications.provisioning.retryFailed, variant: 'error' });
    } finally {
      setRetrying(false);
    }
  }

  const links = [
    { id: FORM_GROUP_IDS.details, label: en.registration.groups.details },
    { id: FORM_GROUP_IDS.branches, label: en.registration.groups.branches },
    { id: FORM_GROUP_IDS.subscription, label: en.registration.groups.subscription },
  ];

  const busy = approving || rejecting || provisioning !== null;

  return (
    <>
      <Dialog
        open
        onClose={onClose}
        title={en.applications.viewTitle}
        size="full"
        footer={
          isSuperAdmin ? (
            <>
              <Button
                variant="ghost"
                className="me-auto text-danger-fg"
                onClick={openRejectConfirm}
                disabled={busy}
              >
                {en.applications.reject}
              </Button>
              <Button variant="secondary" onClick={onClose} disabled={busy}>
                {en.common.close}
              </Button>
              <Button onClick={handleApprove} disabled={busy}>
                {approving ? en.applications.approving : en.applications.approve}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={onClose}>
              {en.common.close}
            </Button>
          )
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
                {isTenantProvisioningFailed(provisioning.status) ? (
                  <div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void handleRetryProvisioning()}
                      disabled={retrying}
                    >
                      {retrying
                        ? en.applications.provisioning.retrying
                        : en.applications.provisioning.retry}
                    </Button>
                  </div>
                ) : provisioningTimedOut ? (
                  <div className="flex flex-col items-start gap-2">
                    <p className="rounded-panel border border-warning-fg bg-warning-bg px-3 py-2 text-2xs font-medium text-warning-fg">
                      {en.applications.provisioning.timedOut}
                    </p>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void handleRefreshStatus()}
                      disabled={statusLoading}
                    >
                      {en.applications.provisioning.refreshStatus}
                    </Button>
                  </div>
                ) : null}
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

            {/* OPEN: admin password has no field in approve, backend to confirm */}
            <div className="rounded-card border border-border bg-card p-4">
              <PasswordInput
                id="rf-field-adminPassword"
                label={en.applications.adminPasswordLabel}
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                hint={en.applications.adminPasswordHint}
                disabled={!isSuperAdmin || provisioning !== null}
                autoComplete="new-password"
              />
            </div>

            <MenuOcrSection disabled={!isSuperAdmin} referenceId={tenant.id} />

            <RestaurantForm
              steps={schema.steps}
              values={values}
              branchLimits={branchLimits}
              paymentStatus={paid ? 'paid' : 'unpaid'}
              disabled
              offers={offers.data}
              subscriptionReadOnly
              submittedPrice={tenant.agreedPrice}
              onFieldChange={setField}
              onBranchFieldChange={setBranchField}
              onAddBranch={addBranch}
              onRemoveBranch={removeBranch}
            />
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={showRejectConfirm}
        title={en.applications.rejectTitle}
        body={en.applications.rejectBody(tenant.restaurantName)}
        confirmLabel={en.applications.reject}
        cancelLabel={en.common.cancel}
        loading={rejecting}
        onCancel={() => setShowRejectConfirm(false)}
        onConfirm={() => void handleReject()}
      >
        <div className="mt-3">
          <Input
            id="reject-reason"
            label={en.applications.rejectReason}
            value={rejectReason}
            onChange={(event) => {
              setRejectReason(event.target.value);
              if (rejectError) setRejectError(null);
            }}
            placeholder={en.applications.rejectReasonPlaceholder}
            error={rejectError ?? undefined}
          />
        </div>
      </ConfirmDialog>
    </>
  );
}
