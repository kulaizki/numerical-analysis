<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Button } from '$lib/components/ui';
  import { onMount } from 'svelte';

  let show = $state(true);

  // Function input state
  let funcExpr = $state('sqrt(x)');
  let xInput = $state('100');
  let epsilon = $state(0.01);

  // Canvas ref
  let canvas: HTMLCanvasElement | undefined = $state();

  const presets = ['sqrt(x)', '1/(x - 1)', 'tan(x)', 'x^10', 'log(x)'];

  /** Evaluate expression supporting: +,-,*,/,^,sin,cos,tan,sqrt,abs,exp,log,ln,pi,e */
  function evalAt(expr: string, x: number): number {
    try {
      const sanitized = expr
        .replace(/\^/g, '**')
        .replace(/\bln\b/g, 'log')
        .replace(/\bpi\b/g, String(Math.PI))
        .replace(/\be\b/g, String(Math.E));
      // eslint-disable-next-line no-new-func
      const fn = new Function('x', `with(Math) { return ${sanitized}; }`);
      const result = fn(x);
      return typeof result === 'number' ? result : NaN;
    } catch {
      return NaN;
    }
  }

  /** Central difference derivative with h = 0.0001 */
  function derivative(expr: string, x: number): number {
    const h = 0.0001;
    return (evalAt(expr, x + h) - evalAt(expr, x - h)) / (2 * h);
  }

  // Derived values
  let x = $derived(parseFloat(xInput));
  let fx = $derived(evalAt(funcExpr, x));
  let fpx = $derived(derivative(funcExpr, x));
  let kappa = $derived(
    isNaN(fx) || isNaN(fpx) || fx === 0 ? NaN : Math.abs((x * fpx) / fx)
  );

  let classification = $derived(
    isNaN(kappa)
      ? { label: 'Invalid', color: '#a1a1aa' }
      : kappa < 10
        ? { label: 'Well-conditioned', color: '#10b981' }
        : kappa < 100
          ? { label: 'Moderate', color: '#f59e0b' }
          : { label: 'Ill-conditioned', color: '#f87171' }
  );

  function drawCanvas() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const pad = { top: 30, right: 20, bottom: 40, left: 55 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    // Background
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, W, H);

    if (isNaN(x) || !isFinite(x)) {
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '14px Manrope, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Invalid input', W / 2, H / 2);
      return;
    }

    // Build sample domain: neighborhood around x
    const halfRange = Math.max(Math.abs(x) * 0.5, 2);
    const xMin = x - halfRange;
    const xMax = x + halfRange;
    const steps = 300;

    // Sample function values
    const pts: { xv: number; yv: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      const xv = xMin + (i / steps) * (xMax - xMin);
      const yv = evalAt(funcExpr, xv);
      if (isFinite(yv)) pts.push({ xv, yv });
    }

    if (pts.length < 2) {
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '14px Manrope, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Cannot plot in this range', W / 2, H / 2);
      return;
    }

    const yVals = pts.map((p) => p.yv);
    let yMin = Math.min(...yVals);
    let yMax = Math.max(...yVals);
    const yPad = (yMax - yMin) * 0.15 || 1;
    yMin -= yPad;
    yMax += yPad;

    const toCanvasX = (xv: number) => pad.left + ((xv - xMin) / (xMax - xMin)) * plotW;
    const toCanvasY = (yv: number) => pad.top + ((yMax - yv) / (yMax - yMin)) * plotH;

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    const xTicks = 5;
    const yTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
      const xv = xMin + (i / xTicks) * (xMax - xMin);
      const cx = toCanvasX(xv);
      ctx.beginPath();
      ctx.moveTo(cx, pad.top);
      ctx.lineTo(cx, pad.top + plotH);
      ctx.stroke();
    }
    for (let i = 0; i <= yTicks; i++) {
      const yv = yMin + (i / yTicks) * (yMax - yMin);
      const cy = toCanvasY(yv);
      ctx.beginPath();
      ctx.moveTo(pad.left, cy);
      ctx.lineTo(pad.left + plotW, cy);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    if (yMin < 0 && yMax > 0) {
      const cy = toCanvasY(0);
      ctx.beginPath();
      ctx.moveTo(pad.left, cy);
      ctx.lineTo(pad.left + plotW, cy);
      ctx.stroke();
    }
    if (xMin < 0 && xMax > 0) {
      const cx = toCanvasX(0);
      ctx.beginPath();
      ctx.moveTo(cx, pad.top);
      ctx.lineTo(cx, pad.top + plotH);
      ctx.stroke();
    }

    // Axis tick labels
    ctx.fillStyle = '#71717a';
    ctx.font = '10px Manrope, monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i <= xTicks; i++) {
      const xv = xMin + (i / xTicks) * (xMax - xMin);
      ctx.fillText(xv.toFixed(1), toCanvasX(xv), pad.top + plotH + 18);
    }
    ctx.textAlign = 'right';
    for (let i = 0; i <= yTicks; i++) {
      const yv = yMin + (i / yTicks) * (yMax - yMin);
      ctx.fillText(yv.toPrecision(3), pad.left - 6, toCanvasY(yv) + 4);
    }

    // Function curve
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let firstPt = true;
    for (const { xv, yv } of pts) {
      const cx = toCanvasX(xv);
      const cy = toCanvasY(yv);
      if (firstPt) {
        ctx.moveTo(cx, cy);
        firstPt = false;
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.stroke();

    // Evaluation point dot
    const cx0 = toCanvasX(x);
    const cy0 = toCanvasY(fx);
    const condColor = classification.color;

    // Vertical dashed line at x
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx0, pad.top);
    ctx.lineTo(cx0, pad.top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    if (!isNaN(fx) && isFinite(fx)) {
      // Dot at f(x)
      ctx.fillStyle = condColor;
      ctx.beginPath();
      ctx.arc(cx0, cy0, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Input perturbation bracket on a horizontal line near the bottom
      const xLeft = x - epsilon;
      const xRight = x + epsilon;
      const cxLeft = toCanvasX(xLeft);
      const cxRight = toCanvasX(xRight);
      const axisY = Math.min(pad.top + plotH - 8, Math.max(pad.top + 8, toCanvasY(yMin + yPad * 0.5)));

      ctx.strokeStyle = condColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cxLeft, axisY);
      ctx.lineTo(cxRight, axisY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cxLeft, axisY - 5);
      ctx.lineTo(cxLeft, axisY + 5);
      ctx.moveTo(cxRight, axisY - 5);
      ctx.lineTo(cxRight, axisY + 5);
      ctx.stroke();

      // Output perturbation bracket on left edge
      const kappaVal = isNaN(kappa) ? 0 : kappa;
      const outputEps = kappaVal * epsilon;
      const fyLow = fx - outputEps;
      const fyHigh = fx + outputEps;
      const cyLow = Math.min(pad.top + plotH - 2, toCanvasY(fyLow));
      const cyHigh = Math.max(pad.top + 2, toCanvasY(fyHigh));
      const leftEdge = pad.left + 8;

      ctx.strokeStyle = condColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftEdge, cyHigh);
      ctx.lineTo(leftEdge, cyLow);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(leftEdge - 5, cyHigh);
      ctx.lineTo(leftEdge + 5, cyHigh);
      ctx.moveTo(leftEdge - 5, cyLow);
      ctx.lineTo(leftEdge + 5, cyLow);
      ctx.stroke();

      // Dashed connector from f(x) point to output bracket midpoint
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx0, cy0);
      ctx.lineTo(leftEdge, (cyHigh + cyLow) / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Labels
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '11px Manrope, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ε', (cxLeft + cxRight) / 2, axisY - 10);

      ctx.textAlign = 'left';
      ctx.fillStyle = condColor;
      ctx.fillText('κ·ε', leftEdge + 8, (cyHigh + cyLow) / 2 + 4);
    }

    // Function label
    ctx.fillStyle = '#818cf8';
    ctx.font = '11px Manrope, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`f(x) = ${funcExpr}`, pad.left + 4, pad.top - 10);
  }

  $effect(() => {
    funcExpr;
    xInput;
    epsilon;
    kappa;
    drawCanvas();
  });

  onMount(() => {
    drawCanvas();
  });
</script>

<section id="condition-number" class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold text-accent">4. Condition Number</h2>
    <Button variant="ghost" size="sm" onclick={() => (show = !show)}>
      {show ? 'Hide' : 'Show'}
    </Button>
  </div>

  {#if show}
    <Card class="space-y-6">
      <!-- Theory -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-3">Theory</h3>
        <div class="space-y-3 text-sm text-muted">
          <div>
            <p class="mb-1">Condition number of evaluating <KaTeX math="f" /> at <KaTeX math="x" />:</p>
            <KaTeX math={'\\kappa(x) = \\left|\\frac{x \\cdot f\'(x)}{f(x)}\\right|'} displayMode={true} />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-3 bg-bg-3 border border-border">
              <p class="font-medium" style="color: #10b981;">Well-conditioned: <KaTeX math="\kappa \approx 1" /></p>
              <p class="text-xs mt-1">Small input changes produce small output changes.</p>
            </div>
            <div class="p-3 bg-bg-3 border border-border">
              <p class="font-medium" style="color: #f87171;">Ill-conditioned: <KaTeX math="\kappa \gg 1" /></p>
              <p class="text-xs mt-1">Small input changes produce large output changes.</p>
            </div>
          </div>
          <div>
            <p class="mb-1">Relative error amplification:</p>
            <KaTeX
              math={'\\text{rel\\_err}(f(x)) \\approx \\kappa(x) \\cdot \\text{rel\\_err}(x)'}
              displayMode={true}
            />
          </div>
        </div>
      </div>

      <!-- Controls + Results + Canvas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <!-- Function input -->
          <div>
            <label class="block text-sm text-muted mb-1.5" for="cn-func">
              Function <KaTeX math="f(x)" />
            </label>
            <input
              id="cn-func"
              type="text"
              bind:value={funcExpr}
              placeholder="e.g. sqrt(x)"
              class="w-full bg-bg text-primary border border-border-strong px-3 py-2 text-sm font-mono
                placeholder:text-tertiary focus:outline-none focus:border-accent transition-colors duration-150"
            />
            <div class="flex flex-wrap gap-2 mt-2">
              {#each presets as preset}
                <button
                  class="px-2 py-1 text-xs border border-border text-muted hover:border-accent hover:text-accent
                    transition-colors font-mono bg-bg-3 cursor-pointer"
                  onclick={() => (funcExpr = preset)}
                >
                  {preset}
                </button>
              {/each}
            </div>
          </div>

          <!-- x input -->
          <div>
            <label class="block text-sm text-muted mb-1.5" for="cn-x">
              Evaluation point <KaTeX math="x" />
            </label>
            <input
              id="cn-x"
              type="text"
              bind:value={xInput}
              placeholder="e.g. 100"
              class="w-full bg-bg text-primary border border-border-strong px-3 py-2 text-sm font-mono
                placeholder:text-tertiary focus:outline-none focus:border-accent transition-colors duration-150"
            />
          </div>

          <!-- Epsilon slider -->
          <div>
            <label class="block text-sm text-muted mb-2" for="cn-eps">
              Perturbation <KaTeX math="\varepsilon" /> = {epsilon.toFixed(4)}
            </label>
            <input
              id="cn-eps"
              type="range"
              bind:value={epsilon}
              min="0.0001"
              max="0.5"
              step="0.0001"
              class="w-full"
            />
          </div>

          <!-- Results panel -->
          <div class="space-y-2 p-4 bg-bg-3 border border-border text-sm">
            <div class="flex justify-between items-center">
              <span class="text-muted"><KaTeX math="f(x)" /> =</span>
              <span class="font-mono text-primary">
                {isNaN(fx) ? 'undefined' : fx.toPrecision(7)}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted"><KaTeX math="f'(x)" /> (central diff) =</span>
              <span class="font-mono text-primary">
                {isNaN(fpx) ? 'undefined' : fpx.toPrecision(7)}
              </span>
            </div>
            <div class="flex justify-between items-center border-t border-border pt-2 mt-2">
              <span class="text-muted font-medium"><KaTeX math="\kappa(x)" /> =</span>
              <span class="font-mono font-semibold text-base" style="color: {classification.color}">
                {isNaN(kappa) ? 'undefined' : kappa.toPrecision(5)}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted">Classification:</span>
              <span class="font-semibold text-sm" style="color: {classification.color}">
                {classification.label}
              </span>
            </div>
            {#if !isNaN(kappa) && !isNaN(fx)}
              <div class="flex justify-between items-center text-xs border-t border-border pt-2 mt-2">
                <span class="text-muted">Output perturbation <KaTeX math="\kappa \cdot \varepsilon" /> =</span>
                <span class="font-mono" style="color: {classification.color}">
                  {(kappa * epsilon).toPrecision(4)}
                </span>
              </div>
            {/if}
          </div>
        </div>

        <!-- Canvas visualization -->
        <div class="space-y-2">
          <p class="text-xs text-muted">
            Visualization shows <KaTeX math="f(x)" /> near the evaluation point. Brackets illustrate how
            input perturbation <KaTeX math="\varepsilon" /> maps to output perturbation
            <KaTeX math="\kappa \cdot \varepsilon" />.
          </p>
          <canvas
            bind:this={canvas}
            style="width: 100%; height: 340px;"
            class="border border-border bg-[#18181b]"
          ></canvas>
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <div class="flex items-center gap-1.5">
              <div class="w-3 h-0.5 bg-[#818cf8]"></div>
              <span>f(x)</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-3 h-0.5" style="background: {classification.color}"></div>
              <span>Perturbation brackets</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-2 h-2 rounded-full" style="background: {classification.color}"></div>
              <span>f(x₀)</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  {/if}
</section>

<style>
  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    background: #3f3f46;
    outline: none;
    border-radius: 0;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #818cf8;
    cursor: pointer;
    border-radius: 0;
  }

  input[type='range']::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #818cf8;
    cursor: pointer;
    border-radius: 0;
    border: none;
  }
</style>
