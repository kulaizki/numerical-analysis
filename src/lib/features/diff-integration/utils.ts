/**
 * Shared utility functions for numerical differentiation & integration tools.
 */

/** Safely evaluate a math expression string at a given x value. */
export function evaluateFunc(expr: string, x: number): number {
  try {
    const func = new Function('x', `with(Math) { return ${expr}; }`);
    return func(x);
  } catch {
    return 0;
  }
}

/** Check if a user's string answer is within tolerance of the correct value. */
export function checkAnswer(user: string, correct: number, tolerance: number = 0.01): boolean {
  const val = parseFloat(user);
  if (isNaN(val)) return false;
  return Math.abs(val - correct) < tolerance;
}
