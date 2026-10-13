import { ExternalLink } from 'lucide-react';
import { StatusPill } from '@/presentation/components/ui/StatusPill';
import { InfoList, InfoRow } from '@/presentation/components/shared/InfoList';
import { Card, CardBody, CardHeader } from '@/presentation/components/ui/Card';
import { channelStatusMeta } from '@/presentation/lib/status';
import { en } from '@/presentation/i18n/en';
import type { Tenant } from '@/domain/entities';

function LinkValue({ href }: { href: string | null }) {
  if (!href) return <span className="text-text-muted">{en.common.notAvailable}</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-primary underline underline-offset-2"
    >
      <span className="truncate">{href}</span>
      <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
    </a>
  );
}

export function WebsiteTab({ tenant }: { tenant: Tenant }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><h3 className="text-xl font-semibold">{en.details.websiteUrl}</h3></CardHeader>
        <CardBody className="pt-0">
          <InfoList>
            <InfoRow label={en.details.websiteStatusLabel}>
              <StatusPill meta={channelStatusMeta(tenant.channels.websiteStatus)} />
            </InfoRow>
            <InfoRow label={en.details.websiteUrl}>
              <LinkValue href={tenant.channels.websiteUrl} />
            </InfoRow>
            <InfoRow label={en.details.pwaStatusLabel}>
              <StatusPill meta={channelStatusMeta(tenant.channels.pwaStatus)} />
            </InfoRow>
            <InfoRow label={en.details.pwaUrl}>
              <LinkValue href={tenant.channels.pwaUrl} />
            </InfoRow>
            <InfoRow label={en.details.previewLink}>
              <LinkValue href={tenant.channels.previewUrl} />
            </InfoRow>
          </InfoList>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h3 className="text-xl font-semibold">{en.details.appliedBrand}</h3></CardHeader>
        <CardBody className="pt-0">
          <InfoList>
            <InfoRow label={en.details.primaryColor}>
              <span className="inline-flex items-center gap-2">
                <span
                  className="size-6 rounded-[8px] border border-border"
                  style={{ backgroundColor: tenant.brandColors.primary }}
                />
                <span className="font-mono text-[13px] text-text-muted">
                  {tenant.brandColors.primary.toUpperCase()}
                </span>
              </span>
            </InfoRow>
            <InfoRow label={en.details.secondaryColor}>
              <span className="inline-flex items-center gap-2">
                <span
                  className="size-6 rounded-[8px] border border-border"
                  style={{ backgroundColor: tenant.brandColors.secondary }}
                />
                <span className="font-mono text-[13px] text-text-muted">
                  {tenant.brandColors.secondary.toUpperCase()}
                </span>
              </span>
            </InfoRow>
            <InfoRow label={en.details.brand}>{tenant.restaurantName}</InfoRow>
          </InfoList>
        </CardBody>
      </Card>
    </div>
  );
}