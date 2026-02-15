export function matrixVectorMultiply(A: number[][], v: number[]): number[] {
  return A.map(row => row.reduce((sum, val, i) => sum + val * v[i], 0));
}

export function vectorNorm(v: number[]): number {
  return Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
}

export function normalize(v: number[]): number[] {
  const norm = vectorNorm(v);
  return v.map(val => val / norm);
}

export function rayleighQuotient(A: number[][], v: number[]): number {
  const Av = matrixVectorMultiply(A, v);
  const numerator = v.reduce((sum, val, i) => sum + val * Av[i], 0);
  const denominator = v.reduce((sum, val) => sum + val * val, 0);
  return numerator / denominator;
}

export function matrixInverse(A: number[][]): number[][] | null {
  const n = A.length;
  const aug: number[][] = A.map((row, i) => [...row, ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)]);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) maxRow = k;
    }
    [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];

    if (Math.abs(aug[i][i]) < 1e-10) return null;

    const pivot = aug[i][i];
    for (let j = 0; j < 2 * n; j++) aug[i][j] /= pivot;

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = aug[k][i];
        for (let j = 0; j < 2 * n; j++) {
          aug[k][j] -= factor * aug[i][j];
        }
      }
    }
  }

  return aug.map(row => row.slice(n));
}

export function matrixSubtract(A: number[][], B: number[][]): number[][] {
  return A.map((row, i) => row.map((val, j) => val - B[i][j]));
}

export function matrixMultiply(A: number[][], B: number[][]): number[][] {
  const n = A.length;
  const m = B[0].length;
  const result: number[][] = Array(n).fill(0).map(() => Array(m).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      for (let k = 0; k < B.length; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return result;
}

export function qrFactorization(A: number[][]): { Q: number[][], R: number[][] } {
  const n = A.length;
  const Q: number[][] = A.map(row => [...row]);
  const R: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

  for (let j = 0; j < n; j++) {
    const v = Q.map(row => row[j]);

    for (let i = 0; i < j; i++) {
      const qi = Q.map(row => row[i]);
      const rij = v.reduce((sum, val, k) => sum + val * qi[k], 0);
      R[i][j] = rij;
      for (let k = 0; k < n; k++) {
        Q[k][j] -= rij * qi[k];
      }
    }

    const norm = Math.sqrt(Q.reduce((sum, row) => sum + row[j] * row[j], 0));
    R[j][j] = norm;
    for (let k = 0; k < n; k++) {
      Q[k][j] /= norm;
    }
  }

  return { Q, R };
}

export function drawVectorConvergence(
  canvas: HTMLCanvasElement,
  iterations: { vector: number[] }[],
  color: string
) {
  if (!canvas || iterations.length === 0 || iterations[0].vector.length < 2) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const width = rect.width;
  const height = rect.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 100;

  ctx.clearRect(0, 0, width, height);

  // Draw axes
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, height);
  ctx.stroke();

  // Draw vectors
  iterations.forEach((it, i) => {
    const alpha = 0.2 + (0.8 * i / iterations.length);
    ctx.strokeStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + it.vector[0] * scale, centerY - it.vector[1] * scale);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(-it.vector[1], it.vector[0]);
    const arrowX = centerX + it.vector[0] * scale;
    const arrowY = centerY - it.vector[1] * scale;
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - 10 * Math.cos(angle - Math.PI / 6), arrowY + 10 * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - 10 * Math.cos(angle + Math.PI / 6), arrowY + 10 * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  });
}
