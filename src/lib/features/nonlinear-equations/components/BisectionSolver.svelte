<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Button, Input } from '$lib/components/ui';

  const defaultF = (x: number) => x ** 3 - x - 2;

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
      const fa = defaultF(bisectA);
      const fb = defaultF(bisectB);
      if (fa * fb > 0) {
        alert("f(a) and f(b) must have opposite signs!");
        return;
      }
    }

    const c = (a + b) / 2;
    const fc = defaultF(c);
    const fa = defaultF(a);
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
      if (iterations[iterations.length - 1].error < 1e-6) break;
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

    const xMin = -2, xMax = 3;
    const yMin = -6, yMax = 20;

    const mapX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
    const mapY = (y: number) => height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);

    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = xMin; x <= xMax; x += 0.01) {
      const y = defaultF(x);
      const px = mapX(x);
      const py = mapY(y);
      if (x === xMin) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
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
      ctx.arc(mapX(iter.a), mapY(defaultF(iter.a)), 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mapX(iter.b), mapY(defaultF(iter.b)), 4, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.fillRect(mapX(bisectA), padding, mapX(bisectB) - mapX(bisectA), height - 2 * padding);

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(mapX(bisectA), mapY(defaultF(bisectA)), 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mapX(bisectB), mapY(defaultF(bisectB)), 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('x', width - padding + 10, height - padding + 5);
    ctx.fillText('y', padding - 5, padding - 10);
  }

  let canvas: HTMLCanvasElement | undefined = $state();

  $effect(() => {
    if (canvas) {
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

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="text-sm text-muted mb-1 block">Initial a</label>
            <Input
              type="number"
              bind:value={bisectA}
              step="0.1"
              disabled={running || iterations.length > 0}
            />
          </div>
          <div>
            <label class="text-sm text-muted mb-1 block">Initial b</label>
            <Input
              type="number"
              bind:value={bisectB}
              step="0.1"
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
          <Button onclick={step} disabled={running || (iterations.length > 0 && iterations[iterations.length - 1].error < 1e-6)}>
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
</div>
