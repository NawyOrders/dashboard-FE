import { en } from '@/presentation/i18n/en';
import type {
  AccountStatus,
  AppStatus,
  BranchStatus,
  ChannelStatus,
  PaymentStatus,
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

// Website, PWA and the mobile app share one pill until the backend returns these fields
// (owner decision, agent.md section 30). Built per call so the live i18n proxy switches language.
export function channelStatusMeta(_status: ChannelStatus | null): StatusMeta {
  return { label: en.site.statusInProgress, tone: 'warning' };
}

export function appStatusMeta(_status: AppStatus | null): StatusMeta {
  return { label: en.site.statusInProgress, tone: 'warning' };
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

export function paymentStatusMeta(status: PaymentStatus): StatusMeta {
  if (status === 'paid') {
    return { label: en.payments.completed, tone: 'success' };
  }
  return { label: en.payments.notCompleted, tone: 'warning' };
}
