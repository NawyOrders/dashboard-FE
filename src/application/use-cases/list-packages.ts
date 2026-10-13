import type { PackageDefinition } from '@/domain/entities';
import { PACKAGE_LIST } from '@/config/packages';

export function makeListPackages() {
  return function listPackages(): PackageDefinition[] {
    return PACKAGE_LIST;
  };
}
