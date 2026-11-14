import { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { StatusPill } from '@/presentation/components/ui/StatusPill';
import { InfoList, InfoRow } from '@/presentation/components/shared/InfoList';
import { Card, CardBody, CardHeader } from '@/presentation/components/ui/Card';
import { TENANT_SITE_DOMAIN } from '@/config/site';
import { en } from '@/presentation/i18n/en';
import type { Tenant } from '@/domain/entities';

function siteUrl(slug: string | null | undefined): string | null {
  if (!slug || slug.trim().length === 0) return null;
  return `https://${slug}.${TENANT_SITE_DOMAIN}`;
}

function SiteLink({ href }: { href: string | null }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!href) return;
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  if (!href) return <span className="text-text-muted">{en.common.notAvailable}</span>;

  return (
    <span className="inline-flex max-w-full items-center gap-1.5">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-w-0 items-center gap-1.5 text-primary underline underline-offset-2"
      >
        <span className="truncate">{href}</span>
        <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={en.common.copyValue(href)}
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-[8px] text-text-muted transition-colors duration-150 hover:bg-bg-2 hover:text-text"
      >
        {copied ? (
          <Check aria-hidden="true" className="size-3.5 text-success-fg" />
        ) : (
          <Copy aria-hidden="true" className="size-3.5" />
        )}
      </button>
    </span>
  );
}

export function WebsiteTab({ tenant }: { tenant: Tenant }) {
  const websiteUrl = siteUrl(tenant.slug);
  // OPEN: website status is fixed to "in progress" until the backend returns it
  // (owner decision, agent.md section 30).
  const inProgress = { label: en.site.statusInProgress, tone: 'warning' as const };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><h3 className="text-xl font-semibold">{en.details.websiteUrl}</h3></CardHeader>
        <CardBody className="pt-0">
          <InfoList>
            <InfoRow label={en.details.websiteStatusLabel}>
              <StatusPill meta={inProgress} />
            </InfoRow>
            <InfoRow label={en.details.websiteUrl}>
              <SiteLink href={websiteUrl} />
            </InfoRow>
            <InfoRow label={en.details.pwaStatusLabel}>
              <StatusPill meta={inProgress} />
            </InfoRow>
            {/* OPEN: PWA link equals the website link until the backend returns a PWA URL
                (owner confirmed, agent.md section 30). */}
            <InfoRow label={en.details.pwaUrl}>
              <SiteLink href={websiteUrl} />
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
                <span className="font-mono text-mono text-text-muted">
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
                <span className="font-mono text-mono text-text-muted">
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
