import { en } from '@/presentation/i18n/en';
import type { SalesMonthBucket } from '@/domain/rules/sales';
import { formatEgp } from '@/presentation/lib/format';

export interface ScaleOptions {
  /** Source months, oldest to newest. */
  buckets: SalesMonthBucket[];
  width: number;
  height: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
}

export interface ChartPoint {
  x: number;
  y: number;
  index: number;
  bucket: SalesMonthBucket;
}

const TARGET_TICKS = 5;

/** Rounds a rough step up to the nearest 1, 2, 5 or 10 × 10ⁿ. */
function niceStep(max: number): number {
  const rough = max / TARGET_TICKS;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const normalized = rough / magnitude;
  let nice = 10;
  if (normalized <= 1) nice = 1;
  else if (normalized <= 2) nice = 2;
  else if (normalized <= 5) nice = 5;
  return nice * magnitude;
}

/**
 * Axis ticks from 0 to the first step ≥ `max`, so the tallest month always sits
 * below the top grid line (the scale never clips a point).
 */
export function generateTicks(max: number): number[] {
  if (max <= 0) return [0];
  const step = niceStep(max);
  const ticks: number[] = [];
  let current = 0;
  while (current < max - step * 1e-9 && ticks.length < 24) {
    ticks.push(Math.round(current * 100) / 100);
    current += step;
  }
  ticks.push(Math.round(current * 100) / 100);
  return ticks;
}

export function computeMax(buckets: SalesMonthBucket[]): number {
  let max = 0;
  for (const bucket of buckets) {
    if (bucket.totalEgp > max) max = bucket.totalEgp;
  }
  return max;
}

/**
 * Maps the month buckets to SVG coordinates. `buckets` lives on `opts` only, so the
 * caller has a single source of truth for the data being scaled. (ASSUMPTIONS §58)
 */
export function scale(opts: ScaleOptions): { points: ChartPoint[]; ticks: number[]; max: number } {
  const { buckets } = opts;
  const max = computeMax(buckets);
  const ticks = generateTicks(max);
  const lastTick = ticks[ticks.length - 1];
  const effectiveMax = lastTick === undefined ? max : lastTick;
  const innerWidth = opts.width - opts.paddingLeft - opts.paddingRight;
  const innerHeight = opts.height - opts.paddingTop - opts.paddingBottom;
  const count = buckets.length;

  const points: ChartPoint[] = buckets.map((bucket, index) => {
    const x = opts.paddingLeft + (count <= 1 ? innerWidth / 2 : (index / (count - 1)) * innerWidth);
    const ratio = effectiveMax <= 0 ? 0 : bucket.totalEgp / effectiveMax;
    const y = opts.paddingTop + innerHeight * (1 - ratio);
    return { x, y, index, bucket };
  });

  return { points, ticks, max: effectiveMax };
}

/** Nearest month to a pointer x-position, or `null` when the pointer is too far away. */
export function findNearestPoint(x: number, points: ChartPoint[]): ChartPoint | null {
  let best: ChartPoint | null = null;
  let bestDistance = Infinity;
  for (const point of points) {
    const distance = Math.abs(point.x - x);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = point;
    }
  }
  return bestDistance < 50 ? best : null;
}

export function tooltipContent(bucket: SalesMonthBucket): string {
  return `${bucket.label}: ${formatEgp(bucket.totalEgp)}`;
}

export function salesLabel(bucket: SalesMonthBucket): string {
  return formatEgp(bucket.totalEgp);
}

/** Screen-reader summary of the whole series. */
export function ariaLabel(buckets: SalesMonthBucket[]): string {
  const summary = buckets.map((bucket) => `${bucket.label} ${formatEgp(bucket.totalEgp)}`).join(', ');
  return `${en.overview.salesChartTitle}. ${summary}`;
}
