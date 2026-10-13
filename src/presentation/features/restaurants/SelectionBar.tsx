import { Download } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { en } from '@/presentation/i18n/en';

export interface SelectionBarProps {
  count: number;
  onDeselectAll: () => void;
  onExport: () => void;
}

export function SelectionBar({ count, onDeselectAll, onExport }: SelectionBarProps) {
  if (count === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-panel border border-primary-light bg-bg-2 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-text">{en.common.itemsSelected(count)}</span>
        <button
          type="button"
          onClick={onDeselectAll}
          className="text-2xs font-medium text-primary underline underline-offset-2"
        >
          {en.common.deselectAll}
        </button>
      </div>
      <Button variant="secondary" size="sm" onClick={onExport}>
        <Download aria-hidden="true" className="size-4" />
        {en.restaurants.exportSelected}
      </Button>
    </div>
  );
}