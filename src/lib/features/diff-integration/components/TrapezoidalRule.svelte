<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Badge, Button, Input } from '$lib/components/ui';
  import CodeTabs from '$lib/components/CodeTabs.svelte';
  import { onMount } from 'svelte';
  import { evaluateFunc, checkAnswer } from '../utils';

  // State
  let trapN = $state(4);
  let trapFunc = $state('sin(x)');
  let trapA = $state(0);
  let trapB = $state(Math.PI);
  let trapExactIntegral = $state(2);
  let trapCanvas: HTMLCanvasElement;
  let showTrapTheory = $state(false);

  function trapezoidalRule(n: number): number {
    const h = (trapB - trapA) / n;
    let sum = evaluateFunc(trapFunc, trapA) + evaluateFunc(trapFunc, trapB);
    for (let i = 1; i < n; i++) {
      sum += 2 * evaluateFunc(trapFunc, trapA + i * h);
    }
    return (h / 2) * sum;
  }

  let trapApprox = $derived(trapezoidalRule(trapN));
  let trapError = $derived(Math.abs(trapExactIntegral - trapApprox));

  function drawTrapezoidal() {
    if (!trapCanvas) return;
    const ctx = trapCanvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = trapCanvas.getBoundingClientRect();
    trapCanvas.width = rect.width * dpr;
    trapCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;

    // Clear
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    const pad = 40;
    const plotWidth = width - 2 * pad;
    const plotHeight = height - 2 * pad;

    const xMin = trapA - 0.5;
    const xMax = trapB + 0.5;
    const yMin = -0.5;
    const yMax = 1.5;

    const scaleX = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * plotWidth;
    const scaleY = (y: number) => pad + ((yMax - y) / (yMax - yMin)) * plotHeight;

    // Draw axes
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(scaleX(0), pad);
    ctx.lineTo(scaleX(0), height - pad);
    ctx.moveTo(pad, scaleY(0));
    ctx.lineTo(width - pad, scaleY(0));
    ctx.stroke();

    // Draw trapezoids
    const h = (trapB - trapA) / trapN;
    for (let i = 0; i < trapN; i++) {
      const x1 = trapA + i * h;
      const x2 = trapA + (i + 1) * h;
      const y1 = evaluateFunc(trapFunc, x1);
      const y2 = evaluateFunc(trapFunc, x2);

      ctx.fillStyle = 'rgba(129, 140, 248, 0.15)';
      ctx.strokeStyle = '#a5b4fc';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(scaleX(x1), scaleY(0));
      ctx.lineTo(scaleX(x1), scaleY(y1));
      ctx.lineTo(scaleX(x2), scaleY(y2));
      ctx.lineTo(scaleX(x2), scaleY(0));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Draw function curve
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const x = xMin + (i / 200) * (xMax - xMin);
      const y = evaluateFunc(trapFunc, x);
      if (i === 0) ctx.moveTo(scaleX(x), scaleY(y));
      else ctx.lineTo(scaleX(x), scaleY(y));
    }
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '12px Manrope';
    ctx.fillText(`n = ${trapN}`, 10, 20);
  }

  $effect(() => {
    trapN;
    trapFunc;
    trapA;
    trapB;
    drawTrapezoidal();
  });

  // Practice problems
  type IntegralProblem = {
    func: string;
    a: number;
    b: number;
    exact: number;
    n: number;
  };

  const trapProblems: IntegralProblem[] = [
    { func: 'x^2', a: 0, b: 2, exact: 8 / 3, n: 4 },
    { func: 'cos(x)', a: 0, b: Math.PI / 2, exact: 1, n: 6 },
    { func: 'x^3', a: 1, b: 3, exact: 20, n: 8 }
  ];

  let trapUserAnswers = $state<string[]>(trapProblems.map(() => ''));
  let trapSubmitted = $state<boolean[]>(trapProblems.map(() => false));

  function submitTrapProblem(index: number) {
    trapSubmitted[index] = true;
  }

  onMount(() => {
    drawTrapezoidal();
  });
</script>

<div class="space-y-6">
  <Card>
    <h2 class="text-xl font-semibold text-accent mb-4">Trapezoidal Rule</h2>
    <p class="text-muted mb-4">
      Approximate the integral by summing areas of trapezoids. Increase n to improve accuracy.
    </p>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Controls -->
      <div class="space-y-4">
        <div>
          <span class="block text-sm font-medium text-muted mb-1">Function <KaTeX math="f(x)" /></span>
          <Input
            type="text"
            bind:value={trapFunc}
            placeholder="e.g., sin(x), x^2"
            class="w-full font-mono"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="block text-sm font-medium text-muted mb-1">Lower bound a</span>
            <Input
              type="number"
              bind:value={trapA}
              step="0.1"
              class="w-full font-mono"
            />
          </div>
          <div>
            <span class="block text-sm font-medium text-muted mb-1">Upper bound b</span>
            <Input
              type="number"
              bind:value={trapB}
              step="0.1"
              class="w-full font-mono"
            />
          </div>
        </div>

        <div>
          <span class="block text-sm font-medium text-muted mb-1">
            Number of panels n = {trapN}
          </span>
          <input
            type="range"
            bind:value={trapN}
            min="1"
            max="32"
            step="1"
            class="w-full"
          />
        </div>

        <div>
          <span class="block text-sm font-medium text-muted mb-1">Exact integral</span>
          <Input
            type="number"
            bind:value={trapExactIntegral}
            step="0.01"
            class="w-full font-mono"
          />
        </div>

        <!-- Results -->
        <div class="space-y-2 p-4 bg-bg-3 border border-border">
          <div class="flex justify-between items-center">
            <span class="text-sm text-muted">Exact:</span>
            <Badge class="font-mono">{trapExactIntegral.toFixed(6)}</Badge>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-primary">Approximation:</span>
            <Badge class="font-mono">{trapApprox.toFixed(6)}</Badge>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-accent">Error:</span>
            <Badge class="font-mono">{trapError.toFixed(8)}</Badge>
          </div>
        </div>
      </div>

      <!-- Visualization -->
      <div class="w-full overflow-x-auto">
        <canvas
          bind:this={trapCanvas}
          style="width: 100%; height: 400px;"
          class="border border-border bg-bg-3"
        ></canvas>
        <div class="mt-2 text-xs text-muted space-y-1">
          <div><span style="color: #f59e0b;">━━</span> Function <KaTeX math="f(x)" /></div>
          <div><span style="color: #818cf8;">□</span> Trapezoids (shaded indigo)</div>
        </div>
      </div>
    </div>

    <!-- Theory -->
    <div class="mt-6">
      <button
        class="text-accent hover:underline text-sm"
        onclick={() => (showTrapTheory = !showTrapTheory)}
      >
        {showTrapTheory ? '▼' : '▶'} Theory & Error Bound
      </button>
      {#if showTrapTheory}
        <div class="mt-4 space-y-3 p-4 bg-bg-3 border border-border text-sm text-muted">
          <div>
            <strong class="text-primary">Composite Trapezoidal Rule:</strong>
            <KaTeX
              math={'\\int_a^b f(x)\\,dx \\approx \\frac{h}{2}\\left[f(x_0) + 2\\sum_{i=1}^{n-1}f(x_i) + f(x_n)\\right]'}
              displayMode={true}
            />
            <p>where <KaTeX math="h = (b-a)/n" /> and <KaTeX math="x_i = a + ih" /></p>
          </div>
          <div>
            <strong class="text-primary">Error Bound:</strong>
            <KaTeX
              math={'E_T \\leq \\frac{(b-a)^3}{12n^2}\\max_{x\\in[a,b]}|f\'\'(x)|'}
              displayMode={true}
            />
            <p>Error decreases as <KaTeX math="O(1/n^2)" /> or <KaTeX math="O(h^2)" /></p>
          </div>
        </div>
      {/if}
    </div>
  </Card>

  <!-- Practice Problems -->
  <Card>
    <h3 class="text-lg font-bold text-primary mb-4">Practice Problems</h3>
    <p class="text-sm text-muted mb-4">
      Use the trapezoidal rule with the given n to approximate the integral.
    </p>

    <div class="space-y-4">
      {#each trapProblems as problem, i}
        <div class="p-4 bg-bg-3 border border-border">
          <p class="text-sm mb-2">
            <strong>Problem {i + 1}:</strong>
            <KaTeX math={'\\int_{' + problem.a + '}^{' + problem.b + '} ' + problem.func + '\\,dx'} />
            with n = {problem.n}
          </p>
          <div class="flex gap-2 items-center">
            <Input
              type="text"
              bind:value={trapUserAnswers[i]}
              placeholder="Your answer"
              class="w-32 font-mono"
              disabled={trapSubmitted[i]}
            />
            <Button
              onclick={() => submitTrapProblem(i)}
              variant="primary"
              size="sm"
              disabled={trapSubmitted[i]}
            >
              {trapSubmitted[i] ? 'Submitted' : 'Submit'}
            </Button>
            {#if trapSubmitted[i]}
              {#if checkAnswer(trapUserAnswers[i], problem.exact, 0.1)}
                <Badge class="bg-green-900 text-green-200">Correct!</Badge>
              {:else}
                <Badge class="bg-red-900 text-red-200">
                  Try again. Expected: ≈ {problem.exact.toFixed(3)}
                </Badge>
              {/if}
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </Card>

  <CodeTabs codes={{
    pseudocode: `INPUT: f, a, b, n (number of subintervals)
OUTPUT: approximate integral

h = (b - a) / n
sum = f(a) + f(b)
for i = 1 to n-1:
    sum = sum + 2 * f(a + i * h)

RETURN (h / 2) * sum`,
    python: `import numpy as np

def trapezoidal(f, a, b, n):
    h = (b - a) / n
    x = np.linspace(a, b, n + 1)
    y = np.array([f(xi) for xi in x])
    return h * (y[0]/2 + np.sum(y[1:-1]) + y[-1]/2)`,
    r: `trapezoidal <- function(f, a, b, n) {
  h <- (b - a) / n
  x <- seq(a, b, length.out = n + 1)
  y <- sapply(x, f)
  h * (y[1]/2 + sum(y[2:n]) + y[n + 1]/2)
}`
  }} />
</div>

<style>
  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    background: #3f3f46;
    outline: none;
    border-radius: 0;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #818cf8;
    cursor: pointer;
    border-radius: 0;
  }

  input[type='range']::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #818cf8;
    cursor: pointer;
    border-radius: 0;
    border: none;
  }
</style>
