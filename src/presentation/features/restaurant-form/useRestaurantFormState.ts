import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { requireRegistrationSchema } from '@/config/registration-schema';
import { PACKAGE_BRANCH_LIMITS } from '@/domain/rules/packages';
import type { DurationMonths, PackageCode, Tenant } from '@/domain/entities';
import { DURATIONS } from '@/domain/entities';
import {
  buildFormValues,
  emptyBranch,
  repeatableStep,
} from './form-model';
import type { RestaurantFormValues } from './form-model';

/**
 * State of the schema-driven registration form.
 *
 * The form is driven by the JSON schema; the subscription uses package and duration
 * from the owner's package configuration.
 */
export function useRestaurantFormState(tenant: Tenant) {
  const schema = requireRegistrationSchema();

  const [values, setValues] = useState<RestaurantFormValues>(() =>
    buildFormValues(schema, tenant),
  );
  const branchCounter = useRef(values.branches.length);
  const logoPreviewRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (!logoPreviewRef.current) return;
      URL.revokeObjectURL(logoPreviewRef.current);
      logoPreviewRef.current = null;
    },
    [],
  );

  const setField = useCallback((key: string, value: string) => {
    setValues((current) => ({ ...current, fields: { ...current.fields, [key]: value } }));
  }, []);

  const setBranchField = useCallback((branchId: string, key: string, value: string) => {
    setValues((current) => ({
      ...current,
      branches: current.branches.map((branch) =>
        branch.id === branchId
          ? { ...branch, fields: { ...branch.fields, [key]: value } }
          : branch,
      ),
    }));
  }, []);

  const addBranch = useCallback(() => {
    setValues((current) => {
      branchCounter.current += 1;
      const branch = emptyBranch(schema, `branch_new_${branchCounter.current}`);
      return { ...current, branches: [...current.branches, branch] };
    });
  }, [schema]);

  const removeBranch = useCallback((branchId: string) => {
    setValues((current) => ({
      ...current,
      branches: current.branches.filter((branch) => branch.id !== branchId),
    }));
  }, []);

  const setPackageCode = useCallback((packageCode: PackageCode) => {
    setValues((current) => ({ ...current, packageCode }));
  }, []);

  const setDurationMonths = useCallback((durationMonths: DurationMonths) => {
    if (!DURATIONS.includes(durationMonths)) return;
    setValues((current) => ({ ...current, durationMonths }));
  }, []);

  const setLogoAsset = useCallback((logoAssetId: string | null) => {
    setValues((current) => ({ ...current, logoAssetId }));
  }, []);

  /** Preview-only slug; kept in form state and never sent with submit or PATCH. */
  const setSlug = useCallback((slug: string) => {
    setValues((current) => ({ ...current, slug }));
  }, []);

  /** Keeps a local preview URL for the picked file; the previous one is revoked. */
  const setLogoPreviewFile = useCallback((file: File | null) => {
    const next = file ? URL.createObjectURL(file) : null;
    const previous = logoPreviewRef.current;
    logoPreviewRef.current = next;
    setValues((current) => ({ ...current, logoPreviewUrl: next }));
    if (previous) URL.revokeObjectURL(previous);
  }, []);

  const reset = useCallback(() => {
    if (logoPreviewRef.current) {
      URL.revokeObjectURL(logoPreviewRef.current);
      logoPreviewRef.current = null;
    }
    setValues(buildFormValues(schema, tenant));
  }, [schema, tenant]);

  const branchLimits = useMemo(() => {
    if (values.packageCode) return PACKAGE_BRANCH_LIMITS[values.packageCode];
    // No package yet: the branch editor uses the union of the configured policy limits.
    const limits = Object.values(PACKAGE_BRANCH_LIMITS);
    return {
      min: Math.min(...limits.map((item) => item.min)),
      max: Math.max(...limits.map((item) => item.max)),
    };
  }, [values.packageCode]);

  const itemFields = useMemo(() => repeatableStep(schema)?.itemFields ?? [], [schema]);

  return {
    schema,
    values,
    setField,
    setBranchField,
    addBranch,
    removeBranch,
    setPackageCode,
    setDurationMonths,
    setLogoAsset,
    setLogoPreviewFile,
    setSlug,
    reset,
    branchLimits,
    itemFields,
  };
}
