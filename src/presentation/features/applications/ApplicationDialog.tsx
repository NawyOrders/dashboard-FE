import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/presentation/components/ui/Dialog';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { ConfirmDialog } from '@/presentation/components/ui/ConfirmDialog';
import { useCurrentUser } from '@/presentation/hooks/useCurrentUser';
import { useToast } from '@/presentation/hooks/useToast';
import { api } from '@/app/composition';
import { validateApplicationForApprove } from '@/domain/rules/application-validators';
import { getRequiredFieldsList } from '@/domain/rules/application-validators';
import type { Tenant } from '@/domain/entities';

interface ApplicationDialogProps {
  tenant: Tenant | null;
  onClose: () => void;
  onApproved: () => void;
  onDeleted: () => void;
}

export function ApplicationDialog({ tenant, onClose, onApproved, onDeleted }: ApplicationDialogProps) {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const isSuperAdmin = user?.role === 'super_admin';
  const isReadOnly = !isSuperAdmin;

  const [form, setForm] = useState<Tenant | null>(null);
  const [approveErrors, setApproveErrors] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (tenant) {
      setForm(JSON.parse(JSON.stringify(tenant)) as Tenant);
      setApproveErrors([]);
      setDeleteReason('');
      setShowDeleteConfirm(false);
    } else {
      setForm(null);
    }
  }, [tenant]);

  const requiredList = useMemo(() => getRequiredFieldsList(), []);

  function updateField(path: string, value: unknown) {
    if (!form) return;
    const next = JSON.parse(JSON.stringify(form)) as any;
    const parts = path.split('.');
    let cur = next;
    for (let i = 0; i < parts.length - 1; i += 1) {
      if (cur[parts[i]] == null) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
    setForm(next as Tenant);
  }

  async function handleSave() {
    if (!form || !user) return;
    setSaving(true);
    try {
      await (api as any).updateApplication?.(form.id, form, user);
      toast({ title: 'Changes saved', variant: 'success' });
    } catch {
      toast({ title: 'Failed to save changes', variant: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove() {
    if (!form || !user) return;
    const validation = validateApplicationForApprove(form);
    if (!validation.ok) {
      setApproveErrors(validation.errors);
      // focus first invalid field best effort
      return;
    }
    setApproveErrors([]);
    setApproving(true);
    try {
      await (api as any).approveApplication?.(form.id, user);
      toast({ title: 'Application approved', variant: 'success' });
      onApproved();
    } catch {
      toast({ title: 'Failed to approve', variant: 'error' });
    } finally {
      setApproving(false);
    }
  }

  async function handleDelete() {
    if (!form || !user) return;
    if (deleteReason.trim().length < 5) {
      return;
    }
    setDeleting(true);
    try {
      await (api as any).deleteApplication?.(form.id, deleteReason.trim(), user);
      toast({ title: 'Application deleted', variant: 'success' });
      setShowDeleteConfirm(false);
      onDeleted();
    } catch {
      toast({ title: 'Failed to delete', variant: 'error' });
    } finally {
      setDeleting(false);
    }
  }

  if (!tenant || !form) return null;

  const address = (form.contact as any)?.address ?? (form as any).address ?? '';

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application details</DialogTitle>
          </DialogHeader>
          {approveErrors.length > 0 ? (
            <div className="rounded-card border border-danger bg-danger-bg p-3 text-sm text-danger-fg">
              <ul className="list-disc pl-5">
                {approveErrors.map((e, idx) => (
                  <li key={idx}>{e}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-text">Restaurant name</label>
              <Input
                value={form.restaurantName || ''}
                onChange={(e) => updateField('restaurantName', e.target.value)}
                placeholder="Restaurant name"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text">Tenant ID</label>
              <Input value={form.tenantId || ''} disabled readOnly />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text">Owner name</label>
              <Input
                value={(form.contact as any)?.name || ''}
                onChange={(e) => updateField('contact.name', e.target.value)}
                placeholder="Owner name"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text">Owner email</label>
              <Input
                value={(form.contact as any)?.email || ''}
                onChange={(e) => updateField('contact.email', e.target.value)}
                placeholder="Owner email"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text">Phone</label>
              <Input
                value={(form.contact as any)?.phone || ''}
                onChange={(e) => updateField('contact.phone', e.target.value)}
                placeholder="Phone"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text">Address</label>
              <Input
                value={address}
                onChange={(e) => {
                  updateField('contact.address', e.target.value);
                }}
                placeholder="Address"
                disabled={isReadOnly}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-text">Branch details</label>
              {(form.branches || []).map((branch, idx) => (
                <div key={branch.id || idx} className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <Input
                    value={branch.name || ''}
                    onChange={(e) => {
                      const next = JSON.parse(JSON.stringify(form)) as any;
                      next.branches[idx].name = e.target.value;
                      setForm(next);
                    }}
                    placeholder="Branch name"
                    disabled={isReadOnly}
                  />
                  <Input
                    value={branch.phone || ''}
                    onChange={(e) => {
                      const next = JSON.parse(JSON.stringify(form)) as any;
                      next.branches[idx].phone = e.target.value;
                      setForm(next);
                    }}
                    placeholder="Branch phone"
                    disabled={isReadOnly}
                  />
                </div>
              ))}
              {(form.branches || []).length === 0 ? (
                <Input value="" placeholder="Branch name and phone required" disabled={isReadOnly} />
              ) : null}
            </div>
          </div>
          <DialogFooter>
            {isSuperAdmin ? (
              <>
                <Button variant="secondary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </Button>
                <Button onClick={handleApprove} disabled={approving}>
                  {approving ? 'Approving...' : 'Approve'}
                </Button>
                <Button
                  variant="ghost"
                  className="text-danger-fg"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete application
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete application"
        body={Delete application for ? This action cannot be undone.}
        confirmLabel="Delete application"
        cancelLabel="Cancel"
        loading={deleting}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      >
        <div className="mt-3">
          <label className="mb-1 block text-sm text-text">Reason (required, at least 5 characters)</label>
          <Input
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            placeholder="Enter reason"
          />
          {deleteReason.trim().length > 0 && deleteReason.trim().length < 5 ? (
            <p className="mt-1 text-xs text-error">Reason must be at least 5 characters</p>
          ) : null}
        </div>
      </ConfirmDialog>
    </>
  );
}
