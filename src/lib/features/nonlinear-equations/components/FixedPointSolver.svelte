<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Button, Input } from '$lib/components/ui';

  const fixedPointG = (x: number) => Math.cbrt(x + 2);

  let x0 = $state(1.5);
  let iterations = $state<Array<{n: number, x: number, gx: number}>>([]);
  let currentStep = $state(0);
  let running = $state(false);

  function reset() {
    iterations = [];
    currentStep = 0;
    running = false;
  }

  function step() {
    const n = iterations.length;
    const x = n === 0 ? x0 : iterations[n - 1].gx;
    const gx = fixedPointG(x);

    iterations = [...iterations, { n: n + 1, x, gx }];
    currentStep = iterations.length;
  }

  async function runAll() {
    reset();
    running = true;
    for (let i = 0; i < 20; i++) {
      step();
      await new Promise(resolve => setTimeout(resolve, 300));
      if (iterations.length > 1) {
        const prev = iterations[iterations.length - 2].gx;
        const curr = iterations[iterations.length - 1].gx;
        if (Math.abs(curr - prev) < 1e-6) break;
      }
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

    const xMin = 0, xMax = 3;
    const yMin = 0, yMax = 3;

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

    // y = x line
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(mapX(xMin), mapY(xMin));
    ctx.lineTo(mapX(xMax), mapY(xMax));
    ctx.stroke();
    ctx.setLineDash([]);

    // y = g(x) curve
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = xMin; x <= xMax; x += 0.01) {
      const y = fixedPointG(x);
      const px = mapX(x);
      const py = mapY(y);
      if (x === xMin) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Cobweb diagram
    if (currentStep > 0) {
      ctx.strokeStyle = '#a5b4fc';
      ctx.lineWidth = 1;

      for (let i = 0; i < currentStep; i++) {
        const iter = iterations[i];
        ctx.beginPath();
        ctx.moveTo(mapX(iter.x), mapY(iter.x));
        ctx.lineTo(mapX(iter.x), mapY(iter.gx));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(mapX(iter.x), mapY(iter.gx));
        ctx.lineTo(mapX(iter.gx), mapY(iter.gx));
        ctx.stroke();

        ctx.fillStyle = '#a5b4fc';
        ctx.beginPath();
        ctx.arc(mapX(iter.x), mapY(iter.gx), 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Starting point
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(mapX(x0), mapY(x0), 5, 0, 2 * Math.PI);
    ctx.fill();

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
    <h2 class="text-xl font-semibold text-primary mb-4">Fixed-Point Iteration</h2>

    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-medium text-primary mb-2">Theory</h3>
        <p class="text-muted mb-3">
          Rearrange <KaTeX math="f(x) = 0" /> into the form <KaTeX math="x = g(x)" />. Iterate: <KaTeX math={'x_{n+1} = g(x_n)'} inline />
        </p>
        <div class="bg-background/50 p-4 mb-3">
          <KaTeX math={'x^3 - x - 2 = 0 \\implies x = \\sqrt[3]{x + 2} = g(x)'} />
        </div>
        <p class="text-muted">
          <strong>Convergence condition:</strong> <KaTeX math="|g'(x)| < 1" inline /> near the root
        </p>
      </div>

      <div>
        <h3 class="text-lg font-medium text-primary mb-3">Cobweb Diagram</h3>

        <div class="mb-4">
          <span class="text-sm text-muted mb-1 block">Starting point x&#8320;</span>
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
            style="width: 100%; height: 800px;"
            class="border border-border mb-4"
          ></canvas>
        </div>

        <div class="flex gap-2 mb-4">
          <Button onclick={step} disabled={running || iterations.length >= 20}>
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
                  <th class="text-right p-2">g(x&#8345;)</th>
                  <th class="text-right p-2">|x&#8345;&#8330;&#8321; - x&#8345;|</th>
                </tr>
              </thead>
              <tbody>
                {#each iterations as iter, idx}
                  <tr class="border-b border-border/50">
                    <td class="p-2 text-primary">{iter.n}</td>
                    <td class="p-2 text-right text-muted font-mono">{iter.x.toFixed(6)}</td>
                    <td class="p-2 text-right text-primary font-mono">{iter.gx.toFixed(6)}</td>
                    <td class="p-2 text-right text-accent font-mono">
                      {idx > 0 ? Math.abs(iter.gx - iterations[idx - 1].gx).toExponential(2) : '-'}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    </div>
  </Card>
</div>
