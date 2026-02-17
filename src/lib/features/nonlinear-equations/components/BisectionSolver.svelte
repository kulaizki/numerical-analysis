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
    { label: 'x³ - 2x - 2', expr: 'x^3 - 2*x - 2' }
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

  let bisectA = $state(-2);
  let bisectB = $state(3);
  let iterations = $state<Array<{n: number, a: number, b: number, c: number, fc: number, error: number}>>([]);
  let currentStep = $state(0);
  let running = $state(false);

  function reset() {
    iterations = [];
    currentStep = 0;
    running = false;
  }

  function step() {
    const n = iterations.length;
    const a = n === 0 ? bisectA : iterations[n - 1].b < iterations[n - 1].a ? iterations[n - 1].b : iterations[n - 1].a;
    const b = n === 0 ? bisectB : iterations[n - 1].b > iterations[n - 1].a ? iterations[n - 1].b : iterations[n - 1].a;

    if (n === 0) {
      const fa = f(bisectA);
      const fb = f(bisectB);
      if (fa * fb > 0) {
        alert("f(a) and f(b) must have opposite signs!");
        return;
      }
    }

    const c = (a + b) / 2;
    const fc = f(c);
    const fa = f(a);
    const error = Math.abs(b - a);

    let newA = a, newB = b;
    if (fa * fc < 0) {
      newB = c;
    } else {
      newA = c;
    }

    iterations = [...iterations, { n: n + 1, a: newA, b: newB, c, fc, error }];
    currentStep = iterations.length;
  }

  async function runAll() {
    reset();
    running = true;
    for (let i = 0; i < 20; i++) {
      step();
      await new Promise(resolve => setTimeout(resolve, 300));
      const last = iterations[iterations.length - 1];
      if (last.error < toleranceInput && Math.abs(last.fc) < toleranceInput) break;
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

    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    const margin = Math.max(1, (bisectB - bisectA) * 0.5);
    const xMin = bisectA - margin;
    const xMax = bisectB + margin;

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

    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = xMin; x <= xMax; x += 0.01) {
      try {
        const y = f(x);
        const px = mapX(x);
        const py = mapY(y);
        if (x === xMin) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      } catch { /* skip */ }
    }
    ctx.stroke();

    if (currentStep > 0 && iterations.length > 0) {
      const iter = iterations[currentStep - 1];
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.fillRect(mapX(iter.a), padding, mapX(iter.b) - mapX(iter.a), height - 2 * padding);

      ctx.fillStyle = '#a5b4fc';
      ctx.beginPath();
      ctx.arc(mapX(iter.c), mapY(iter.fc), 5, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(mapX(iter.a), mapY(f(iter.a)), 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mapX(iter.b), mapY(f(iter.b)), 4, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.fillRect(mapX(bisectA), padding, mapX(bisectB) - mapX(bisectA), height - 2 * padding);

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(mapX(bisectA), mapY(f(bisectA)), 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mapX(bisectB), mapY(f(bisectB)), 4, 0, 2 * Math.PI);
      ctx.fill();
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
    <h2 class="text-xl font-semibold text-primary mb-4">Bisection Method</h2>

    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-medium text-primary mb-2">Theory</h3>
        <p class="text-muted mb-3">
          The bisection method finds a root by repeatedly halving an interval <KaTeX math="[a, b]" /> where <KaTeX math="f(a)" /> and <KaTeX math="f(b)" /> have opposite signs.
        </p>
        <div class="bg-background/50 p-4 mb-3">
          <KaTeX math={'c = \\frac{a + b}{2}'} />
        </div>
        <p class="text-muted mb-2">If <KaTeX math="f(a)" /> · <KaTeX math="f(c)" /> &lt; 0, then root is in <KaTeX math="[a, c]" />; otherwise in <KaTeX math="[c, b]" />.</p>
        <p class="text-muted">
          <strong>Convergence rate:</strong> <KaTeX math="O(1/2^n)" inline /> — linear convergence
        </p>
      </div>

      <div>
        <h3 class="text-lg font-medium text-primary mb-3">Interactive Visualizer</h3>

        <div class="mb-4 space-y-2">
          <span class="block text-xs text-muted mb-1">
            Custom function <span class="text-tertiary">(press Enter or Apply)</span>
          </span>
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
            <span class="text-sm text-muted mb-1 block">Initial a</span>
            <Input
              type="number"
              bind:value={bisectA}
              step="0.1"
              disabled={running || iterations.length > 0}
            />
          </div>
          <div>
            <span class="text-sm text-muted mb-1 block">Initial b</span>
            <Input
              type="number"
              bind:value={bisectB}
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
          <Button onclick={step} disabled={running || (iterations.length > 0 && iterations[iterations.length - 1].error < toleranceInput && Math.abs(iterations[iterations.length - 1].fc) < toleranceInput)}>
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
                  <th class="text-right p-2">a</th>
                  <th class="text-right p-2">b</th>
                  <th class="text-right p-2">c</th>
                  <th class="text-right p-2"><KaTeX math="f(c)" /></th>
                  <th class="text-right p-2">|b-a|</th>
                </tr>
              </thead>
              <tbody>
                {#each iterations as iter}
                  <tr class="border-b border-border/50">
                    <td class="p-2 text-primary">{iter.n}</td>
                    <td class="p-2 text-right text-muted font-mono">{iter.a.toFixed(6)}</td>
                    <td class="p-2 text-right text-muted font-mono">{iter.b.toFixed(6)}</td>
                    <td class="p-2 text-right text-primary font-mono">{iter.c.toFixed(6)}</td>
                    <td class="p-2 text-right text-muted font-mono">{iter.fc.toFixed(6)}</td>
                    <td class="p-2 text-right text-accent font-mono">{iter.error.toExponential(2)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          {#if iterations.length >= 20 || (iterations[iterations.length - 1].error < toleranceInput && Math.abs(iterations[iterations.length - 1].fc) >= toleranceInput)}
            <div class="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
              <strong>Warning:</strong> Step size converged but |f(x)| = {Math.abs(iterations[iterations.length - 1].fc).toFixed(6)} is not near zero. The method may have stagnated at a non-root. Try different starting points.
            </div>
          {/if}

          {#if iterations[iterations.length - 1].error < toleranceInput && Math.abs(iterations[iterations.length - 1].fc) < toleranceInput}
            <div class="mt-3 p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              Converged to root x ≈ {iterations[iterations.length - 1].c.toFixed(6)} in {iterations.length} iterations.
            </div>
          {/if}

          <div class="h-64">
            <Chart
              type="line"
              data={{
                labels: iterations.map(i => i.n),
                datasets: [{
                  label: 'Error |b-a|',
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

  <Card class="space-y-4 mt-6">
    <button class="w-full flex items-center justify-between text-left" onclick={() => showExample = !showExample}>
      <h3 class="text-sm font-semibold text-accent">Worked Example: x⁶ − x − 1 = 0</h3>
      <span class="text-xs text-muted">{showExample ? '▲' : '▼'}</span>
    </button>
    {#if showExample}
      <div class="space-y-4 text-sm">

        <div>
          <h4 class="font-semibold text-primary mb-1">Problem</h4>
          <p class="text-muted">Find a root of <KaTeX math={"f(x) = x^6 - x - 1 = 0"} /> on <KaTeX math={"[1,\\, 1.5]"} /> with <KaTeX math={"\\varepsilon = 0.00005"} />.</p>
        </div>

        <div>
          <h4 class="font-semibold text-primary mb-2">Section 1: Required Iterations</h4>
          <p class="text-muted mb-2">
            The convergence bound guarantees <KaTeX math={"|\\alpha - c_n| \\leq \\left(\\tfrac{1}{2}\\right)^n (b - a)"} />.
            We need:
          </p>
          <KaTeX math={"\\left(\\frac{1}{2}\\right)^n (0.5) \\leq 0.00005"} displayMode={true} />
          <p class="text-muted mb-2">Solving:</p>
          <KaTeX math={"n \\geq \\log_2\\!\\left(\\frac{0.5}{0.00005}\\right) = \\log_2(10{,}000) \\approx 13.3 \\implies n \\geq 14"} displayMode={true} />
          <p class="text-muted">General formula:</p>
          <KaTeX math={"n \\geq \\log_2\\!\\left(\\frac{b - a}{\\varepsilon}\\right)"} displayMode={true} />
        </div>

        <div>
          <h4 class="font-semibold text-primary mb-2">Section 2: Iteration Table</h4>
          <div class="overflow-x-auto">
            <table class="w-full text-xs font-mono border border-border">
              <thead class="border-b border-border bg-background/60">
                <tr>
                  <th class="text-left p-2 border-r border-border">n</th>
                  <th class="text-right p-2 border-r border-border">a</th>
                  <th class="text-right p-2 border-r border-border">b</th>
                  <th class="text-right p-2 border-r border-border">c</th>
                  <th class="text-right p-2">f(c)</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-border/60">
                  <td class="p-2 text-primary border-r border-border">1</td>
                  <td class="p-2 text-right text-muted border-r border-border">1.00000</td>
                  <td class="p-2 text-right text-muted border-r border-border">1.50000</td>
                  <td class="p-2 text-right text-primary border-r border-border">1.25000</td>
                  <td class="p-2 text-right text-muted">1.56470</td>
                </tr>
                <tr class="border-b border-border/60">
                  <td class="p-2 text-primary border-r border-border">2</td>
                  <td class="p-2 text-right text-muted border-r border-border">1.00000</td>
                  <td class="p-2 text-right text-muted border-r border-border">1.25000</td>
                  <td class="p-2 text-right text-primary border-r border-border">1.12500</td>
                  <td class="p-2 text-right text-muted">−0.09771</td>
                </tr>
                <tr class="border-b border-border/60">
                  <td class="p-2 text-primary border-r border-border">3</td>
                  <td class="p-2 text-right text-muted border-r border-border">1.12500</td>
                  <td class="p-2 text-right text-muted border-r border-border">1.25000</td>
                  <td class="p-2 text-right text-primary border-r border-border">1.18750</td>
                  <td class="p-2 text-right text-muted">0.61665</td>
                </tr>
                <tr class="border-b border-border/60">
                  <td class="p-2 text-primary border-r border-border">4</td>
                  <td class="p-2 text-right text-muted border-r border-border">1.12500</td>
                  <td class="p-2 text-right text-muted border-r border-border">1.18750</td>
                  <td class="p-2 text-right text-primary border-r border-border">1.15625</td>
                  <td class="p-2 text-right text-muted">0.23327</td>
                </tr>
                <tr class="border-b border-border/60">
                  <td class="p-2 text-primary border-r border-border">5</td>
                  <td class="p-2 text-right text-muted border-r border-border">1.12500</td>
                  <td class="p-2 text-right text-muted border-r border-border">1.15625</td>
                  <td class="p-2 text-right text-primary border-r border-border">1.14063</td>
                  <td class="p-2 text-right text-muted">0.06158</td>
                </tr>
                <tr class="border-b border-border/60">
                  <td class="p-2 text-primary border-r border-border">6</td>
                  <td class="p-2 text-right text-muted border-r border-border">1.12500</td>
                  <td class="p-2 text-right text-muted border-r border-border">1.14063</td>
                  <td class="p-2 text-right text-primary border-r border-border">1.13281</td>
                  <td class="p-2 text-right text-muted">−0.01958</td>
                </tr>
                <tr class="border-b border-border/60">
                  <td class="p-2 text-primary border-r border-border">7</td>
                  <td class="p-2 text-right text-muted border-r border-border">1.13281</td>
                  <td class="p-2 text-right text-muted border-r border-border">1.14063</td>
                  <td class="p-2 text-right text-primary border-r border-border">1.13672</td>
                  <td class="p-2 text-right text-muted">0.02062</td>
                </tr>
                <tr class="border-b border-border/60">
                  <td class="p-2 text-primary border-r border-border">8</td>
                  <td class="p-2 text-right text-muted border-r border-border">1.13281</td>
                  <td class="p-2 text-right text-muted border-r border-border">1.13672</td>
                  <td class="p-2 text-right text-primary border-r border-border">1.13477</td>
                  <td class="p-2 text-right text-muted">0.00043</td>
                </tr>
                <tr class="border-b border-border/60">
                  <td class="p-2 text-muted border-r border-border">...</td>
                  <td class="p-2 text-right text-muted border-r border-border">...</td>
                  <td class="p-2 text-right text-muted border-r border-border">...</td>
                  <td class="p-2 text-right text-muted border-r border-border">...</td>
                  <td class="p-2 text-right text-muted">...</td>
                </tr>
                <tr>
                  <td class="p-2 text-primary border-r border-border">15</td>
                  <td class="p-2 text-right text-muted border-r border-border">1.13470</td>
                  <td class="p-2 text-right text-muted border-r border-border">1.13474</td>
                  <td class="p-2 text-right text-primary border-r border-border">1.13472</td>
                  <td class="p-2 text-right text-muted">−0.00004</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-muted mt-3">
            <strong>Result:</strong> Root <KaTeX math={"\\alpha \\approx 1.13472"} /> with <KaTeX math={"|\\text{error}| \\leq 0.00005"} />. &#9632;
          </p>
        </div>

      </div>
    {/if}
  </Card>
</div>
