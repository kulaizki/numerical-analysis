export interface StepData {
	t: number;
	y: number;
	exact: number;
	error: number;
	slopes?: { k1?: number; k2?: number; k3?: number; k4?: number };
	predictor?: number;
	corrector?: number;
}

export type ODEFunction = (t: number, y: number) => number;

// Default ODE: y' = -2ty, exact solution: y = e^(-t^2)
export const f: ODEFunction = (t: number, y: number) => -2 * t * y;
export const exactSolution = (t: number) => Math.exp(-t * t);

export function computeEuler(
	stepSize: number,
	t0: number,
	tf: number,
	y0: number
): StepData[] {
	const steps: StepData[] = [];
	let t = t0;
	let y = y0;

	while (t <= tf + 1e-10) {
		const exact = exactSolution(t);
		steps.push({ t, y, exact, error: Math.abs(y - exact) });
		const slope = f(t, y);
		y = y + stepSize * slope;
		t = t + stepSize;
	}

	return steps;
}

export function computeHeun(
	stepSize: number,
	t0: number,
	tf: number,
	y0: number
): StepData[] {
	const steps: StepData[] = [];
	let t = t0;
	let y = y0;

	while (t <= tf + 1e-10) {
		const exact = exactSolution(t);
		const predictor = y + stepSize * f(t, y);
		const corrector = y + (stepSize / 2) * (f(t, y) + f(t + stepSize, predictor));
		steps.push({ t, y, exact, error: Math.abs(y - exact), predictor, corrector });
		y = corrector;
		t = t + stepSize;
	}

	return steps;
}

export function computeRK4(
	stepSize: number,
	t0: number,
	tf: number,
	y0: number
): StepData[] {
	const steps: StepData[] = [];
	let t = t0;
	let y = y0;

	while (t <= tf + 1e-10) {
		const exact = exactSolution(t);
		const k1 = f(t, y);
		const k2 = f(t + stepSize / 2, y + (stepSize / 2) * k1);
		const k3 = f(t + stepSize / 2, y + (stepSize / 2) * k2);
		const k4 = f(t + stepSize, y + stepSize * k3);
		steps.push({ t, y, exact, error: Math.abs(y - exact), slopes: { k1, k2, k3, k4 } });
		y = y + (stepSize / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
		t = t + stepSize;
	}

	return steps;
}
