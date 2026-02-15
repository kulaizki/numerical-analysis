<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Button, Input } from '$lib/components/ui';

  const defaultF = (x: number) => x ** 3 - x - 2;
  const defaultFPrime = (x: number) => 3 * x ** 2 - 1;

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
    const fx = defaultF(x);
    const fpx = defaultFPrime(x);
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
      if (iterations.length > 1 && iterations[iterations.length - 1].error < 1e-6) break;
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

  $effect(() => {
    if (canvas) {
      drawCanvas(canvas);
    }
  });
</script>

<div class="space-y-6">
  <Card>
    <h2 class="text-xl font-semibold text-primary mb-4">Newton's Method</h2>

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

        <div class="mb-4">
          <label class="text-sm text-muted mb-1 block">Starting point x&#8320;</label>
          <Input
            type="number"
            bind:value={x0}
            step="0.1"
            disabled={running || iterations.length > 0}
          />
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
        {/if}
      </div>
    </div>
  </Card>
</div>
