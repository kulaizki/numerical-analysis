<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Badge, Button, Input } from '$lib/components/ui';
  import { onMount } from 'svelte';
  import { evaluateFunc, checkAnswer } from '../utils';

  // State
  let simpN = $state(4);
  let simpFunc = $state('sin(x)');
  let simpA = $state(0);
  let simpB = $state(Math.PI);
  let simpExactIntegral = $state(2);
  let simpCanvas: HTMLCanvasElement;
  let showSimpTheory = $state(false);

  function simpsonsRule(n: number): number {
    if (n % 2 !== 0) n++;
    const h = (simpB - simpA) / n;
    let sum = evaluateFunc(simpFunc, simpA) + evaluateFunc(simpFunc, simpB);

    for (let i = 1; i < n; i++) {
      const x = simpA + i * h;
      sum += (i % 2 === 0 ? 2 : 4) * evaluateFunc(simpFunc, x);
    }

    return (h / 3) * sum;
  }

  let simpApprox = $derived(simpsonsRule(simpN));
  let simpError = $derived(Math.abs(simpExactIntegral - simpApprox));

  function drawSimpson() {
    if (!simpCanvas) return;
    const ctx = simpCanvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = simpCanvas.getBoundingClientRect();
    simpCanvas.width = rect.width * dpr;
    simpCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;

    // Clear
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    const pad = 40;
    const plotWidth = width - 2 * pad;
    const plotHeight = height - 2 * pad;

    const xMin = simpA - 0.5;
    const xMax = simpB + 0.5;
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

    // Draw parabolic segments
    const n = simpN % 2 === 0 ? simpN : simpN + 1;
    const h = (simpB - simpA) / n;

    for (let i = 0; i < n; i += 2) {
      const x0 = simpA + i * h;
      const x1 = simpA + (i + 1) * h;
      const x2 = simpA + (i + 2) * h;
      const y0 = evaluateFunc(simpFunc, x0);
      const y1 = evaluateFunc(simpFunc, x1);
      const y2 = evaluateFunc(simpFunc, x2);

      // Draw parabola through three points
      ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(scaleX(x0), scaleY(0));
      ctx.lineTo(scaleX(x0), scaleY(y0));

      // Draw parabola
      for (let t = 0; t <= 20; t++) {
        const u = t / 20;
        const x = x0 + u * (x2 - x0);
        // Lagrange interpolation through 3 points
        const L0 = ((x - x1) * (x - x2)) / ((x0 - x1) * (x0 - x2));
        const L1 = ((x - x0) * (x - x2)) / ((x1 - x0) * (x1 - x2));
        const L2 = ((x - x0) * (x - x1)) / ((x2 - x0) * (x2 - x1));
        const y = L0 * y0 + L1 * y1 + L2 * y2;
        ctx.lineTo(scaleX(x), scaleY(y));
      }

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
      const y = evaluateFunc(simpFunc, x);
      if (i === 0) ctx.moveTo(scaleX(x), scaleY(y));
      else ctx.lineTo(scaleX(x), scaleY(y));
    }
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '12px Manrope';
    ctx.fillText(`n = ${n}`, 10, 20);
  }

  $effect(() => {
    simpN;
    simpFunc;
    simpA;
    simpB;
    drawSimpson();
  });

  // Practice problems
  type IntegralProblem = {
    func: string;
    a: number;
    b: number;
    exact: number;
    n: number;
  };

  const simpProblems: IntegralProblem[] = [
    { func: 'x^2', a: 0, b: 2, exact: 8 / 3, n: 4 },
    { func: 'cos(x)', a: 0, b: Math.PI / 2, exact: 1, n: 6 },
    { func: 'x^3', a: 1, b: 3, exact: 20, n: 8 }
  ];

  let simpUserAnswers = $state<string[]>(simpProblems.map(() => ''));
  let simpSubmitted = $state<boolean[]>(simpProblems.map(() => false));

  function submitSimpProblem(index: number) {
    simpSubmitted[index] = true;
  }

  onMount(() => {
    drawSimpson();
  });
</script>

<div class="space-y-6">
  <Card>
    <h2 class="text-xl font-semibold text-accent mb-4">Simpson's Rule</h2>
    <p class="text-muted mb-4">
      Approximate the integral using parabolic segments. More accurate than trapezoidal for smooth functions.
    </p>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Controls -->
      <div class="space-y-4">
        <div>
          <span class="block text-sm font-medium text-muted mb-1">Function <KaTeX math="f(x)" /></span>
          <Input
            type="text"
            bind:value={simpFunc}
            placeholder="e.g., sin(x), x^2"
            class="w-full font-mono"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="block text-sm font-medium text-muted mb-1">Lower bound a</span>
            <Input
              type="number"
              bind:value={simpA}
              step="0.1"
              class="w-full font-mono"
            />
          </div>
          <div>
            <span class="block text-sm font-medium text-muted mb-1">Upper bound b</span>
            <Input
              type="number"
              bind:value={simpB}
              step="0.1"
              class="w-full font-mono"
            />
          </div>
        </div>

        <div>
          <span class="block text-sm font-medium text-muted mb-1">
            Number of panels n = {simpN} {simpN % 2 !== 0 ? '(will use ' + (simpN + 1) + ')' : ''}
          </span>
          <input
            type="range"
            bind:value={simpN}
            min="2"
            max="32"
            step="2"
            class="w-full"
          />
          <p class="text-xs text-muted mt-1">Simpson's rule requires even n</p>
        </div>

        <div>
          <span class="block text-sm font-medium text-muted mb-1">Exact integral</span>
          <Input
            type="number"
            bind:value={simpExactIntegral}
            step="0.01"
            class="w-full font-mono"
          />
        </div>

        <!-- Results -->
        <div class="space-y-2 p-4 bg-bg-3 border border-border">
          <div class="flex justify-between items-center">
            <span class="text-sm text-muted">Exact:</span>
            <Badge class="font-mono">{simpExactIntegral.toFixed(6)}</Badge>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-primary">Approximation:</span>
            <Badge class="font-mono">{simpApprox.toFixed(6)}</Badge>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-accent">Error:</span>
            <Badge class="font-mono">{simpError.toFixed(8)}</Badge>
          </div>
        </div>
      </div>

      <!-- Visualization -->
      <div class="w-full overflow-x-auto">
        <canvas
          bind:this={simpCanvas}
          style="width: 100%; height: 400px;"
          class="border border-border bg-bg-3"
        ></canvas>
        <div class="mt-2 text-xs text-muted space-y-1">
          <div><span style="color: #f59e0b;">━━</span> Function <KaTeX math="f(x)" /></div>
          <div><span style="color: #8b5cf6;">□</span> Parabolic segments (shaded purple)</div>
        </div>
      </div>
    </div>

    <!-- Theory -->
    <div class="mt-6">
      <button
        class="text-accent hover:underline text-sm"
        onclick={() => (showSimpTheory = !showSimpTheory)}
      >
        {showSimpTheory ? '▼' : '▶'} Theory & Error Bound
      </button>
      {#if showSimpTheory}
        <div class="mt-4 space-y-3 p-4 bg-bg-3 border border-border text-sm text-muted">
          <div>
            <strong class="text-primary">Composite Simpson's Rule:</strong>
            <KaTeX
              math={'\\int_a^b f(x)\\,dx \\approx \\frac{h}{3}\\left[f(x_0) + 4\\sum_{i=1,3,5,...}^{n-1}f(x_i) + 2\\sum_{i=2,4,6,...}^{n-2}f(x_i) + f(x_n)\\right]'}
              displayMode={true}
            />
            <p>where <KaTeX math="h = (b-a)/n" /> and n is even</p>
          </div>
          <div>
            <strong class="text-primary">Error Bound:</strong>
            <KaTeX
              math={'E_S \\leq \\frac{(b-a)^5}{180n^4}\\max_{x\\in[a,b]}|f^{(4)}(x)|'}
              displayMode={true}
            />
            <p>Error decreases as <KaTeX math="O(1/n^4)" /> or <KaTeX math="O(h^4)" /> — much faster than trapezoidal!</p>
          </div>
        </div>
      {/if}
    </div>
  </Card>

  <!-- Practice Problems -->
  <Card>
    <h3 class="text-lg font-bold text-primary mb-4">Practice Problems</h3>
    <p class="text-sm text-muted mb-4">
      Use Simpson's rule with the given n to approximate the integral.
    </p>

    <div class="space-y-4">
      {#each simpProblems as problem, i}
        <div class="p-4 bg-bg-3 border border-border">
          <p class="text-sm mb-2">
            <strong>Problem {i + 1}:</strong>
            <KaTeX math={'\\int_{' + problem.a + '}^{' + problem.b + '} ' + problem.func + '\\,dx'} />
            with n = {problem.n}
          </p>
          <div class="flex gap-2 items-center">
            <Input
              type="text"
              bind:value={simpUserAnswers[i]}
              placeholder="Your answer"
              class="w-32 font-mono"
              disabled={simpSubmitted[i]}
            />
            <Button
              onclick={() => submitSimpProblem(i)}
              variant="primary"
              size="sm"
              disabled={simpSubmitted[i]}
            >
              {simpSubmitted[i] ? 'Submitted' : 'Submit'}
            </Button>
            {#if simpSubmitted[i]}
              {#if checkAnswer(simpUserAnswers[i], problem.exact, 0.05)}
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
