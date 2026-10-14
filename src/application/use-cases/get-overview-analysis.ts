import type { OverviewAnalysis } from '@/application/dto';
import type { Clock, RestaurantRepository } from '@/application/ports';
import { contractsPerMonth, endingSoon, latestContracts } from '@/domain/rules/overview';
import {
  OVERVIEW_CHART_MONTHS,
  OVERVIEW_ENDING_WITHIN_DAYS,
  OVERVIEW_LATEST_CONTRACTS_COUNT,
} from '@/config/policy';

/**
 * Compose the three Overview analysis datasets. Time comes from the injected `Clock`,
 * and the window/count thresholds from `config/policy.ts` (agent.md §4b).
 */
export function makeGetOverviewAnalysis(restaurants: RestaurantRepository, clock: Clock) {
  return function getOverviewAnalysis(): OverviewAnalysis {
    const tenants = restaurants.findAll();
    const now = clock.now();
    return {
      contractsPerMonth: contractsPerMonth(tenants, now, OVERVIEW_CHART_MONTHS),
      latestContracts: latestContracts(tenants, OVERVIEW_LATEST_CONTRACTS_COUNT),
      endingSoon: endingSoon(tenants, now, OVERVIEW_ENDING_WITHIN_DAYS),
    };
  };
}
