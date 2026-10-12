import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { en } from '@/i18n/en';
import type { Tenant } from '@/types';

export function CreateSuccess({ tenant }: { tenant: Tenant }) {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-success-bg text-success-fg">
        <CheckCircle2 aria-hidden="true" className="size-8" />
      </span>
      <h2 className="text-2xl font-semibold text-text">{en.create.review.successTitle}</h2>
      <p className="text-sm text-text-muted">{en.create.review.successBody}</p>
      <p className="font-mono text-[13px] text-text-muted">{tenant.tenantId}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button onClick={() => navigate(`/restaurants/${tenant.id}`)}>{en.common.openDetails}</Button>
        <Button variant="secondary" onClick={() => navigate('/restaurants')}>
          {en.common.backToList}
        </Button>
      </div>
    </div>
  );
}