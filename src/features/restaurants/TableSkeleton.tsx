import { Card, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3 p-6 pt-0" aria-busy="true" aria-label="Loading restaurants">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-avatar" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  );
}

export function TableCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <div className="flex gap-3">
          <Skeleton className="h-11 w-56" />
          <Skeleton className="h-11 w-44" />
          <Skeleton className="h-11 w-28" />
        </div>
      </CardHeader>
      <TableSkeleton />
    </Card>
  );
}