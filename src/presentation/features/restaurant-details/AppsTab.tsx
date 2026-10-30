import { ExternalLink } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { en } from '@/presentation/i18n/en';
import { packageName } from '@/presentation/lib/package-copy';
import type { AppStatus, Tenant } from '@/domain/entities';
import { AppStatusStepper } from './AppStatusStepper';

function StoreLink({ href }: { href: string | null }) {
  if (!href) return <span className="text-2xs text-text-muted">{en.common.notAvailable}</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-2xs text-primary underline underline-offset-2"
    >
      {en.details.storeLink}
      <ExternalLink aria-hidden="true" className="size-3.5" />
    </a>
  );
}

function PlatformBlock({
  label,
  status,
  storeUrl,
}: {
  label: string;
  status: AppStatus | null;
  storeUrl: string | null;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-panel border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-text">{label}</span>
        {status === 'published' && <Badge tone="success" withDot>{en.status.app.published}</Badge>}
      </div>
      <AppStatusStepper status={status} />
      {(status === 'published' || storeUrl) && <StoreLink href={storeUrl} />}
    </div>
  );
}

export function AppsTab({ tenant }: { tenant: Tenant }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <h3 className="text-xl font-semibold">{en.details.appEligibility}</h3>
          <p className="mt-1 text-2xs text-text-muted">
            {en.manageFeatures.entitlementNote}
          </p>
        </div>
        <Badge tone="success" withDot>
          {packageName(tenant.subscription.packageCode)} · {en.details.entitled}
        </Badge>
      </CardHeader>
      <CardBody className="flex flex-col gap-4 pt-0">
        <PlatformBlock
          label={en.details.android}
          status={tenant.apps.android}
          storeUrl={tenant.apps.androidStoreUrl}
        />
        <PlatformBlock label={en.details.ios} status={tenant.apps.ios} storeUrl={tenant.apps.iosStoreUrl} />
      </CardBody>
    </Card>
  );
}