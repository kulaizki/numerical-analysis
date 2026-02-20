<script lang="ts">
	import Chart from '$lib/components/Chart.svelte';
	import { Card } from '$lib/components/ui';
	import {
		computeEuler,
		computeHeun,
		computeRK4,
		exactSolution,
		type StepData
	} from '../solvers';
	import {
		setupCanvas,
		toCanvasCoords,
		drawAxes,
		drawExactSolution,
		clearCanvas
	} from '../canvas';

	interface Props {
		h: number;
		t0: number;
		tf: number;
		y0: number;
	}

	let { h, t0, tf, y0 }: Props = $props();

	let canvas: HTMLCanvasElement;

	let eulerSteps = $derived(computeEuler(h, t0, tf, y0));
	let heunSteps = $derived(computeHeun(h, t0, tf, y0));
	let rk4Steps = $derived(computeRK4(h, t0, tf, y0));

	function draw() {
		const setup = setupCanvas(canvas);
		if (!setup) return;
		const { ctx, width, height } = setup;

		const tMin = t0;
		const tMax = tf;
		const yMin = -0.2;
		const yMax = 1.2;

		clearCanvas(ctx, width, height);
		drawAxes(ctx, width, height, tMin, tMax, yMin, yMax);
		drawExactSolution(ctx, width, height, tMin, tMax, yMin, yMax);

		// Euler
		ctx.strokeStyle = '#f59e0b';
		ctx.lineWidth = 2;
		ctx.beginPath();
		eulerSteps.forEach((step, i) => {
			const { x, y } = toCanvasCoords(step.t, step.y, width, height, tMin, tMax, yMin, yMax);
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		});
		ctx.stroke();

		// Heun
		ctx.strokeStyle = '#10b981';
		ctx.lineWidth = 2;
		ctx.beginPath();
		heunSteps.forEach((step, i) => {
			const { x, y } = toCanvasCoords(step.t, step.y, width, height, tMin, tMax, yMin, yMax);
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		});
		ctx.stroke();

		// RK4
		ctx.strokeStyle = '#06b6d4';
		ctx.lineWidth = 2;
		ctx.beginPath();
		rk4Steps.forEach((step, i) => {
			const { x, y } = toCanvasCoords(step.t, step.y, width, height, tMin, tMax, yMin, yMax);
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		});
		ctx.stroke();

		// Legend
		ctx.font = '12px Manrope';
		const legendX = width - 150;
		const legendY = 60;

		ctx.fillStyle = '#6366f1';
		ctx.fillRect(legendX, legendY, 20, 3);
		ctx.fillStyle = '#d1d5db';
		ctx.fillText('Exact', legendX + 25, legendY + 3);

		ctx.fillStyle = '#f59e0b';
		ctx.fillRect(legendX, legendY + 20, 20, 3);
		ctx.fillStyle = '#d1d5db';
		ctx.fillText('Euler', legendX + 25, legendY + 23);

		ctx.fillStyle = '#10b981';
		ctx.fillRect(legendX, legendY + 40, 20, 3);
		ctx.fillStyle = '#d1d5db';
		ctx.fillText('Heun', legendX + 25, legendY + 43);

		ctx.fillStyle = '#06b6d4';
		ctx.fillRect(legendX, legendY + 60, 20, 3);
		ctx.fillStyle = '#d1d5db';
		ctx.fillText('RK4', legendX + 25, legendY + 63);
	}

	// Error vs step size data
	const errorData = $derived.by(() => {
		const stepSizes = [0.5, 0.4, 0.3, 0.2, 0.1, 0.05, 0.025];
		const eulerErrors: number[] = [];
		const heunErrors: number[] = [];
		const rk4Errors: number[] = [];

		stepSizes.forEach((step) => {
			const euler = computeEuler(step, t0, tf, y0);
			const heun = computeHeun(step, t0, tf, y0);
			const rk4 = computeRK4(step, t0, tf, y0);

			eulerErrors.push(euler[euler.length - 1].error);
			heunErrors.push(heun[heun.length - 1].error);
			rk4Errors.push(rk4[rk4.length - 1].error);
		});

		return {
			labels: stepSizes.map((s) => s.toString()),
			datasets: [
				{
					label: 'Euler',
					data: eulerErrors,
					borderColor: '#f59e0b',
					backgroundColor: '#f59e0b',
					tension: 0.1
				},
				{
					label: 'Heun',
					data: heunErrors,
					borderColor: '#10b981',
					backgroundColor: '#10b981',
					tension: 0.1
				},
				{
					label: 'RK4',
					data: rk4Errors,
					borderColor: '#06b6d4',
					backgroundColor: '#06b6d4',
					tension: 0.1
				}
			]
		};
	});

	$effect(() => {
		if (canvas) draw();
	});
</script>

<div>
	<!-- Overlay plot -->
	<Card class="mb-6 bg-2 p-6">
		<h3 class="mb-4 text-lg font-semibold text-primary">Method Comparison</h3>
		<canvas bind:this={canvas} class="mb-4 h-96 w-full bg-3"></canvas>
	</Card>

	<!-- Error vs step size -->
	<Card class="mb-6 bg-2 p-6">
		<h3 class="mb-4 text-lg font-semibold text-primary">Error vs Step Size</h3>
		<Chart
			type="line"
			data={errorData}
			options={{
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					x: {
						reverse: true,
						title: { display: true, text: 'Step Size (h)', color: '#d1d5db' },
						ticks: { color: '#9ca3af' },
						grid: { color: '#374151' }
					},
					y: {
						type: 'logarithmic',
						title: { display: true, text: 'Error at t=2 (log scale)', color: '#d1d5db' },
						ticks: { color: '#9ca3af' },
						grid: { color: '#374151' }
					}
				},
				plugins: {
					legend: {
						labels: { color: '#d1d5db' }
					}
				}
			}}
			height={400}
		/>
	</Card>

	<!-- Comparison table -->
	<Card class="mb-6 bg-2 p-6">
		<h3 class="mb-4 text-lg font-semibold text-primary">
			Final Values at t = {tf} (h = {h})
		</h3>
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
			<thead class="bg-3">
				<tr class="border-b border-border">
					<th class="p-2 text-left text-muted">Method</th>
					<th class="p-2 text-left text-muted">Approximation</th>
					<th class="p-2 text-left text-muted">Error</th>
					<th class="p-2 text-left text-muted">Steps</th>
					<th class="p-2 text-left text-muted">Function Evals</th>
				</tr>
			</thead>
			<tbody>
				<tr class="border-b border-border">
					<td class="p-2 text-primary font-semibold">Euler</td>
					<td class="p-2 text-primary font-mono">
						{eulerSteps[eulerSteps.length - 1].y.toFixed(6)}
					</td>
					<td class="p-2 text-accent font-mono">
						{eulerSteps[eulerSteps.length - 1].error.toFixed(8)}
					</td>
					<td class="p-2 text-muted">{eulerSteps.length - 1}</td>
					<td class="p-2 text-muted">{eulerSteps.length - 1}</td>
				</tr>
				<tr class="border-b border-border">
					<td class="p-2 text-primary font-semibold">Heun</td>
					<td class="p-2 text-primary font-mono">
						{heunSteps[heunSteps.length - 1].y.toFixed(6)}
					</td>
					<td class="p-2 text-accent font-mono">
						{heunSteps[heunSteps.length - 1].error.toFixed(8)}
					</td>
					<td class="p-2 text-muted">{heunSteps.length - 1}</td>
					<td class="p-2 text-muted">{2 * (heunSteps.length - 1)}</td>
				</tr>
				<tr class="border-b border-border">
					<td class="p-2 text-primary font-semibold">RK4</td>
					<td class="p-2 text-primary font-mono">
						{rk4Steps[rk4Steps.length - 1].y.toFixed(6)}
					</td>
					<td class="p-2 text-accent font-mono">
						{rk4Steps[rk4Steps.length - 1].error.toFixed(8)}
					</td>
					<td class="p-2 text-muted">{rk4Steps.length - 1}</td>
					<td class="p-2 text-muted">{4 * (rk4Steps.length - 1)}</td>
				</tr>
				<tr class="border-b border-border">
					<td class="p-2 text-primary font-semibold">Exact</td>
					<td class="p-2 text-primary font-mono">
						{exactSolution(tf).toFixed(6)}
					</td>
					<td class="p-2 text-accent font-mono">0.00000000</td>
					<td class="p-2 text-muted">---</td>
					<td class="p-2 text-muted">---</td>
				</tr>
			</tbody>
		</table>
		</div>
	</Card>

	<!-- Key insights -->
	<Card class="bg-2 p-6">
		<h3 class="mb-4 text-lg font-semibold text-primary">Key Insights</h3>
		<div class="space-y-3 text-sm text-muted">
			<div>
				<h4 class="mb-1 font-semibold text-primary">Accuracy vs Cost Trade-off</h4>
				<p>
					RK4 achieves the best accuracy but requires 4 function evaluations per step. Euler
					is cheapest but least accurate. Heun provides a middle ground.
				</p>
			</div>
			<div>
				<h4 class="mb-1 font-semibold text-primary">Order of Convergence</h4>
				<p>
					The error vs step size plot shows: Euler ~ O(h), Heun ~ O(h²), RK4 ~ O(h⁴). Halving
					the step size reduces RK4 error by ~16x.
				</p>
			</div>
			<div>
				<h4 class="mb-1 font-semibold text-primary">Method Selection</h4>
				<p>
					For most applications, RK4 is the gold standard. Use Euler only for educational
					purposes or when extreme simplicity is needed.
				</p>
			</div>
		</div>
	</Card>
</div>
