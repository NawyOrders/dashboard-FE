import { ChevronLeft, ChevronRight } from 'lucide-react';
import { en } from '@/presentation/i18n/en';
import { cn } from '@/presentation/lib/cn';

export interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

type PageItem = number | 'ellipsis-left' | 'ellipsis-right';

function buildPages(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<PageItem>([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter(
    (p): p is number => typeof p === 'number' && p >= 1 && p <= total,
  ).sort((a, b) => a - b);

  const items: PageItem[] = [];
  let previous = 0;
  for (const p of sorted) {
    if (p - previous > 1) {
      items.push(previous < 2 ? 'ellipsis-left' : 'ellipsis-right');
    }
    items.push(p);
    previous = p;
  }
  return items;
}

const PAGE_SIZES = [8, 16, 32];

export function Pagination({
  page,
  pageCount,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
      <p className="text-2xs text-text-muted">{en.common.showingRange(from, to, total)}</p>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-2xs text-text-muted">
          {en.common.rowsPerPage}
          <select
            aria-label={en.common.rowsPerPage}
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-9 rounded-panel border border-border bg-card px-2 text-2xs text-text focus:border-primary focus:outline-none"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="inline-flex size-9 items-center justify-center rounded-panel border border-border text-text transition-colors duration-150 hover:bg-bg-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          {buildPages(page, pageCount).map((item, index) => {
            if (typeof item === 'string') {
              return (
                <span key={`${item}-${index}`} aria-hidden="true" className="px-1 text-2xs text-text-muted">
                  …
                </span>
              );
            }
            return (
              <button
                key={item}
                type="button"
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onPageChange(item)}
                className={cn(
                  'inline-flex size-9 items-center justify-center rounded-panel text-sm transition-colors duration-150',
                  item === page
                    ? 'bg-primary font-semibold text-white'
                    : 'text-text hover:bg-bg-2',
                )}
              >
                {item}
              </button>
            );
          })}
          <button
            type="button"
            aria-label="Next page"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            className="inline-flex size-9 items-center justify-center rounded-panel border border-border text-text transition-colors duration-150 hover:bg-bg-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </nav>
      </div>
    </div>
  );
}