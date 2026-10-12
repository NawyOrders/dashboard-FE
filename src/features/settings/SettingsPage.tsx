import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { en } from '@/i18n/en';

export function SettingsPage() {
  return (
    <div>
      <PageHeader title={en.settings.title} subtitle={en.settings.subtitle} />
      <div className="rounded-card border border-border bg-card shadow-card">
        <EmptyState title={en.settings.emptyTitle} description={en.settings.emptyBody} />
      </div>
    </div>
  );
}