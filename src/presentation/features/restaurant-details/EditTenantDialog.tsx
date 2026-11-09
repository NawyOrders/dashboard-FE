import { useEffect, useState } from 'react';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Input } from '@/presentation/components/ui/Input';
import { en } from '@/presentation/i18n/en';
import type { Tenant, UpdateTenantInput } from '@/domain/entities';

interface EditTenantDialogProps {
  open: boolean;
  tenant: Tenant;
  loading: boolean;
  onClose: () => void;
  onSubmit: (input: UpdateTenantInput) => void;
}

export function EditTenantDialog({ open, tenant, loading, onClose, onSubmit }: EditTenantDialogProps) {
  const [slug, setSlug] = useState(tenant.slug ?? '');
  const [nameEn, setNameEn] = useState(tenant.restaurantName);
  const [nameAr, setNameAr] = useState(tenant.restaurantNameAr ?? '');
  const [ownerName, setOwnerName] = useState(tenant.contact.name ?? '');
  const [ownerEmail, setOwnerEmail] = useState(tenant.contact.email);
  const [ownerPhone, setOwnerPhone] = useState(tenant.contact.phone);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSlug(tenant.slug ?? '');
    setNameEn(tenant.restaurantName);
    setNameAr(tenant.restaurantNameAr ?? '');
    setOwnerName(tenant.contact.name ?? '');
    setOwnerEmail(tenant.contact.email);
    setOwnerPhone(tenant.contact.phone);
    setNameError(null);
  }, [open, tenant]);

  function handleSubmit() {
    const englishName = nameEn.trim();
    if (englishName.length === 0) {
      setNameError(en.details.editNameRequired);
      return;
    }
    setNameError(null);
    onSubmit({
      slug: slug.trim() || null,
      restaurantNameEn: englishName,
      restaurantNameAr: nameAr.trim() || null,
      ownerFullName: ownerName.trim() || null,
      ownerEmail: ownerEmail.trim() || null,
      ownerPhone: ownerPhone.trim() || null,
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={en.details.editTenantTitle}
      description={en.details.editTenantHint}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {en.common.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? en.applications.saving : en.common.save}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          id="tenant-slug"
          label={en.details.editSlug}
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          disabled={loading}
        />
        <Input
          id="tenant-name-en"
          label={en.details.editNameEn}
          value={nameEn}
          onChange={(event) => {
            setNameEn(event.target.value);
            if (nameError) setNameError(null);
          }}
          error={nameError ?? undefined}
          disabled={loading}
        />
        <Input
          id="tenant-name-ar"
          label={en.details.editNameAr}
          value={nameAr}
          onChange={(event) => setNameAr(event.target.value)}
          dir="rtl"
          disabled={loading}
        />
        <Input
          id="tenant-owner-name"
          label={en.details.editOwnerName}
          value={ownerName}
          onChange={(event) => setOwnerName(event.target.value)}
          disabled={loading}
        />
        <Input
          id="tenant-owner-email"
          type="email"
          label={en.details.editOwnerEmail}
          value={ownerEmail}
          onChange={(event) => setOwnerEmail(event.target.value)}
          disabled={loading}
        />
        <Input
          id="tenant-owner-phone"
          type="tel"
          label={en.details.editOwnerPhone}
          value={ownerPhone}
          onChange={(event) => setOwnerPhone(event.target.value)}
          disabled={loading}
        />
      </div>
    </Dialog>
  );
}
