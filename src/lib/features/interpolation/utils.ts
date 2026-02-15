export type Point = { x: number; y: number };

export type CubicSpline = {
  a: number;
  b: number;
  c: number;
  d: number;
  x0: number;
  x1: number;
};

export const defaultPoints: Point[] = [
  { x: 0, y: 1 },
  { x: 1, y: 2.7 },
  { x: 2, y: 7.4 },
  { x: 3, y: 20.1 },
  { x: 4, y: 54.6 }
];

// ==================== LAGRANGE ====================

export function lagrangeBasis(i: number, x: number, points: Point[]): number {
  let result = 1;
  for (let j = 0; j < points.length; j++) {
    if (j !== i) {
      result *= (x - points[j].x) / (points[i].x - points[j].x);
    }
  }
  return result;
}

export function lagrangeInterpolate(x: number, points: Point[]): number {
  let result = 0;
  for (let i = 0; i < points.length; i++) {
    result += points[i].y * lagrangeBasis(i, x, points);
  }
  return result;
}

export function getLagrangePolynomialLatex(points: Point[]): string {
  if (points.length === 0) return '';

  let terms: string[] = [];
  for (let i = 0; i < points.length; i++) {
    let numerator = '';
    let denominator = 1;

    for (let j = 0; j < points.length; j++) {
      if (j !== i) {
        const coeff = points[i].x - points[j].x;
        denominator *= coeff;

        if (points[j].x === 0) {
          numerator += 'x';
        } else if (points[j].x > 0) {
          numerator += `(x - ${points[j].x})`;
        } else {
          numerator += `(x + ${-points[j].x})`;
        }
      }
    }

    const coefficient = points[i].y / denominator;
    const coeffStr = Math.abs(coefficient - Math.round(coefficient)) < 0.01
      ? Math.round(coefficient).toString()
      : coefficient.toFixed(2);

    terms.push(`${coeffStr} \\cdot ${numerator}`);
  }

  return `P(x) = ${terms.join(' + ')}`;
}

// ==================== NEWTON ====================

export function computeDividedDifferences(points: Point[]): number[][] {
  const n = points.length;
  const table: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    table[i][0] = points[i].y;
  }

  for (let j = 1; j < n; j++) {
    for (let i = 0; i < n - j; i++) {
      table[i][j] = (table[i + 1][j - 1] - table[i][j - 1]) /
                    (points[i + j].x - points[i].x);
    }
  }

  return table;
}

export function newtonInterpolate(x: number, points: Point[]): number {
  const table = computeDividedDifferences(points);
  let result = table[0][0];
  let term = 1;

  for (let i = 1; i < points.length; i++) {
    term *= (x - points[i - 1].x);
    result += table[0][i] * term;
  }

  return result;
}

export function getNewtonPolynomialLatex(points: Point[]): string {
  if (points.length === 0) return '';

  const table = computeDividedDifferences(points);
  let terms: string[] = [table[0][0].toFixed(3)];

  for (let i = 1; i < points.length; i++) {
    let term = table[0][i].toFixed(3);

    for (let j = 0; j < i; j++) {
      if (points[j].x === 0) {
        term += ` \\cdot x`;
      } else if (points[j].x > 0) {
        term += ` \\cdot (x - ${points[j].x})`;
      } else {
        term += ` \\cdot (x + ${-points[j].x})`;
      }
    }

    terms.push(term);
  }

  return `P(x) = ${terms.join(' + ')}`;
}

// ==================== CUBIC SPLINES ====================

export function computeCubicSplines(points: Point[]): CubicSpline[] {
  const n = points.length - 1;
  if (n < 1) return [];

  const h: number[] = [];
  for (let i = 0; i < n; i++) {
    h[i] = points[i + 1].x - points[i].x;
  }

  const alpha: number[] = Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    alpha[i] = (3 / h[i]) * (points[i + 1].y - points[i].y) -
               (3 / h[i - 1]) * (points[i].y - points[i - 1].y);
  }

  const l: number[] = Array(n + 1).fill(0);
  const mu: number[] = Array(n + 1).fill(0);
  const z: number[] = Array(n + 1).fill(0);

  l[0] = 1;
  mu[0] = 0;
  z[0] = 0;

  for (let i = 1; i < n; i++) {
    l[i] = 2 * (points[i + 1].x - points[i - 1].x) - h[i - 1] * mu[i - 1];
    mu[i] = h[i] / l[i];
    z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
  }

  l[n] = 1;
  z[n] = 0;

  const c: number[] = Array(n + 1).fill(0);
  const b: number[] = Array(n).fill(0);
  const d: number[] = Array(n).fill(0);

  c[n] = 0;

  for (let j = n - 1; j >= 0; j--) {
    c[j] = z[j] - mu[j] * c[j + 1];
    b[j] = (points[j + 1].y - points[j].y) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
    d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
  }

  const splines: CubicSpline[] = [];
  for (let i = 0; i < n; i++) {
    splines.push({
      a: points[i].y,
      b: b[i],
      c: c[i],
      d: d[i],
      x0: points[i].x,
      x1: points[i + 1].x
    });
  }

  return splines;
}

export function evaluateSpline(x: number, splines: CubicSpline[]): number {
  for (const spline of splines) {
    if (x >= spline.x0 && x <= spline.x1) {
      const dx = x - spline.x0;
      return spline.a + spline.b * dx + spline.c * dx * dx + spline.d * dx * dx * dx;
    }
  }
  return 0;
}
