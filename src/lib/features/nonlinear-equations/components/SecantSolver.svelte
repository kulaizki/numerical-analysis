<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Button, Input } from '$lib/components/ui';

  const DEFAULT_EXPR = 'x^3 - x - 2';
  let funcExpr = $state(DEFAULT_EXPR);
  let funcError = $state('');
  let toleranceInput = $state(1e-6);

  const PRESETS = [
    { label: 'x³ - x - 2', expr: 'x^3 - x - 2' },
    { label: 'x⁶ - x - 1', expr: 'x^6 - x - 1' },
    { label: 'x⁵ - 10x³ - 1', expr: 'x^5 - 10*x^3 - 1' },
    { label: 'cos(x) - x', expr: 'cos(x) - x' },
    { label: '4x³ - 1 - exp(x²/2)', expr: '4*x^3 - 1 - exp(x^2/2)' }
  ];

  function compileExpr(expr: string): ((x: number) => number) | null {
    let s = expr.trim().toLowerCase();
    s = s
      .replace(/\bpi\b/g, 'Math.PI')
      .replace(/\be\b(?!\(|x)/g, 'Math.E')
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\btan\b/g, 'Math.tan')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\bexp\b/g, 'Math.exp')
      .replace(/\bln\b/g, 'Math.log')
      .replace(/\blog\b/g, 'Math.log10');
    s = s.replace(/\^/g, '**');
    try {
      const fn = new Function('x', `"use strict"; return (${s});`) as (x: number) => number;
      fn(1);
      return fn;
    } catch {
      return null;
    }
  }

  let f: (x: number) => number = $state((x: number) => x ** 3 - x - 2);

  function applyExpr(expr: string) {
    const fn = compileExpr(expr);
    if (fn) {
      f = fn;
      funcError = '';
      reset();
    } else {
      funcError = 'Invalid expression';
    }
  }

  let initialX0 = $state(1);
  let initialX1 = $state(2);
  let iterations = $state<Array<{n: number, x0: number, x1: number, fx1: number, error: number}>>([]);
  let currentStep = $state(0);
  let running = $state(false);

  function reset() {
    iterations = [];
    currentStep = 0;
    running = false;
  }

  function step() {
    const n = iterations.length;
    let x0, x1;

    if (n === 0) {
      x0 = initialX0;
      x1 = initialX1;
    } else {
      x0 = iterations[n - 1].x1;
      const fx0 = f(x0);
      const fx1 = iterations[n - 1].fx1;
      const prevX0 = iterations[n - 1].x0;
      x1 = x0 - fx0 * (x0 - prevX0) / (fx0 - f(prevX0));
    }

    const fx1 = f(x1);
    const error = Math.abs(x1 - x0);

    iterations = [...iterations, { n: n + 1, x0, x1, fx1, error }];
    currentStep = iterations.length;
  }

  async function runAll() {
    reset();
    running = true;
    for (let i = 0; i < 20; i++) {
      step();
      await new Promise(resolve => setTimeout(resolve, 300));
      if (iterations[iterations.length - 1].error < toleranceInput) break;
    }
    running = false;
  }

  function drawCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;
    const padding = 40;

    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, width, height);

    const margin = Math.max(1, Math.abs(initialX1 - initialX0) * 1.5);
    const xCenter = (initialX0 + initialX1) / 2;
    const xMin = xCenter - margin - 2;
    const xMax = xCenter + margin + 2;

    let yMinSample = Infinity, yMaxSample = -Infinity;
    for (let x = xMin; x <= xMax; x += (xMax - xMin) / 200) {
      try {
        const y = f(x);
        if (isFinite(y)) {
          if (y < yMinSample) yMinSample = y;
          if (y > yMaxSample) yMaxSample = y;
        }
      } catch { /* skip */ }
    }
    const yRange = yMaxSample - yMinSample || 1;
    const yMin = yMinSample - yRange * 0.2;
    const yMax = yMaxSample + yRange * 0.2;

    const mapX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
    const mapY = (y: number) => height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);

    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = xMin; x <= xMax; x += 0.01) {
      const y = f(x);
      const px = mapX(x);
      const py = mapY(y);
      if (x === xMin) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    if (currentStep > 0) {
      for (let i = 0; i < currentStep; i++) {
        const iter = iterations[i];
        const x0 = iter.x0;
        const y0 = f(x0);
        const x1 = iter.x1;
        const y1 = iter.fx1;

        const slope = (y1 - y0) / (x1 - x0);
        const xStart = xMin;
        const yStart = y1 + slope * (xStart - x1);
        const xEnd = xMax;
        const yEnd = y1 + slope * (xEnd - x1);

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mapX(xStart), mapY(yStart));
        ctx.lineTo(mapX(xEnd), mapY(yEnd));
        ctx.stroke();

        ctx.fillStyle = '#a5b4fc';
        ctx.beginPath();
        ctx.arc(mapX(x0), mapY(y0), 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mapX(x1), mapY(y1), 4, 0, 2 * Math.PI);
        ctx.fill();

        const xIntercept = x1 - y1 / slope;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(mapX(xIntercept), mapY(0), 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('x', width - padding + 10, height - padding + 5);
    ctx.fillText('y', padding - 5, padding - 10);
  }

  let canvas: HTMLCanvasElement | undefined = $state();
  let showExample = $state(false);

  $effect(() => {
    if (canvas) {
      iterations;
      currentStep;
      f;
      drawCanvas(canvas);
    }
  });
</script>

<div class="space-y-6">
  <Card>
    <h2 class="text-xl font-semibold text-primary mb-4">Secant Method</h2>

    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-medium text-primary mb-2">Theory</h3>
        <p class="text-muted mb-3">
          Approximates the derivative using a secant line through two points. No derivative needed.
        </p>
        <div class="bg-background/50 p-4 mb-3">
          <KaTeX math={'x_{n+1} = x_n - f(x_n) \\frac{x_n - x_{n-1}}{f(x_n) - f(x_{n-1})}'} />
        </div>
        <p class="text-muted">
          <strong>Convergence rate:</strong> Superlinear ({'\u2248'}1.618, golden ratio)
        </p>
      </div>

      <div>
        <h3 class="text-lg font-medium text-primary mb-3">Interactive Visualizer</h3>

        <div class="mb-4 space-y-2">
          <label class="block text-xs text-muted mb-1">
            Custom function <span class="text-tertiary">(press Enter or Apply)</span>
          </label>
          <div class="flex gap-2 items-end">
            <div class="flex-1">
              <div class="flex gap-1 items-center">
                <span class="text-muted text-sm">f(x) =</span>
                <input
                  type="text"
                  class="flex-1 px-3 py-1.5 bg-bg border border-border text-primary text-sm font-mono focus:outline-none focus:border-accent"
                  bind:value={funcExpr}
                  onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter') applyExpr(funcExpr); }}
                />
              </div>
            </div>
            <button
              class="px-3 py-1.5 bg-accent/20 text-accent text-sm hover:bg-accent/30 transition-colors"
              onclick={() => applyExpr(funcExpr)}
            >
              Apply
            </button>
          </div>
          {#if funcError}
            <p class="text-red-400 text-xs">{funcError}</p>
          {/if}
          <div class="flex gap-2 flex-wrap">
            {#each PRESETS as preset}
              <button
                class="px-2 py-0.5 text-xs border border-border text-muted hover:text-primary hover:border-accent transition-colors {funcExpr === preset.expr ? 'border-accent text-accent' : ''}"
                onclick={() => { funcExpr = preset.expr; applyExpr(preset.expr); }}
              >
                {preset.label}
              </button>
            {/each}
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label class="text-sm text-muted mb-1 block">Initial x&#8320;</label>
            <Input
              type="number"
              bind:value={initialX0}
              step="0.1"
              disabled={running || iterations.length > 0}
            />
          </div>
          <div>
            <label class="text-sm text-muted mb-1 block">Initial x&#8321;</label>
            <Input
              type="number"
              bind:value={initialX1}
              step="0.1"
              disabled={running || iterations.length > 0}
            />
          </div>
          <div>
            <label class="text-sm text-muted mb-1 block">Tolerance ε</label>
            <Input
              type="number"
              bind:value={toleranceInput}
              step="0.0001"
              disabled={running || iterations.length > 0}
            />
          </div>
        </div>

        <div class="w-full overflow-x-auto">
          <canvas
            bind:this={canvas}
            style="width: 100%; height: 400px;"
            class="border border-border mb-4"
          ></canvas>
        </div>

        <div class="flex gap-2 mb-4">
          <Button onclick={step} disabled={running || (iterations.length > 0 && iterations[iterations.length - 1].error < toleranceInput)}>
            Step
          </Button>
          <Button onclick={runAll} disabled={running}>
            Run All
          </Button>
          <Button onclick={reset} variant="outline">
            Reset
          </Button>
        </div>

        {#if iterations.length > 0}
          <div class="overflow-x-auto mb-4">
            <table class="w-full text-sm">
              <thead class="border-b border-border">
                <tr class="text-muted">
                  <th class="text-left p-2">n</th>
                  <th class="text-right p-2">x&#8345;&#8331;&#8321;</th>
                  <th class="text-right p-2">x&#8345;</th>
                  <th class="text-right p-2">f(x&#8345;)</th>
                  <th class="text-right p-2">|x&#8345; - x&#8345;&#8331;&#8321;|</th>
                </tr>
              </thead>
              <tbody>
                {#each iterations as iter}
                  <tr class="border-b border-border/50">
                    <td class="p-2 text-primary">{iter.n}</td>
                    <td class="p-2 text-right text-muted font-mono">{iter.x0.toFixed(6)}</td>
                    <td class="p-2 text-right text-primary font-mono">{iter.x1.toFixed(6)}</td>
                    <td class="p-2 text-right text-muted font-mono">{iter.fx1.toFixed(6)}</td>
                    <td class="p-2 text-right text-accent font-mono">{iter.error.toExponential(2)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <div class="h-64">
            <Chart
              type="line"
              data={{
                labels: iterations.map(i => i.n),
                datasets: [{
                  label: 'Error |x\u2099 - x\u2099\u208B\u2081|',
                  data: iterations.map(i => i.error),
                  borderColor: '#818cf8',
                  backgroundColor: '#818cf8'
                }]
              }}
              options={{
                scales: {
                  y: {
                    type: 'logarithmic',
                    title: { display: true, text: 'Error (log scale)' }
                  },
                  x: {
                    title: { display: true, text: 'Iteration' }
                  }
                }
              }}
            />
          </div>
        {/if}
      </div>
    </div>
  </Card>

  <Card>
    <button
      class="w-full flex items-center justify-between text-left"
      onclick={() => (showExample = !showExample)}
    >
      <h2 class="text-xl font-semibold text-primary">Worked Example</h2>
      <span class="text-muted text-sm">{showExample ? '▲ Hide' : '▼ Show'}</span>
    </button>

    {#if showExample}
      <div class="mt-6 space-y-8">

        <!-- Section 1: Iteration Formula -->
        <div>
          <h3 class="text-lg font-medium text-primary mb-3">1. Iteration Formula</h3>
          <p class="text-muted mb-3">
            We seek the root of <KaTeX math={"f(x) = x^6 - x - 1"} /> starting from
            <KaTeX math={"x_0 = 1"} />, <KaTeX math={"x_1 = 2"} />.
          </p>
          <div class="bg-background/50 p-4">
            <KaTeX math={"x_{n+1} = x_n - f(x_n) \\cdot \\frac{x_n - x_{n-1}}{f(x_n) - f(x_{n-1})}"} displayMode={true} />
          </div>
          <p class="text-muted mt-3 text-sm">
            Each step replaces the exact derivative with the slope of the secant line through
            <KaTeX math={"(x_{n-1},\\, f(x_{n-1}))"} /> and <KaTeX math={"(x_n,\\, f(x_n))"} />.
          </p>
        </div>

        <!-- Section 2: Iterations -->
        <div>
          <h3 class="text-lg font-medium text-primary mb-3">2. Iterations</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="border-b border-border">
                <tr class="text-muted">
                  <th class="text-left p-2">n</th>
                  <th class="text-right p-2">x&#8345;</th>
                  <th class="text-right p-2">f(x&#8345;)</th>
                </tr>
              </thead>
              <tbody>
                {#each [
                  { n: 0, x: '1.000000', fx: '−1.000000' },
                  { n: 1, x: '2.000000', fx: '61.000000' },
                  { n: 2, x: '1.016129', fx: '−0.915368' },
                  { n: 3, x: '1.030675', fx: '−0.831920' },
                  { n: 4, x: '1.175689', fx: '0.465228' },
                  { n: 5, x: '1.123679', fx: '−0.110634' },
                  { n: 6, x: '1.133671', fx: '−0.010807' },
                  { n: 7, x: '1.134753', fx: '0.000297' },
                  { n: 8, x: '1.134724', fx: '−0.000001' },
                ] as row}
                  <tr class="border-b border-border/50 {row.n === 8 ? 'text-primary font-semibold' : ''}">
                    <td class="p-2 text-primary font-mono">{row.n}</td>
                    <td class="p-2 text-right font-mono">{row.x}</td>
                    <td class="p-2 text-right font-mono text-muted">{row.fx}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <p class="text-muted mt-3 text-sm">
            Root <KaTeX math={"\\alpha \\approx 1.134724"} /> reached in 8 iterations — no derivative
            needed, but one more step than Newton's method (7 iterations).
          </p>
        </div>

        <!-- Section 3: Error Analysis -->
        <div>
          <h3 class="text-lg font-medium text-primary mb-3">3. Error Analysis</h3>
          <div class="bg-background/50 p-4 mb-3">
            <KaTeX math={"\\alpha - x_{n+1} = -(\\alpha - x_{n-1})(\\alpha - x_n) \\cdot \\frac{f''(\\zeta_n)}{2f'(\\xi_n)}"} displayMode={true} />
          </div>
          <p class="text-muted text-sm">
            The secant method has <strong>superlinear convergence</strong> with order
            <KaTeX math={"p \\approx \\frac{1+\\sqrt{5}}{2} \\approx 1.618"} /> (the golden ratio).
            Each step requires only one new function evaluation.
          </p>
        </div>

        <!-- Section 4: Comparison -->
        <div>
          <h3 class="text-lg font-medium text-primary mb-3">4. Method Comparison</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="border-b border-border">
                <tr class="text-muted">
                  <th class="text-left p-2">Method</th>
                  <th class="text-right p-2">Iterations</th>
                  <th class="text-right p-2">Convergence</th>
                  <th class="text-right p-2">Requires f&#8242;</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-border/50">
                  <td class="p-2 font-mono">Bisection</td>
                  <td class="p-2 text-right font-mono text-muted">15</td>
                  <td class="p-2 text-right text-muted">Linear (guaranteed)</td>
                  <td class="p-2 text-right text-muted">No</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="p-2 font-mono">Newton</td>
                  <td class="p-2 text-right font-mono text-muted">7</td>
                  <td class="p-2 text-right text-muted">Quadratic</td>
                  <td class="p-2 text-right text-muted">Yes</td>
                </tr>
                <tr class="border-b border-border/50 text-primary font-semibold">
                  <td class="p-2 font-mono">Secant</td>
                  <td class="p-2 text-right font-mono">8</td>
                  <td class="p-2 text-right">Superlinear &#8776; 1.618</td>
                  <td class="p-2 text-right">No</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-muted mt-3 text-sm">
            The secant method achieves near-quadratic speed without an analytical derivative —
            ideal when <KaTeX math={"f'(x)"} /> is unavailable or expensive to compute.
          </p>
        </div>

      </div>
    {/if}
  </Card>
</div>
