import type { OverviewAnalysis } from '@/application/dto';
import type { Clock, RestaurantRepository } from '@/application/ports';
import { contractsPerMonth } from '@/domain/rules/overview';
import { isListed } from '@/domain/rules/tenants';
import { OVERVIEW_CHART_MONTHS } from '@/config/policy';

/**
 * Compose the Overview contracts-per-month chart. The latest-contracts and ending-soon
 * tables read live endpoints instead (see `Api.getOverviewLatestContracts` and
 * `Api.getOverviewEndingSoon`). Time comes from the injected `Clock`, and the window from
 * `config/policy.ts` (agent.md §4b). Pending applications have no live contract.
 */
export function makeGetOverviewAnalysis(restaurants: RestaurantRepository, clock: Clock) {
  return function getOverviewAnalysis(): OverviewAnalysis {
    const tenants = restaurants.findAll().filter(isListed);
    return {
      contractsPerMonth: contractsPerMonth(tenants, clock.now(), OVERVIEW_CHART_MONTHS),
    };
  };
}
