<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Button } from '$lib/components/ui';

  let show = $state(true);

  let taylorDegree = $state(5);
  let taylorCanvas: HTMLCanvasElement | undefined = $state();

  function factorial(n: number): number {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  }

  function taylorSin(x: number, n: number): number {
    let sum = 0;
    for (let k = 0; k <= (n - 1) / 2; k++) {
      const term = Math.pow(-1, k) * Math.pow(x, 2 * k + 1) / factorial(2 * k + 1);
      sum += term;
    }
    return sum;
  }

  $effect(() => {
    if (!taylorCanvas) return;
    const ctx = taylorCanvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = taylorCanvas.getBoundingClientRect();
    taylorCanvas.width = rect.width * dpr;
    taylorCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const xMin = -8;
    const xMax = 8;
    const yMin = -1.5;
    const yMax = 1.5;

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

    // Draw exact sin(x)
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px <= width; px++) {
      const x = xMin + (px / width) * (xMax - xMin);
      const y = Math.sin(x);
      const py = toCanvasY(y);
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Draw Taylor approximation
    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    for (let px = 0; px <= width; px++) {
      const x = xMin + (px / width) * (xMax - xMin);
      const y = taylorSin(x, taylorDegree);
      const py = toCanvasY(Math.max(yMin, Math.min(yMax, y)));
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Calculate max error in visible range
    let maxError = 0;
    for (let x = -2 * Math.PI; x <= 2 * Math.PI; x += 0.1) {
      const error = Math.abs(Math.sin(x) - taylorSin(x, taylorDegree));
      if (error > maxError) maxError = error;
    }

    // Labels
    ctx.fillStyle = '#818cf8';
    ctx.font = '12px monospace';
    ctx.fillText('sin(x)', 10, 20);
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText(`P${taylorDegree}(x)`, 10, 40);
    ctx.fillStyle = '#fff';
    ctx.fillText(`Max error: ${maxError.toFixed(6)}`, 10, 60);
  });
</script>

<section id="taylor" class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold text-accent">4. Taylor's Theorem</h2>
    <Button variant="ghost" size="sm" onclick={() => show = !show}>
      {show ? 'Hide' : 'Show'}
    </Button>
  </div>

  {#if show}
    <Card class="space-y-4">
      <div>
        <h3 class="text-sm font-semibold text-primary mb-2">Theorem Statement</h3>
        <KaTeX
          math={'f(x) = \\sum_{k=0}^{n} \\frac{f^{(k)}(a)}{k!}(x-a)^k + R_n(x)'}
          displayMode={true}
        />
        <p class="text-sm text-muted mt-2">
          where R_n(x) is the remainder term. For sin(x) centered at a = 0:
        </p>
        <KaTeX
          math={'\\sin(x) = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\frac{x^7}{7!} + \\cdots'}
          displayMode={true}
        />
      </div>

      <div>
        <h3 class="text-sm font-semibold text-primary mb-3">Interactive Visualization</h3>
        <p class="text-xs text-muted mb-3">
          Approximating sin(x) with Taylor polynomials. Increase degree to improve accuracy.
        </p>

        <div class="w-full overflow-x-auto">
          <canvas
            bind:this={taylorCanvas}
            style="width: 100%; height: 300px;"
            class="border border-border bg-[#18181b]"
          ></canvas>
        </div>

        <div class="mt-4">
          <label class="block text-xs text-muted mb-2">
            Polynomial degree: {taylorDegree} (terms up to x^{taylorDegree})
          <input
            type="range"
            min="1"
            max="11"
            step="2"
            bind:value={taylorDegree}
            class="w-full"
          />
          </label>
        </div>

        <div class="mt-3 text-xs space-y-1">
          <div class="flex items-center gap-2">
            <div class="w-3 h-0.5 bg-[#818cf8]"></div>
            <span class="text-muted">Exact sin(x)</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-0.5 bg-[#a1a1aa]" style="width: 20px; border-top: 2px dashed;"></div>
            <span class="text-muted">Taylor approximation P_{taylorDegree}(x)</span>
          </div>
        </div>

        <p class="text-xs text-muted mt-3">
          Notice how higher-degree polynomials match sin(x) over a wider range before diverging.
        </p>
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
