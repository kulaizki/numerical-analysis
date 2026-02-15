export interface GaussStep {
  matrix: number[][];
  vector: number[];
  desc: string;
  pivotRow?: number;
  targetRow?: number;
  multiplier?: number;
}

export interface LUStep {
  L: number[][];
  U: number[][];
  desc: string;
  step: number;
}

export interface IterationEntry {
  n: number;
  x: number[];
  residual: number;
}

export const DEFAULT_A = [
  [4, -1, 1],
  [4, -8, 1],
  [-2, 1, 5]
];

export const DEFAULT_B = [7, -21, 15];
