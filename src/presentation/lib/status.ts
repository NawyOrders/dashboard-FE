import { en } from '@/presentation/i18n/en';
import type {
  AccountStatus,
  AppStatus,
  BranchStatus,
  ChannelStatus,
  RestaurantStatus,
  SubscriptionStatus,
} from '@/domain/entities';
import type { Tone } from '@/presentation/components/ui/Badge';

export interface StatusMeta {
  label: string;
  tone: Tone;
}

export function restaurantStatusMeta(status: RestaurantStatus): StatusMeta {
  const tones: Record<RestaurantStatus, Tone> = {
    active: 'success',
    approved: 'success',
    pending: 'warning',
    pending_approval: 'warning',
    inactive: 'danger',
  };
  return { label: en.status.restaurant[status], tone: tones[status] };
}

export function subscriptionStatusMeta(status: SubscriptionStatus): StatusMeta {
  const tones: Record<SubscriptionStatus, Tone> = {
    active: 'success',
    expiring_soon: 'warning',
    expired: 'danger',
    not_started: 'neutral',
  };
  return { label: en.status.subscription[status], tone: tones[status] };
}

export function branchStatusMeta(status: BranchStatus): StatusMeta {
  const tones: Record<BranchStatus, Tone> = {
    active: 'success',
    pending: 'warning',
    inactive: 'danger',
  };
  return { label: en.status.branch[status], tone: tones[status] };
}

/** `null` or `not_tracked` render as the neutral "Not tracked" pill. */
export function channelStatusMeta(status: ChannelStatus | null): StatusMeta {
  const value: ChannelStatus = status ?? 'not_tracked';
  const tones: Record<ChannelStatus, Tone> = {
    ready: 'success',
    in_setup: 'warning',
    not_tracked: 'neutral',
  };
  return { label: en.status.channel[value], tone: tones[value] };
}

/** `null` (not tracked / not entitled) renders as neutral "Not tracked". */
export function appStatusMeta(status: AppStatus | null): StatusMeta {
  const value: AppStatus = status ?? 'not_started';
  const tones: Record<AppStatus, Tone> = {
    not_started: 'neutral',
    in_preparation: 'warning',
    submitted_to_store: 'warning',
    published: 'success',
  };
  return { label: en.status.app[value], tone: tones[value] };
}

export function adminAccountStatusMeta(status: AccountStatus): StatusMeta {
  const tones: Record<AccountStatus, Tone> = {
    active: 'success',
    inactive: 'neutral',
  };
  const labels: Record<AccountStatus, string> = {
    active: en.accounts.statusActive,
    inactive: en.accounts.statusInactive,
  };
  return { label: labels[status], tone: tones[status] };
}
