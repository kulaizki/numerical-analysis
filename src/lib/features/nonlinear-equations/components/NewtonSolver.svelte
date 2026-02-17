<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Button, Input } from '$lib/components/ui';

  const DEFAULT_EXPR = 'x^3 - x - 2';
  const DEFAULT_DERIV = '3*x^2 - 1';
  let funcExpr = $state(DEFAULT_EXPR);
  let derivExpr = $state(DEFAULT_DERIV);
  let funcError = $state('');
  let toleranceInput = $state(1e-6);

  const PRESETS = [
    { label: 'x³ - x - 2', expr: 'x^3 - x - 2', deriv: '3*x^2 - 1' },
    { label: 'x⁶ - x - 1', expr: 'x^6 - x - 1', deriv: '6*x^5 - 1' },
    { label: 'x⁵ - 10x³ - 1', expr: 'x^5 - 10*x^3 - 1', deriv: '5*x^4 - 30*x^2' },
    { label: 'cos(x) - x', expr: 'cos(x) - x', deriv: '-sin(x) - 1' },
    { label: '4x³ - 1 - exp(x²/2)', expr: '4*x^3 - 1 - exp(x^2/2)', deriv: '12*x^2 - x*exp(x^2/2)' }
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
  let fPrime: (x: number) => number = $state((x: number) => 3 * x ** 2 - 1);

  function applyExprs() {
    const fn = compileExpr(funcExpr);
    const dfn = compileExpr(derivExpr);
    if (fn && dfn) {
      f = fn;
      fPrime = dfn;
      funcError = '';
      reset();
    } else if (!fn) {
      funcError = 'Invalid f(x) expression';
    } else {
      funcError = "Invalid f'(x) expression";
    }
  }

  let x0 = $state(1.5);
  let iterations = $state<Array<{n: number, x: number, fx: number, fpx: number, error: number}>>([]);
  let currentStep = $state(0);
  let running = $state(false);

  function reset() {
    iterations = [];
    currentStep = 0;
    running = false;
  }

  function step() {
    const n = iterations.length;
    const x = n === 0 ? x0 : iterations[n - 1].x - iterations[n - 1].fx / iterations[n - 1].fpx;
    const fx = f(x);
    const fpx = fPrime(x);
    const error = n === 0 ? 0 : Math.abs(x - iterations[n - 1].x);

    iterations = [...iterations, { n: n + 1, x, fx, fpx, error }];
    currentStep = iterations.length;
  }

  async function runAll() {
    reset();
    running = true;
    for (let i = 0; i < 20; i++) {
      step();
      await new Promise(resolve => setTimeout(resolve, 300));
      const last = iterations[iterations.length - 1];
      if (iterations.length > 1 && last.error < toleranceInput && Math.abs(last.fx) < toleranceInput) break;
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

    const xCenter = x0;
    const xMin = xCenter - 5;
    const xMax = xCenter + 5;

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
        const x0 = iter.x;
        const y0 = iter.fx;
        const slope = iter.fpx;

        const x1 = xMin;
        const y1 = y0 + slope * (x1 - x0);
        const x2 = xMax;
        const y2 = y0 + slope * (x2 - x0);

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mapX(x1), mapY(y1));
        ctx.lineTo(mapX(x2), mapY(y2));
        ctx.stroke();

        ctx.fillStyle = '#a5b4fc';
        ctx.beginPath();
        ctx.arc(mapX(x0), mapY(y0), 4, 0, 2 * Math.PI);
        ctx.fill();

        const xIntercept = x0 - y0 / slope;
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
    <h2 class="text-xl font-semibold text-accent mb-4">Newton's Method</h2>

    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-medium text-primary mb-2">Theory</h3>
        <p class="text-muted mb-3">
          Uses the tangent line at current point to find next approximation.
        </p>
        <div class="bg-background/50 p-4 mb-3">
          <KaTeX math={'x_{n+1} = x_n - \\frac{f(x_n)}{f\'(x_n)}'} />
        </div>
        <p class="text-muted">
          <strong>Convergence rate:</strong> Quadratic (errors square each iteration)
        </p>
      </div>

      <div>
        <h3 class="text-lg font-medium text-primary mb-3">Interactive Visualizer</h3>

        <div class="mb-4 space-y-2">
          <span class="block text-xs text-muted mb-1">
            Custom function <span class="text-tertiary">(press Enter or Apply)</span>
          </span>
          <div class="flex gap-2 items-end">
            <div class="flex-1 space-y-2">
              <div class="flex gap-1 items-center">
                <span class="text-muted text-sm whitespace-nowrap">f(x) =</span>
                <input
                  type="text"
                  class="flex-1 px-3 py-1.5 bg-bg border border-border text-primary text-sm font-mono focus:outline-none focus:border-accent"
                  bind:value={funcExpr}
                  onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter') applyExprs(); }}
                />
              </div>
              <div class="flex gap-1 items-center">
                <span class="text-muted text-sm whitespace-nowrap">f'(x) =</span>
                <input
                  type="text"
                  class="flex-1 px-3 py-1.5 bg-bg border border-border text-primary text-sm font-mono focus:outline-none focus:border-accent"
                  bind:value={derivExpr}
                  onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter') applyExprs(); }}
                />
              </div>
            </div>
            <button
              class="px-3 py-1.5 bg-accent/20 text-accent text-sm hover:bg-accent/30 transition-colors"
              onclick={() => applyExprs()}
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
                onclick={() => { funcExpr = preset.expr; derivExpr = preset.deriv; applyExprs(); }}
              >
                {preset.label}
              </button>
            {/each}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span class="text-sm text-muted mb-1 block">Starting point x&#8320;</span>
            <Input
              type="number"
              bind:value={x0}
              step="0.1"
              disabled={running || iterations.length > 0}
            />
          </div>
          <div>
            <span class="text-sm text-muted mb-1 block">Tolerance ε</span>
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
          <Button onclick={step} disabled={running || (iterations.length > 1 && iterations[iterations.length - 1].error < toleranceInput && Math.abs(iterations[iterations.length - 1].fx) < toleranceInput)}>
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
                  <th class="text-right p-2">x&#8345;</th>
                  <th class="text-right p-2">f(x&#8345;)</th>
                  <th class="text-right p-2">f'(x&#8345;)</th>
                  <th class="text-right p-2">|x&#8345; - x&#8345;&#8331;&#8321;|</th>
                </tr>
              </thead>
              <tbody>
                {#each iterations as iter}
                  <tr class="border-b border-border/50">
                    <td class="p-2 text-primary">{iter.n}</td>
                    <td class="p-2 text-right text-primary font-mono">{iter.x.toFixed(6)}</td>
                    <td class="p-2 text-right text-muted font-mono">{iter.fx.toFixed(6)}</td>
                    <td class="p-2 text-right text-muted font-mono">{iter.fpx.toFixed(6)}</td>
                    <td class="p-2 text-right text-accent font-mono">
                      {iter.n > 1 ? iter.error.toExponential(2) : '-'}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <div class="h-64">
            <Chart
              type="line"
              data={{
                labels: iterations.filter(i => i.n > 1).map(i => i.n),
                datasets: [{
                  label: 'Error |x\u2099 - x\u2099\u208B\u2081|',
                  data: iterations.filter(i => i.n > 1).map(i => i.error),
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

          {#if iterations.length >= 20 || (iterations.length > 1 && iterations[iterations.length - 1].error < toleranceInput && Math.abs(iterations[iterations.length - 1].fx) >= toleranceInput)}
            <div class="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
              <strong>Warning:</strong> Step size converged but |f(x)| = {Math.abs(iterations[iterations.length - 1].fx).toFixed(6)} is not near zero. The method may have stagnated at a non-root. Try different starting points.
            </div>
          {/if}

          {#if iterations.length > 1 && iterations[iterations.length - 1].error < toleranceInput && Math.abs(iterations[iterations.length - 1].fx) < toleranceInput}
            <div class="mt-3 p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              Converged to root x ≈ {iterations[iterations.length - 1].x.toFixed(6)} in {iterations.length} iterations.
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </Card>

  <Card>
    <button
      class="w-full flex items-center justify-between text-left"
      onclick={() => (showExample = !showExample)}
    >
      <h2 class="text-xl font-semibold text-primary">Worked Example: f(x) = x⁶ − x − 1</h2>
      <span class="text-muted text-sm">{showExample ? '▲ Hide' : '▼ Show'}</span>
    </button>

    {#if showExample}
      <div class="mt-6 space-y-8">

        <!-- Section 1: Iteration Formula -->
        <div>
          <h3 class="text-lg font-medium text-primary mb-3">1. Iteration Formula</h3>
          <p class="text-muted mb-3">
            Given f(x) = x⁶ − x − 1 and f'(x) = 6x⁵ − 1, Newton's update is:
          </p>
          <div class="bg-background/50 p-4">
            <KaTeX math={"x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)} = x_n - \\frac{x_n^6 - x_n - 1}{6x_n^5 - 1}"} displayMode={true} />
          </div>
        </div>

        <!-- Section 2: Iterations Table -->
        <div>
          <h3 class="text-lg font-medium text-primary mb-3">2. Iterations (x&#8320; = 2)</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="border-b border-border">
                <tr class="text-muted">
                  <th class="text-left p-2">n</th>
                  <th class="text-right p-2">x&#8345;</th>
                  <th class="text-right p-2">f(x&#8345;)</th>
                  <th class="text-right p-2">f'(x&#8345;)</th>
                  <th class="text-right p-2">x&#8345;&#8330;&#8321;</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-border/50">
                  <td class="p-2 text-primary">0</td>
                  <td class="p-2 text-right font-mono text-primary">2.000000</td>
                  <td class="p-2 text-right font-mono text-muted">61.000000</td>
                  <td class="p-2 text-right font-mono text-muted">191.000000</td>
                  <td class="p-2 text-right font-mono text-accent">1.680628</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="p-2 text-primary">1</td>
                  <td class="p-2 text-right font-mono text-primary">1.680628</td>
                  <td class="p-2 text-right font-mono text-muted">—</td>
                  <td class="p-2 text-right font-mono text-muted">—</td>
                  <td class="p-2 text-right font-mono text-accent">1.430739</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="p-2 text-primary">2</td>
                  <td class="p-2 text-right font-mono text-primary">1.430739</td>
                  <td class="p-2 text-right font-mono text-muted">—</td>
                  <td class="p-2 text-right font-mono text-muted">—</td>
                  <td class="p-2 text-right font-mono text-accent">1.254971</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="p-2 text-primary">3</td>
                  <td class="p-2 text-right font-mono text-primary">1.254971</td>
                  <td class="p-2 text-right font-mono text-muted">—</td>
                  <td class="p-2 text-right font-mono text-muted">—</td>
                  <td class="p-2 text-right font-mono text-accent">1.161538</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="p-2 text-primary">4</td>
                  <td class="p-2 text-right font-mono text-primary">1.161538</td>
                  <td class="p-2 text-right font-mono text-muted">—</td>
                  <td class="p-2 text-right font-mono text-muted">—</td>
                  <td class="p-2 text-right font-mono text-accent">1.136353</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="p-2 text-primary">5</td>
                  <td class="p-2 text-right font-mono text-primary">1.136353</td>
                  <td class="p-2 text-right font-mono text-muted">—</td>
                  <td class="p-2 text-right font-mono text-muted">—</td>
                  <td class="p-2 text-right font-mono text-accent">1.134731</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="p-2 text-primary">6</td>
                  <td class="p-2 text-right font-mono text-primary">1.134731</td>
                  <td class="p-2 text-right font-mono text-muted">—</td>
                  <td class="p-2 text-right font-mono text-muted">—</td>
                  <td class="p-2 text-right font-mono text-accent">1.134724</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-muted mt-3 text-sm">
            Root &#945; &#8776; 1.134724, converged in 7 iterations — versus Bisection's 15.
          </p>
        </div>

        <!-- Section 3: Convergence Theorem -->
        <div>
          <h3 class="text-lg font-medium text-primary mb-3">3. Convergence Theorem</h3>
          <p class="text-muted mb-3">
            If f(&#945;) = 0, f'(&#945;) &#8800; 0, and f, f', f'' are continuous near &#945;, then the errors satisfy:
          </p>
          <div class="bg-background/50 p-4 mb-3">
            <KaTeX math={"\\lim_{n \\to \\infty} \\frac{\\alpha - x_{n+1}}{(\\alpha - x_n)^2} = -\\frac{f''(\\alpha)}{2f'(\\alpha)}"} displayMode={true} />
          </div>
          <p class="text-muted text-sm">
            This establishes <strong>quadratic convergence</strong> (order p = 2): each iteration roughly squares the previous error.
          </p>
        </div>

        <!-- Section 4: Error Estimation -->
        <div>
          <h3 class="text-lg font-medium text-primary mb-3">4. Error Estimation</h3>
          <p class="text-muted mb-3">
            Since the true root &#945; is unknown, the step size is used as a practical error proxy:
          </p>
          <div class="bg-background/50 p-4 mb-3 space-y-4">
            <div>
              <p class="text-muted text-sm mb-2">Absolute error estimate:</p>
              <KaTeX math={"\\alpha - x_n \\approx x_{n+1} - x_n"} displayMode={true} />
            </div>
            <div>
              <p class="text-muted text-sm mb-2">Relative error estimate:</p>
              <KaTeX math={"\\frac{\\alpha - x_n}{\\alpha} \\approx \\frac{x_{n+1} - x_n}{x_{n+1}}"} displayMode={true} />
            </div>
          </div>
        </div>

      </div>
    {/if}
  </Card>
</div>
