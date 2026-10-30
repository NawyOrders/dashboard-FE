import { Badge } from '@/presentation/components/ui/Badge';
import { packageName } from '@/presentation/lib/package-copy';
import type { PackageCode } from '@/domain/entities';

export function PackagePill({ code }: { code: PackageCode }) {
  return <Badge tone={code === 'growth' ? 'primary' : 'neutral'}>{packageName(code)}</Badge>;
}
