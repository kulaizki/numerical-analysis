<script lang="ts">
	import KaTeX from '$lib/components/KaTeX.svelte';
	import { Card, Badge, Button, Input } from '$lib/components/ui';
	import { computeHeun, type StepData } from '../solvers';
	import {
		setupCanvas,
		toCanvasCoords,
		drawAxes,
		drawSlopeField,
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
	let step = $state(0);
	let theoryOpen = $state(false);
	let practice = $state({ answer: '', correct: null as boolean | null });

	let steps = $derived(computeHeun(h, t0, tf, y0));

	function draw() {
		const setup = setupCanvas(canvas);
		if (!setup) return;
		const { ctx, width, height } = setup;

		const tMin = t0;
		const tMax = tf;
		const yMin = -0.2;
		const yMax = 1.2;

		clearCanvas(ctx, width, height);
		drawSlopeField(ctx, width, height, tMin, tMax, yMin, yMax);
		drawAxes(ctx, width, height, tMin, tMax, yMin, yMax);
		drawExactSolution(ctx, width, height, tMin, tMax, yMin, yMax);

		// Draw Heun steps
		for (let i = 0; i <= Math.min(step, steps.length - 2); i++) {
			const s = steps[i];
			const nextT = s.t + h;

			const { x: x1, y: y1 } = toCanvasCoords(s.t, s.y, width, height, tMin, tMax, yMin, yMax);

			// Predictor (dashed)
			if (s.predictor !== undefined) {
				const { x: xPred, y: yPred } = toCanvasCoords(
					nextT,
					s.predictor,
					width,
					height,
					tMin,
					tMax,
					yMin,
					yMax
				);
				ctx.strokeStyle = '#a1a1aa';
				ctx.lineWidth = 2;
				ctx.setLineDash([3, 3]);
				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(xPred, yPred);
				ctx.stroke();
				ctx.setLineDash([]);
			}

			// Corrector (solid)
			if (s.corrector !== undefined) {
				const { x: xCorr, y: yCorr } = toCanvasCoords(
					nextT,
					s.corrector,
					width,
					height,
					tMin,
					tMax,
					yMin,
					yMax
				);
				ctx.strokeStyle = '#10b981';
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(xCorr, yCorr);
				ctx.stroke();

				// Draw point
				ctx.fillStyle = '#10b981';
				ctx.beginPath();
				ctx.arc(x1, y1, 4, 0, 2 * Math.PI);
				ctx.fill();
			}
		}

		// Draw current point
		if (step < steps.length) {
			const current = steps[Math.min(step, steps.length - 1)];
			const { x, y } = toCanvasCoords(current.t, current.y, width, height, tMin, tMax, yMin, yMax);
			ctx.fillStyle = '#ef4444';
			ctx.beginPath();
			ctx.arc(x, y, 6, 0, 2 * Math.PI);
			ctx.fill();
		}
	}

	function checkPractice() {
		// Problem: y' = y, y(0) = 1, h = 0.5, find y(0.5)
		// Heun: predictor = 1 + 0.5*1 = 1.5
		//       corrector = 1 + 0.25*(1 + 1.5) = 1 + 0.625 = 1.625
		const answer = parseFloat(practice.answer);
		practice.correct = Math.abs(answer - 1.625) < 0.01;
	}

	$effect(() => {
		if (canvas) draw();
	});
</script>

<div>
	<!-- Theory -->
	<Card class="mb-6 bg-2 p-6">
		<button
			class="flex w-full items-center justify-between text-left"
			onclick={() => (theoryOpen = !theoryOpen)}
		>
			<h3 class="text-lg font-semibold text-primary">Theory: Heun's Method</h3>
			<span class="text-muted">{theoryOpen ? '▼' : '▶'}</span>
		</button>
		{#if theoryOpen}
			<div class="mt-4 space-y-3 text-sm text-muted">
				<p>
					Heun's method (Improved Euler) uses a predictor-corrector approach for better
					accuracy.
				</p>
				<div>
					<KaTeX math={'\\text{Predictor: } \\tilde{y}_{n+1} = y_n + h \\cdot f(t_n, y_n)'} displayMode={true} />
					<KaTeX
						math={'y_{n+1} = y_n + \\frac{h}{2} \\left[ f(t_n, y_n) + f(t_{n+1}, \\tilde{y}_{n+1}) \\right]'}
						displayMode={true}
					/>
				</div>
				<p>
					This is a second-order method with local truncation error O(h³) and global error
					O(h²), more accurate than basic Euler.
				</p>
				<p>
					The predictor estimates the next value using Euler's method, then the corrector
					averages the slopes at both endpoints.
				</p>
			</div>
		{/if}
	</Card>

	<!-- Visualization -->
	<Card class="mb-6 bg-2 p-6">
		<h3 class="mb-4 text-lg font-semibold text-primary">Predictor-Corrector Visualization</h3>
		<canvas bind:this={canvas} class="mb-4 h-96 w-full bg-3"></canvas>

		<div class="mb-4 flex items-center gap-4">
			<Button
				variant="outline"
				size="sm"
				onclick={() => (step = Math.max(0, step - 1))}
				disabled={step === 0}
			>
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => (step = Math.min(steps.length - 1, step + 1))}
				disabled={step >= steps.length - 1}
			>
				Next
			</Button>
			<Button variant="outline" size="sm" onclick={() => (step = 0)}>Reset</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => (step = steps.length - 1)}
			>
				Complete
			</Button>
			<span class="text-sm text-muted">
				Step {step} / {steps.length - 1}
			</span>
		</div>

		<div class="flex gap-2">
			<Badge variant="secondary" class="bg-[#6366f1] text-white">Exact (dashed)</Badge>
			<Badge variant="secondary" class="bg-[#a1a1aa] text-white">Predictor (dashed)</Badge>
			<Badge variant="secondary" class="bg-[#10b981] text-white">Corrector (solid)</Badge>
		</div>
	</Card>

	<!-- Data table -->
	<Card class="mb-6 bg-2 p-6">
		<h3 class="mb-4 text-lg font-semibold text-primary">Numerical Results</h3>
		<div class="max-h-64 overflow-auto">
			<table class="w-full text-sm">
				<thead class="sticky top-0 bg-3">
					<tr class="border-b border-border">
						<th class="p-2 text-left text-muted">n</th>
						<th class="p-2 text-left text-muted">t_n</th>
						<th class="p-2 text-left text-muted">y_n (Heun)</th>
						<th class="p-2 text-left text-muted">y(t_n) (Exact)</th>
						<th class="p-2 text-left text-muted">Error</th>
					</tr>
				</thead>
				<tbody>
					{#each steps.slice(0, step + 1) as s, i}
						<tr class="border-b border-border">
							<td class="p-2 text-muted">{i}</td>
							<td class="p-2 text-primary font-mono">{s.t.toFixed(3)}</td>
							<td class="p-2 text-primary font-mono">{s.y.toFixed(6)}</td>
							<td class="p-2 text-primary font-mono">{s.exact.toFixed(6)}</td>
							<td class="p-2 text-accent font-mono">{s.error.toFixed(8)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Card>

	<!-- Practice -->
	<Card class="bg-2 p-6">
		<h3 class="mb-4 text-lg font-semibold text-primary">Practice Problem</h3>
		<div class="mb-4">
			<p class="mb-2 text-muted">
				Use Heun's method with <KaTeX math="h = 0.5" /> to approximate <KaTeX math="y(0.5)" />
				for the IVP:
			</p>
			<KaTeX math="y' = y, \quad y(0) = 1" displayMode={true} />
		</div>
		<div class="flex items-center gap-4">
			<Input
				type="number"
				bind:value={practice.answer}
				placeholder="Your answer"
				step="0.001"
				class="w-32 bg-3"
			/>
			<Button variant="outline" size="sm" onclick={checkPractice}>Check</Button>
			{#if practice.correct !== null}
				<Badge variant={practice.correct ? 'default' : 'destructive'}>
					{practice.correct ? 'Correct!' : 'Incorrect. Try again.'}
				</Badge>
			{/if}
		</div>
		<p class="mt-2 text-xs text-muted">
			Hint: Predictor = 1 + 0.5(1), then corrector uses average of slopes at t=0 and t=0.5.
		</p>
	</Card>
</div>
