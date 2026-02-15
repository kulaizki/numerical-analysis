<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Button } from '$lib/components/ui';

  let show = $state(true);

  let mvtC = $state(0);
  let mvtCanvas: HTMLCanvasElement | undefined = $state();

  function mvtFunction(x: number): number {
    return x * x * x - 3 * x + 1;
  }

  function mvtDerivative(x: number): number {
    return 3 * x * x - 3;
  }

  $effect(() => {
    if (!mvtCanvas) return;
    const ctx = mvtCanvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = mvtCanvas.getBoundingClientRect();
    mvtCanvas.width = rect.width * dpr;
    mvtCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const xMin = -2.5;
    const xMax = 2.5;
    const yMin = -4;
    const yMax = 4;

    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, width, height);

    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Axes
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
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(x), 0);
      ctx.lineTo(toCanvasX(x), height);
      ctx.stroke();
    }
    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
      ctx.beginPath();
      ctx.moveTo(0, toCanvasY(y));
      ctx.lineTo(width, toCanvasY(y));
      ctx.stroke();
    }

    // Draw function
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px <= width; px++) {
      const x = xMin + (px / width) * (xMax - xMin);
      const y = mvtFunction(x);
      const py = toCanvasY(y);
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Endpoints for MVT demonstration
    const a = -2;
    const b = 2;
    const fA = mvtFunction(a);
    const fB = mvtFunction(b);
    const slope = (fB - fA) / (b - a);

    // Draw secant line
    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    const secY1 = fA + slope * (xMin - a);
    const secY2 = fA + slope * (xMax - a);
    ctx.moveTo(toCanvasX(xMin), toCanvasY(secY1));
    ctx.lineTo(toCanvasX(xMax), toCanvasY(secY2));
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw endpoints
    ctx.fillStyle = '#a1a1aa';
    ctx.beginPath();
    ctx.arc(toCanvasX(a), toCanvasY(fA), 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(toCanvasX(b), toCanvasY(fB), 5, 0, 2 * Math.PI);
    ctx.fill();

    // Draw tangent line at c
    const fC = mvtFunction(mvtC);
    const fPrimeC = mvtDerivative(mvtC);

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const tanY1 = fC + fPrimeC * (xMin - mvtC);
    const tanY2 = fC + fPrimeC * (xMax - mvtC);
    ctx.moveTo(toCanvasX(xMin), toCanvasY(tanY1));
    ctx.lineTo(toCanvasX(xMax), toCanvasY(tanY2));
    ctx.stroke();

    // Draw point c
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(toCanvasX(mvtC), toCanvasY(fC), 6, 0, 2 * Math.PI);
    ctx.fill();

    // Labels
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.fillText(`Secant slope: ${slope.toFixed(2)}`, 10, 20);
    ctx.fillText(`f'(c) at c=${mvtC.toFixed(2)}: ${fPrimeC.toFixed(2)}`, 10, 40);
  });
</script>

<section id="mvt" class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold text-accent">3. Rolle's Theorem & Mean Value Theorem</h2>
    <Button variant="ghost" size="sm" onclick={() => show = !show}>
      {show ? 'Hide' : 'Show'}
    </Button>
  </div>

  {#if show}
    <Card class="space-y-4">
      <div>
        <h3 class="text-sm font-semibold text-primary mb-2">Theorem Statements</h3>

        <div class="mb-4">
          <p class="text-xs font-semibold text-accent mb-1">Rolle's Theorem</p>
          <KaTeX
            math={'\\text{If } f(a) = f(b), \\, f \\text{ is continuous on } [a,b] \\text{ and differentiable on } (a,b), \\\\ \\text{then } \\exists \\, c \\in (a,b) \\text{ such that } f\'(c) = 0'}
            displayMode={true}
          />
        </div>

        <div>
          <p class="text-xs font-semibold text-accent mb-1">Mean Value Theorem</p>
          <KaTeX
            math={'\\text{If } f \\text{ is continuous on } [a,b] \\text{ and differentiable on } (a,b), \\\\ \\text{then } \\exists \\, c \\in (a,b) \\text{ such that } f\'(c) = \\frac{f(b) - f(a)}{b - a}'}
            displayMode={true}
          />
        </div>

        <p class="text-sm text-muted mt-2">
          MVT states there exists a point where the tangent is parallel to the secant line through endpoints.
        </p>
      </div>

      <div>
        <h3 class="text-sm font-semibold text-primary mb-3">Interactive Visualization</h3>
        <p class="text-xs text-muted mb-3">
          Function: <KaTeX math="f(x) = x^3 - 3x + 1" /> on <KaTeX math="[-2, 2]" />. Adjust c to find where the tangent is parallel to the secant.
        </p>

        <div class="w-full overflow-x-auto">
          <canvas
            bind:this={mvtCanvas}
            style="width: 100%; height: 300px;"
            class="border border-border bg-[#18181b]"
          ></canvas>
        </div>

        <div class="mt-4">
          <label class="block text-xs text-muted mb-2">c = {mvtC.toFixed(2)}
          <input
            type="range"
            min="-2"
            max="2"
            step="0.05"
            bind:value={mvtC}
            class="w-full"
          />
          </label>
        </div>

        <div class="mt-3 text-xs space-y-1">
          <div class="flex items-center gap-2">
            <div class="w-3 h-0.5 bg-[#a1a1aa]" style="width: 20px; border-top: 2px dashed;"></div>
            <span class="text-muted">Secant line through endpoints</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-0.5 bg-[#10b981]"></div>
            <span class="text-muted">Tangent line at c</span>
          </div>
        </div>
      </div>
    </Card>
  {/if}
</section>

<style>
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    background: #334155;
    outline: none;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #818cf8;
    cursor: pointer;
  }

  input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #818cf8;
    cursor: pointer;
    border: none;
  }
</style>
