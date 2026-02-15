<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Button } from '$lib/components/ui';

  let show = $state(true);

  let evtCanvas: HTMLCanvasElement | undefined = $state();

  function evtFunction(x: number): number {
    return -x * x + 4 * x - 1;
  }

  $effect(() => {
    if (!evtCanvas) return;
    const ctx = evtCanvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = evtCanvas.getBoundingClientRect();
    evtCanvas.width = rect.width * dpr;
    evtCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const xMin = -0.5;
    const xMax = 4.5;
    const yMin = -2;
    const yMax = 4;

    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, width, height);

    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Draw axes
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(0));
    ctx.lineTo(width, toCanvasY(0));
    ctx.moveTo(toCanvasX(0), 0);
    ctx.lineTo(toCanvasX(0), height);
    ctx.stroke();

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= 4; x++) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(x), 0);
      ctx.lineTo(toCanvasX(x), height);
      ctx.stroke();
    }
    for (let y = -2; y <= 4; y++) {
      ctx.beginPath();
      ctx.moveTo(0, toCanvasY(y));
      ctx.lineTo(width, toCanvasY(y));
      ctx.stroke();
    }

    // Draw function on [0, 4]
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px <= width; px++) {
      const x = xMin + (px / width) * (xMax - xMin);
      if (x >= 0 && x <= 4) {
        const y = evtFunction(x);
        const py = toCanvasY(y);
        if (px === 0 || x === 0) ctx.moveTo(toCanvasX(x), py);
        else ctx.lineTo(toCanvasX(x), py);
      }
    }
    ctx.stroke();

    // Find min and max on [0, 4]
    let minX = 0, minY = evtFunction(0);
    let maxX = 0, maxY = evtFunction(0);

    for (let x = 0; x <= 4; x += 0.01) {
      const y = evtFunction(x);
      if (y < minY) { minX = x; minY = y; }
      if (y > maxY) { maxX = x; maxY = y; }
    }

    // Draw min and max points
    ctx.fillStyle = '#818cf8';
    ctx.beginPath();
    ctx.arc(toCanvasX(maxX), toCanvasY(maxY), 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(toCanvasX(minX), toCanvasY(minY), 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#818cf8';
    ctx.font = '12px monospace';
    ctx.fillText(`Max: (${maxX.toFixed(1)}, ${maxY.toFixed(2)})`, toCanvasX(maxX) + 10, toCanvasY(maxY) - 10);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`Min: (${minX.toFixed(1)}, ${minY.toFixed(2)})`, toCanvasX(minX) + 10, toCanvasY(minY) + 20);
  });
</script>

<section id="evt" class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold text-accent">2. Extreme Value Theorem</h2>
    <Button variant="ghost" size="sm" onclick={() => show = !show}>
      {show ? 'Hide' : 'Show'}
    </Button>
  </div>

  {#if show}
    <Card class="space-y-4">
      <div>
        <h3 class="text-sm font-semibold text-primary mb-2">Theorem Statement</h3>
        <KaTeX
          math={'\\text{If } f \\text{ is continuous on } [a,b], \\text{ then } f \\text{ attains both} \\\\ \\text{an absolute maximum and an absolute minimum on } [a,b]'}
          displayMode={true}
        />
        <p class="text-sm text-muted mt-2">
          This guarantees that continuous functions on closed intervals have well-defined extrema.
        </p>
      </div>

      <div>
        <h3 class="text-sm font-semibold text-primary mb-3">Interactive Visualization</h3>
        <p class="text-xs text-muted mb-3">
          Function: <KaTeX math="f(x) = -x^2 + 4x - 1" /> on <KaTeX math="[0, 4]" />. The maximum and minimum are highlighted.
        </p>

        <div class="w-full overflow-x-auto">
          <canvas
            bind:this={evtCanvas}
            style="width: 100%; height: 300px;"
            class="border border-border bg-[#18181b]"
          ></canvas>
        </div>

        <div class="mt-3 text-xs space-y-1">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-[#818cf8]"></div>
            <span class="text-muted">Maximum point</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-[#f59e0b]"></div>
            <span class="text-muted">Minimum point</span>
          </div>
        </div>
      </div>
    </Card>
  {/if}
</section>
