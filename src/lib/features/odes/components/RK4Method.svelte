<script lang="ts">
	import KaTeX from '$lib/components/KaTeX.svelte';
	import { Card, Badge, Button, Input } from '$lib/components/ui';
	import CodeTabs from '$lib/components/CodeTabs.svelte';
	import { computeRK4, type StepData } from '../solvers';
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

	let steps = $derived(computeRK4(h, t0, tf, y0));

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

		// Draw RK4 steps
		ctx.lineWidth = 2;

		for (let i = 0; i <= Math.min(step, steps.length - 2); i++) {
			const s = steps[i];
			const nextStep = steps[i + 1];

			const { x: x0, y: y0Canvas } = toCanvasCoords(s.t, s.y, width, height, tMin, tMax, yMin, yMax);

			if (i === step && s.slopes) {
				// Show k1, k2, k3, k4 slopes for current step
				const { k1, k2, k3, k4 } = s.slopes;

				// k1: slope at (t, y)
				const y1k1 = s.y + h * k1!;
				const { x: x1k1, y: y1k1Canvas } = toCanvasCoords(
					s.t + h,
					y1k1,
					width,
					height,
					tMin,
					tMax,
					yMin,
					yMax
				);
				ctx.strokeStyle = '#ef4444';
				ctx.setLineDash([5, 3]);
				ctx.beginPath();
				ctx.moveTo(x0, y0Canvas);
				ctx.lineTo(x1k1, y1k1Canvas);
				ctx.stroke();

				// k2: slope at (t + h/2, y + h*k1/2)
				const y2Start = s.y + (h / 2) * k1!;
				const { x: x2Start, y: y2StartCanvas } = toCanvasCoords(
					s.t + h / 2,
					y2Start,
					width,
					height,
					tMin,
					tMax,
					yMin,
					yMax
				);
				const y2k2 = y2Start + (h / 2) * k2!;
				const { x: x2k2, y: y2k2Canvas } = toCanvasCoords(
					s.t + h,
					y2k2,
					width,
					height,
					tMin,
					tMax,
					yMin,
					yMax
				);
				ctx.strokeStyle = '#f59e0b';
				ctx.beginPath();
				ctx.moveTo(x2Start, y2StartCanvas);
				ctx.lineTo(x2k2, y2k2Canvas);
				ctx.stroke();

				// k3: slope at (t + h/2, y + h*k2/2)
				const y3Start = s.y + (h / 2) * k2!;
				const { x: x3Start, y: y3StartCanvas } = toCanvasCoords(
					s.t + h / 2,
					y3Start,
					width,
					height,
					tMin,
					tMax,
					yMin,
					yMax
				);
				const y3k3 = y3Start + (h / 2) * k3!;
				const { x: x3k3, y: y3k3Canvas } = toCanvasCoords(
					s.t + h,
					y3k3,
					width,
					height,
					tMin,
					tMax,
					yMin,
					yMax
				);
				ctx.strokeStyle = '#10b981';
				ctx.beginPath();
				ctx.moveTo(x3Start, y3StartCanvas);
				ctx.lineTo(x3k3, y3k3Canvas);
				ctx.stroke();

				// k4: slope at (t + h, y + h*k3)
				const y4Start = s.y + h * k3!;
				const { x: x4Start, y: y4StartCanvas } = toCanvasCoords(
					s.t + h,
					y4Start,
					width,
					height,
					tMin,
					tMax,
					yMin,
					yMax
				);
				ctx.strokeStyle = '#8b5cf6';
				ctx.beginPath();
				ctx.arc(x4Start, y4StartCanvas, 4, 0, 2 * Math.PI);
				ctx.fill();

				ctx.setLineDash([]);
			}

			// Draw solution path
			const { x: x1, y: y1 } = toCanvasCoords(
				nextStep.t,
				nextStep.y,
				width,
				height,
				tMin,
				tMax,
				yMin,
				yMax
			);
			ctx.strokeStyle = '#06b6d4';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(x0, y0Canvas);
			ctx.lineTo(x1, y1);
			ctx.stroke();

			// Draw point
			ctx.fillStyle = '#06b6d4';
			ctx.beginPath();
			ctx.arc(x0, y0Canvas, 4, 0, 2 * Math.PI);
			ctx.fill();
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
		// Problem: y' = -y, y(0) = 2, h = 0.5, find y(0.5)
		// k1 = -2, k2 = -1.5, k3 = -1.625, k4 = -1.1875
		// y(0.5) = 2 + (0.5/6)*(-2 - 3 - 3.25 - 1.1875) ~ 1.213
		const answer = parseFloat(practice.answer);
		practice.correct = Math.abs(answer - 1.213) < 0.02;
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
			<h3 class="text-lg font-semibold text-primary">Theory: Runge-Kutta 4th Order (RK4)</h3>
			<span class="text-muted">{theoryOpen ? '▼' : '▶'}</span>
		</button>
		{#if theoryOpen}
			<div class="mt-4 space-y-3 text-sm text-muted">
				<p>
					RK4 is the most widely used method, achieving fourth-order accuracy by combining
					four slope estimates.
				</p>
				<div>
					<KaTeX math="k_1 = f(t_n, y_n)" displayMode={true} />
					<KaTeX math="k_2 = f(t_n + h/2, y_n + hk_1/2)" displayMode={true} />
					<KaTeX math="k_3 = f(t_n + h/2, y_n + hk_2/2)" displayMode={true} />
					<KaTeX math="k_4 = f(t_n + h, y_n + hk_3)" displayMode={true} />
					<KaTeX
						math={'y_{n+1} = y_n + \\frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)'}
						displayMode={true}
					/>
				</div>
				<p>
					This is a fourth-order method with local truncation error O(h^5) and global error
					O(h^4).
				</p>
				<p>
					The method samples the slope at the beginning, twice at the midpoint (using
					different estimates), and at the end, then takes a weighted average.
				</p>
			</div>
		{/if}
	</Card>

	<!-- Visualization -->
	<Card class="mb-6 bg-2 p-6">
		<h3 class="mb-4 text-lg font-semibold text-primary">Four-Slope Visualization</h3>
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
			<Badge variant="secondary" class="bg-[#ef4444] text-white">k1</Badge>
			<Badge variant="secondary" class="bg-[#f59e0b] text-white">k2</Badge>
			<Badge variant="secondary" class="bg-[#10b981] text-white">k3</Badge>
			<Badge variant="secondary" class="bg-[#8b5cf6] text-white">k4</Badge>
			<Badge variant="secondary" class="bg-[#06b6d4] text-white">RK4 path</Badge>
		</div>

		{#if step < steps.length && steps[step].slopes}
			<div class="mt-4 bg-3 p-4">
				<h4 class="mb-2 text-sm font-semibold text-primary">Current Step Slopes:</h4>
				<div class="grid grid-cols-2 gap-2 text-sm font-mono">
					<div class="text-muted">
						k₁ = {steps[step].slopes?.k1?.toFixed(6)}
					</div>
					<div class="text-muted">
						k₂ = {steps[step].slopes?.k2?.toFixed(6)}
					</div>
					<div class="text-muted">
						k₃ = {steps[step].slopes?.k3?.toFixed(6)}
					</div>
					<div class="text-muted">
						k₄ = {steps[step].slopes?.k4?.toFixed(6)}
					</div>
				</div>
			</div>
		{/if}
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
						<th class="p-2 text-left text-muted">y_n (RK4)</th>
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
				Use RK4 with <KaTeX math="h = 0.5" /> to approximate <KaTeX math="y(0.5)" /> for the
				IVP:
			</p>
			<KaTeX math="y' = -y, \quad y(0) = 2" displayMode={true} />
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
			Hint: Compute k₁, k₂, k₃, k₄ and use the weighted formula.
		</p>
	</Card>

	<CodeTabs codes={{
    pseudocode: `INPUT: f(t, y), t0, y0, h, n_steps
OUTPUT: arrays t[], y[]

t[0] = t0
y[0] = y0
for i = 0, 1, ..., n_steps - 1:
    k1 = h * f(t[i], y[i])
    k2 = h * f(t[i] + h/2, y[i] + k1/2)
    k3 = h * f(t[i] + h/2, y[i] + k2/2)
    k4 = h * f(t[i] + h, y[i] + k3)
    y[i+1] = y[i] + (k1 + 2*k2 + 2*k3 + k4) / 6
    t[i+1] = t[i] + h

RETURN t, y`,
    python: `import numpy as np

def rk4(f, t0, y0, h, n_steps):
    t = np.zeros(n_steps + 1)
    y = np.zeros(n_steps + 1)
    t[0], y[0] = t0, y0

    for i in range(n_steps):
        k1 = h * f(t[i], y[i])
        k2 = h * f(t[i] + h/2, y[i] + k1/2)
        k3 = h * f(t[i] + h/2, y[i] + k2/2)
        k4 = h * f(t[i] + h, y[i] + k3)
        y[i + 1] = y[i] + (k1 + 2*k2 + 2*k3 + k4) / 6
        t[i + 1] = t[i] + h
    return t, y`,
    r: `rk4 <- function(f, t0, y0, h, n_steps) {
  t <- numeric(n_steps + 1)
  y <- numeric(n_steps + 1)
  t[1] <- t0; y[1] <- y0

  for (i in 1:n_steps) {
    k1 <- h * f(t[i], y[i])
    k2 <- h * f(t[i] + h/2, y[i] + k1/2)
    k3 <- h * f(t[i] + h/2, y[i] + k2/2)
    k4 <- h * f(t[i] + h, y[i] + k3)
    y[i + 1] <- y[i] + (k1 + 2*k2 + 2*k3 + k4) / 6
    t[i + 1] <- t[i] + h
  }
  list(t = t, y = y)
}`
  }} />
</div>
