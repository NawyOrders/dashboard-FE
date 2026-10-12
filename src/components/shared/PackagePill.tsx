import { Badge } from '@/components/ui/Badge';
import { PACKAGES } from '@/config/packages';
import type { PackageCode } from '@/types';

export function PackagePill({ code }: { code: PackageCode }) {
  return <Badge tone={code === 'growth' ? 'primary' : 'neutral'}>{PACKAGES[code].name}</Badge>;
}