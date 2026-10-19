import { PageHeader } from '@/presentation/components/shared/PageHeader';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { en } from '@/presentation/i18n/en';

export function SettingsPage() {
  return (
    <div>
      <PageHeader title={en.settings.title} subtitle={en.settings.subtitle} />
      <div className="rounded-card border border-border bg-card">
        <EmptyState title={en.settings.emptyTitle} description={en.settings.emptyBody} />
      </div>
    </div>
  );
}