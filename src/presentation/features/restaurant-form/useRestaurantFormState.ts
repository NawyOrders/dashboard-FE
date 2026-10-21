import { useCallback, useMemo, useRef, useState } from 'react';
import { requireRegistrationSchema } from '@/config/registration-schema';
import { PACKAGES } from '@/config/packages';
import type { PackageCode, Tenant } from '@/domain/entities';
import type { BillingCycle } from '@/domain/rules/registration-schema';
import {
  buildFormValues,
  emptyBranch,
  repeatableStep,
  subscriptionStep,
} from './form-model';
import type { RestaurantFormValues } from './form-model';

/**
 * State of the schema-driven registration form (NW-246).
 *
 * The form is driven by the JSON schema: the branch repeater, the package selection and
 * the billing cycle all come from the schema and the package configuration.
 */
export function useRestaurantFormState(tenant: Tenant) {
  const schema = requireRegistrationSchema();
  const defaultCycle: BillingCycle = subscriptionStep(schema)?.billingCycle?.default ?? 'monthly';

  const [values, setValues] = useState<RestaurantFormValues>(() =>
    buildFormValues(schema, tenant, defaultCycle),
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

  const setBillingCycle = useCallback((billingCycle: BillingCycle) => {
    setValues((current) => ({ ...current, billingCycle }));
  }, []);

  const reset = useCallback(() => {
    setValues(buildFormValues(schema, tenant, defaultCycle));
  }, [schema, tenant, defaultCycle]);

  const branchLimits = useMemo(
    () => PACKAGES[values.packageCode].branchLimits,
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
    setBillingCycle,
    reset,
    branchLimits,
    itemFields,
  };
}
