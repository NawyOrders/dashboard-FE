import { useCallback, useMemo, useRef, useState } from 'react';
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

  const reset = useCallback(() => {
    setValues(buildFormValues(schema, tenant));
  }, [schema, tenant]);

  const branchLimits = useMemo(
    () => PACKAGE_BRANCH_LIMITS[values.packageCode],
    [values.packageCode],
  );

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
    reset,
    branchLimits,
    itemFields,
  };
}
