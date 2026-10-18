import { useEffect, useId, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { tokens } from '@/presentation/theme/tokens';
import { formatEgp } from '@/presentation/lib/format';
import {
  ariaLabel,
  findNearestPoint,
  scale,
  tooltipContent,
  type ChartPoint,
} from '@/presentation/charts/line-chart';
import { clamp, monotoneCubicInterpolation } from '@/presentation/charts/path';
import type { SalesMonthBucket } from '@/domain/rules/sales';

const HEIGHT = 240;
const PADDING = { top: 16, right: 16, bottom: 32, left: 56 };
const DEFAULT_WIDTH = 640;
const POINT_RADIUS = 3.5;
const HIT_RADIUS = 12;
const BAND_WIDTH = 34;
const TOOLTIP_WIDTH = 132;
const TOOLTIP_HEIGHT = 44;

const LINE_COLOR = tokens.colors.primary.DEFAULT;
const GRID_COLOR = tokens.colors.border.DEFAULT;
const AXIS_TEXT_COLOR = tokens.colors.text.muted;
const TOOLTIP_BG = tokens.colors.card;
const TOOLTIP_BORDER = tokens.colors.border.DEFAULT;
const TOOLTIP_TEXT = tokens.colors.text.DEFAULT;

const axisFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function useMeasuredWidth() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setWidth(element.clientWidth || DEFAULT_WIDTH);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

interface ChartAxesProps {
  points: ChartPoint[];
  ticks: number[];
  max: number;
  width: number;
}

function ChartAxes({ points, ticks, max, width }: ChartAxesProps) {
  const baseline = HEIGHT - PADDING.bottom;
  const innerHeight = baseline - PADDING.top;
  const right = width - PADDING.right;
  const yFor = (value: number) => (max <= 0 ? baseline : PADDING.top + innerHeight * (1 - value / max));

  return (
    <g aria-hidden="true">
      {ticks.map((tick) => {
        const y = yFor(tick);
        return (
          <g key={tick}>
            <line
              x1={PADDING.left}
              x2={right}
              y1={y}
              y2={y}
              stroke={GRID_COLOR}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <text x={PADDING.left - 8} y={y + 4} textAnchor="end" fontSize={12} fill={AXIS_TEXT_COLOR}>
              {axisFormatter.format(tick)}
            </text>
          </g>
        );
      })}
      {points.map((point) => (
        <text
          key={point.bucket.key}
          x={point.x}
          y={HEIGHT - 8}
          textAnchor="middle"
          fontSize={12}
          fill={AXIS_TEXT_COLOR}
        >
          {point.bucket.label}
        </text>
      ))}
    </g>
  );
}

interface ChartAreaProps {
  path: string;
  gradientId: string;
}

function ChartArea({ path, gradientId }: ChartAreaProps) {
  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={0.15} />
          <stop offset="100%" stopColor={LINE_COLOR} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={path} fill={`url(#${gradientId})`} stroke="none" />
    </>
  );
}

function ChartLine({ path }: { path: string }) {
  return (
    <path
      d={path}
      fill="none"
      stroke={LINE_COLOR}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

interface ChartPointsProps {
  points: ChartPoint[];
  activeIndex: number | null;
  onActivate: (index: number) => void;
  onDeactivate: () => void;
}

function ChartPoints({ points, activeIndex, onActivate, onDeactivate }: ChartPointsProps) {
  const baseline = HEIGHT - PADDING.bottom;
  const innerHeight = baseline - PADDING.top;
  const active = points.find((point) => point.index === activeIndex) ?? null;

  return (
    <g>
      {active ? (
        <rect
          x={active.x - BAND_WIDTH / 2}
          y={PADDING.top}
          width={BAND_WIDTH}
          height={innerHeight}
          fill={LINE_COLOR}
          fillOpacity={0.06}
          rx={6}
          aria-hidden="true"
        />
      ) : null}
      {points.map((point) => (
        <g key={point.bucket.key}>
          <circle
            cx={point.x}
            cy={point.y}
            r={POINT_RADIUS}
            fill={LINE_COLOR}
            stroke={TOOLTIP_BG}
            strokeWidth={2}
            aria-hidden="true"
          />
          <circle
            cx={point.x}
            cy={point.y}
            r={HIT_RADIUS}
            fill="transparent"
            tabIndex={0}
            focusable="true"
            role="img"
            aria-label={tooltipContent(point.bucket)}
            onMouseEnter={() => onActivate(point.index)}
            onFocus={() => onActivate(point.index)}
            onBlur={onDeactivate}
          />
        </g>
      ))}
    </g>
  );
}

interface ChartTooltipProps {
  point: ChartPoint;
  width: number;
}

function ChartTooltip({ point, width }: ChartTooltipProps) {
  const half = TOOLTIP_WIDTH / 2;
  const x = clamp(point.x, half + 2, width - half - 2);
  const y = clamp(point.y, TOOLTIP_HEIGHT + 4, HEIGHT);

  return (
    <g transform={`translate(${x}, ${y})`} pointerEvents="none" aria-hidden="true">
      <rect
        x={-half}
        y={-TOOLTIP_HEIGHT - 10}
        width={TOOLTIP_WIDTH}
        height={TOOLTIP_HEIGHT}
        rx={6}
        fill={TOOLTIP_BG}
        stroke={TOOLTIP_BORDER}
      />
      <text x={0} y={-TOOLTIP_HEIGHT + 4} textAnchor="middle" fontSize={12} fill={AXIS_TEXT_COLOR}>
        {point.bucket.label}
      </text>
      <text x={0} y={-12} textAnchor="middle" fontSize={13} fontWeight={600} fill={TOOLTIP_TEXT}>
        {formatEgp(point.bucket.totalEgp)}
      </text>
    </g>
  );
}

export interface LineChartProps {
  buckets: SalesMonthBucket[];
}

/**
 * Inline-SVG connected line chart: monotone line + gradient area, dashed horizontal
 * grid, left y-axis, month labels below, one marker per month (zero months included)
 * and a hover/focus tooltip with a highlight band. All geometry is delegated to the
 * pure helpers in `presentation/charts`; all colors come from the design tokens. (AH-239)
 */
export function LineChart({ buckets }: LineChartProps) {
  const { ref, width } = useMeasuredWidth();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const gradientId = `sales-area-${useId().replace(/:/g, '')}`;

  const { points, ticks, max } = scale({
    buckets,
    width,
    height: HEIGHT,
    paddingLeft: PADDING.left,
    paddingRight: PADDING.right,
    paddingTop: PADDING.top,
    paddingBottom: PADDING.bottom,
  });

  const baseline = HEIGHT - PADDING.bottom;
  const linePath = monotoneCubicInterpolation(points.map((point) => ({ x: point.x, y: point.y })));
  const first = points[0];
  const last = points[points.length - 1];
  const areaPath =
    first && last ? `${linePath} L ${last.x},${baseline} L ${first.x},${baseline} Z` : '';
  const active = points.find((point) => point.index === activeIndex) ?? null;

  const handleMove = (event: ReactMouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    const x = ((event.clientX - rect.left) / rect.width) * width;
    const nearest = findNearestPoint(x, points);
    setActiveIndex(nearest ? nearest.index : null);
  };

  return (
    <div ref={ref} className="w-full">
      <svg
        viewBox={`0 0 ${width} ${HEIGHT}`}
        width="100%"
        height={HEIGHT}
        role="img"
        aria-label={ariaLabel(buckets)}
        onMouseMove={handleMove}
        onMouseLeave={() => setActiveIndex(null)}
      >
        <ChartAxes points={points} ticks={ticks} max={max} width={width} />
        <ChartArea path={areaPath} gradientId={gradientId} />
        <ChartLine path={linePath} />
        {active ? <ChartTooltip point={active} width={width} /> : null}
        <ChartPoints
          points={points}
          activeIndex={activeIndex}
          onActivate={setActiveIndex}
          onDeactivate={() => setActiveIndex(null)}
        />
      </svg>
    </div>
  );
}
