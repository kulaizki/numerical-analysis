export function checkDiagonalDominance(A: number[][]): boolean {
  const n = A.length;
  for (let i = 0; i < n; i++) {
    const diagonal = Math.abs(A[i][i]);
    const sumOthers = A[i].reduce((sum, val, j) =>
      i !== j ? sum + Math.abs(val) : sum, 0);
    if (diagonal <= sumOthers) return false;
  }
  return true;
}

export function jacobiIteration(A: number[][], b: number[], x: number[]): number[] {
  const n = A.length;
  const xNew = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        sum += A[i][j] * x[j];
      }
    }
    xNew[i] = (b[i] - sum) / A[i][i];
  }

  return xNew;
}

export function seidelIteration(A: number[][], b: number[], x: number[]): number[] {
  const n = A.length;
  const xNew = [...x];

  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        sum += A[i][j] * xNew[j]; // Use updated values immediately
      }
    }
    xNew[i] = (b[i] - sum) / A[i][i];
  }

  return xNew;
}

export function calculateResidual(A: number[][], b: number[], x: number[]): number {
  const n = A.length;
  let maxResidual = 0;

  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += A[i][j] * x[j];
    }
    maxResidual = Math.max(maxResidual, Math.abs(b[i] - sum));
  }

  return maxResidual;
}

export function deepCopyMatrix(m: number[][]): number[][] {
  return m.map(row => [...row]);
}
