/**
 * Platform policy constants.
 *
 * These are intentionally kept as configurable constants (not hard-coded behavior)
 * because the spec leaves them as OPEN DECISIONS. Do not treat them as final rules.
 */

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

// OPEN DECISION: platform notifications are not defined.
// ASSUMPTION: the bell is rendered but disabled and empty until the feature is decided.
export const NOTIFICATIONS_ENABLED = false;

// OPEN DECISION: website/PWA/app status fields are not guaranteed in the data model.
// ASSUMPTION: they are optional; when absent they render as "Not tracked".
export const TREAT_NULL_CHANNEL_STATUS_AS_NOT_TRACKED = true;

// OPEN DECISION: whether extra branches beyond the included 4 require a fee is undefined.
// ASSUMPTION: we only show the note; no price is displayed anywhere.
export const INCLUDED_BRANCHES = 4;
export const EXTRA_BRANCH_FEE_DEFINED = false;

// OPEN DECISION: reference prices are not confirmed as final commercial terms.
export const REFERENCE_PRICE_NOTE =
  'Reference price — tax inclusion and payment terms not yet confirmed';
