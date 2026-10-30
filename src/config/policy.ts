/**
 * Platform policy constants.
 *
 * These are intentionally kept as configurable constants (not hard-coded behavior)
 * because the spec leaves them as OPEN DECISIONS. Do not treat them as final rules.
 */

import { PACKAGE_BRANCH_LIMITS } from '@/domain/rules/packages';

// OPEN DECISION: subscription expiry warning threshold is not defined in the spec.
// ASSUMPTION: 30 days is a conservative, common default used only for display highlighting.
export const EXPIRING_SOON_DAYS = 30;

// OPEN DECISION: subscription start-date rule is undefined.
// ASSUMPTION: no automatic rule. Operators pick the start date manually in the form.
export const SUBSCRIPTION_START_DATE_RULE = 'manual' as const;

// OPEN DECISION: grace period / suspension policy is undefined.
// ASSUMPTION: no automation whatsoever. Expired subscriptions are displayed as `expired`
// but nothing changes a restaurant or subscription status automatically.
export const GRACE_PERIOD_DAYS: number | null = null;
export const AUTO_SUSPEND_ON_EXPIRY = false;

// OPEN DECISION: website/PWA/app status fields are not guaranteed in the data model.
// ASSUMPTION: they are optional; when absent they render as "Not tracked".
export const TREAT_NULL_CHANNEL_STATUS_AS_NOT_TRACKED = true;

// NW-247: the branch limit is 2 for EVERY package (owner decision), so the platform-wide
// included-branch count is derived from the package rules and never drifts from them.
// There is no extra-branch fee: it is not defined, so it is neither shown nor calculated.
export const INCLUDED_BRANCHES = Math.max(
  ...Object.values(PACKAGE_BRANCH_LIMITS).map((limits) => limits.max),
);

// OPEN DECISION: reference prices are not confirmed as final commercial terms.
// The note shown under "Reference prices" lives in the translation files
// (`details.referencePriceNote`) so it follows the selected language.

// OPEN DECISION: the "ending within 2 weeks" window is fixed by the design brief.
// It is intentionally separate from EXPIRING_SOON_DAYS (which drives the KPI card and badges).
export const OVERVIEW_ENDING_WITHIN_DAYS = 14;

// Number of most-recent contracts shown in the Overview "Latest Contracts" table.
export const OVERVIEW_LATEST_CONTRACTS_COUNT = 8;

// Number of calendar months (including the current one) shown in the contracts chart.
export const OVERVIEW_CHART_MONTHS = 6;

// NW-246: the fields an application must carry are no longer listed here — they come
// from the registration JSON (`src/config/restaurant-registration-fields.json`) and are
// validated by `domain/rules/registration-validation.ts`.
