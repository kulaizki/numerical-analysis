<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Button, Input } from '$lib/components/ui';

  const defaultF = (x: number) => x ** 3 - x - 2;

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
      const fx0 = defaultF(x0);
      const fx1 = iterations[n - 1].fx1;
      const prevX0 = iterations[n - 1].x0;
      x1 = x0 - fx0 * (x0 - prevX0) / (fx0 - defaultF(prevX0));
    }

    const fx1 = defaultF(x1);
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

    const xMin = -1, xMax = 3;
    const yMin = -6, yMax = 20;

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
      const y = defaultF(x);
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
        const y0 = defaultF(x0);
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

  $effect(() => {
    if (canvas) {
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

        <div class="grid grid-cols-2 gap-4 mb-4">
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
</div>
