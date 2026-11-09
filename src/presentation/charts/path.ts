export interface Point {
  x: number;
  y: number;
}

function buildPath(points: Point[], deltaX: number[], tangent: number[]): string {
  const first = points[0];
  if (first === undefined) return '';

  let path = `M ${first.x},${first.y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const dx = deltaX[i];
    const t0 = tangent[i];
    const t1 = tangent[i + 1];
    if (a === undefined || b === undefined || dx === undefined || t0 === undefined || t1 === undefined) {
      continue;
    }
    if (dx === 0) {
      path += ` L ${b.x},${b.y}`;
      continue;
    }
    const c1x = a.x + dx / 3;
    const c1y = a.y + (t0 * dx) / 3;
    const c2x = b.x - dx / 3;
    const c2y = b.y - (t1 * dx) / 3;
    path += ` C ${c1x},${c1y} ${c2x},${c2y} ${b.x},${b.y}`;
  }
  return path;
}

/**
 * Builds an SVG path through `points` using monotone cubic Hermite interpolation
 * (Fritsch–Carlson), so the line is smooth and never overshoots between data points —
 * a month with zero sales reads as exactly zero. Pure: numbers in, path string out.
 * (ASSUMPTIONS §59)
 */
export function monotoneCubicInterpolation(points: Point[]): string {
  const first = points[0];
  if (first === undefined) return '';

  const n = points.length;
  if (n === 1) return `M ${first.x},${first.y}`;

  const deltaX: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    if (a === undefined || b === undefined) continue;
    const dx = b.x - a.x;
    deltaX[i] = dx;
    slope[i] = dx === 0 ? 0 : (b.y - a.y) / dx;
  }

  const tangent: number[] = new Array<number>(n).fill(0);
  const headSlope = slope[0];
  const tailSlope = slope[n - 2];
  if (headSlope !== undefined) tangent[0] = headSlope;
  if (tailSlope !== undefined) tangent[n - 1] = tailSlope;

  for (let i = 1; i < n - 1; i += 1) {
    const before = slope[i - 1];
    const after = slope[i];
    if (before === undefined || after === undefined) continue;
    tangent[i] = before * after <= 0 ? 0 : (before + after) / 2;
  }

  for (let i = 0; i < n - 1; i += 1) {
    const s = slope[i];
    const t0 = tangent[i];
    const t1 = tangent[i + 1];
    if (s === undefined || t0 === undefined || t1 === undefined) continue;
    if (s === 0) {
      tangent[i] = 0;
      tangent[i + 1] = 0;
      continue;
    }
    const alpha = t0 / s;
    const beta = t1 / s;
    const h = Math.hypot(alpha, beta);
    if (h > 3) {
      tangent[i] = (3 / h) * alpha * s;
      tangent[i + 1] = (3 / h) * beta * s;
    }
  }

  return buildPath(points, deltaX, tangent);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
