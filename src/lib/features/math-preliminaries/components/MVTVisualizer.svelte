<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Button } from '$lib/components/ui';

  // ─── State ────────────────────────────────────────────────────────────────
  let show = $state(true);
  let showRolleEx = $state(false);
  let showMVTEx = $state(false);

  let mvtC = $state(0);
  let mvtCanvas: HTMLCanvasElement | undefined = $state();

  const DEFAULT_EXPR = 'x^3 - 3*x + 1';
  const PRESETS = ['x^3 - 3*x + 1', 'sin(x)', 'x^2', 'cos(x) + x'];

  let rawExpr = $state(DEFAULT_EXPR);
  let parseError = $state('');

  // Interval [a, b]
  let intervalA = $state(-2);
  let intervalB = $state(2);

  // ─── Function parser ──────────────────────────────────────────────────────
  /**
   * Compile a math expression string into a JS function f(x).
   * Supports: +, -, *, /, ^, sin, cos, tan, sqrt, abs, exp, log, ln, pi, e, ()
   */
  function compileExpression(expr: string): (x: number) => number {
    let e = expr.trim();

    // Replace common constants
    e = e.replace(/\bpi\b/gi, '(Math.PI)');
    // Replace standalone 'e' not part of a word (e.g. not 'exp')
    e = e.replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, '(Math.E)');

    // Replace math functions (order matters: longer names first)
    e = e.replace(/\bsqrt\b/gi, 'Math.sqrt');
    e = e.replace(/\babs\b/gi, 'Math.abs');
    e = e.replace(/\bexp\b/gi, 'Math.exp');
    e = e.replace(/\bsin\b/gi, 'Math.sin');
    e = e.replace(/\bcos\b/gi, 'Math.cos');
    e = e.replace(/\btan\b/gi, 'Math.tan');
    e = e.replace(/\bln\b/gi, 'Math.log');
    e = e.replace(/\blog\b/gi, 'Math.log10');

    // Replace ^ with **
    e = e.replace(/\^/g, '**');

    // Validate: strip allowed tokens and check nothing suspicious remains
    const stripped = e
      .replace(/Math\.\w+/g, '')
      .replace(/[0-9x().+\-*/%\s]/g, '');
    if (stripped.length > 0) {
      throw new Error(`Invalid characters: "${stripped}"`);
    }

    // eslint-disable-next-line no-new-func
    const fn = new Function('x', `"use strict"; return (${e});`) as (x: number) => number;

    // Smoke-test
    const testVal = fn(1);
    if (typeof testVal !== 'number') {
      throw new Error('Expression did not return a number');
    }

    return fn;
  }

  // ─── Derived parsed function ──────────────────────────────────────────────
  let parsedFn: ((x: number) => number) | null = $derived.by(() => {
    try {
      return compileExpression(rawExpr);
    } catch {
      return null;
    }
  });

  // Update error message reactively
  $effect(() => {
    try {
      compileExpression(rawExpr);
      parseError = '';
    } catch (err) {
      parseError = err instanceof Error ? err.message : 'Invalid expression';
    }
  });

  // ─── Numerical derivative (central difference) ────────────────────────────
  const H = 0.0001;

  function numericalDerivative(fn: (x: number) => number, x: number): number {
    return (fn(x + H) - fn(x - H)) / (2 * H);
  }

  // ─── Active function (fallback to default on parse error) ─────────────────
  function defaultFn(x: number): number {
    return x * x * x - 3 * x + 1;
  }

  let activeFn = $derived(parsedFn ?? defaultFn);

  // ─── Keep c within [a, b] when interval changes ───────────────────────────
  $effect(() => {
    if (mvtC < intervalA) mvtC = intervalA;
    if (mvtC > intervalB) mvtC = intervalB;
  });

  // ─── Canvas rendering ──────────────────────────────────────────────────────
  $effect(() => {
    if (!mvtCanvas) return;

    // Capture all reactive dependencies explicitly
    const fn = activeFn;
    const a = intervalA;
    const b = intervalB;
    const c = mvtC;

    const ctx = mvtCanvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = mvtCanvas.getBoundingClientRect();
    mvtCanvas.width = rect.width * dpr;
    mvtCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Auto-fit viewport around [a, b]
    const margin = Math.max((b - a) * 0.3, 0.5);
    const xMin = a - margin;
    const xMax = b + margin;

    // Sample y to auto-scale
    const samples: number[] = [];
    const steps = 300;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      try {
        const y = fn(x);
        if (isFinite(y)) samples.push(y);
      } catch { /* skip */ }
    }

    let yMin: number, yMax: number;
    if (samples.length === 0) {
      yMin = -4; yMax = 4;
    } else {
      const rawYMin = Math.min(...samples);
      const rawYMax = Math.max(...samples);
      const yRange = rawYMax - rawYMin || 4;
      const yPad = yRange * 0.25;
      yMin = rawYMin - yPad;
      yMax = rawYMax + yPad;
    }

    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, width, height);

    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    const xTickStep = (xMax - xMin) / 10;
    for (let x = Math.ceil(xMin / xTickStep) * xTickStep; x <= xMax + 1e-9; x += xTickStep) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(x), 0);
      ctx.lineTo(toCanvasX(x), height);
      ctx.stroke();
    }
    const yTickStep = (yMax - yMin) / 8;
    for (let y = Math.ceil(yMin / yTickStep) * yTickStep; y <= yMax + 1e-9; y += yTickStep) {
      ctx.beginPath();
      ctx.moveTo(0, toCanvasY(y));
      ctx.lineTo(width, toCanvasY(y));
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(0));
    ctx.lineTo(width, toCanvasY(0));
    ctx.moveTo(toCanvasX(0), 0);
    ctx.lineTo(toCanvasX(0), height);
    ctx.stroke();

    // Function curve
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let penDown = false;
    for (let px = 0; px <= width; px++) {
      const x = xMin + (px / width) * (xMax - xMin);
      let y: number;
      try { y = fn(x); } catch { penDown = false; continue; }
      if (!isFinite(y)) { penDown = false; continue; }
      const py = toCanvasY(y);
      if (!penDown) { ctx.moveTo(px, py); penDown = true; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Clamp c to [a, b]
    const cClamped = Math.max(a, Math.min(b, c));

    let fA: number, fB: number;
    try { fA = fn(a); fB = fn(b); } catch { fA = NaN; fB = NaN; }

    if (isFinite(fA) && isFinite(fB)) {
      const slope = (fB - fA) / (b - a);

      // Secant line
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(toCanvasX(xMin), toCanvasY(fA + slope * (xMin - a)));
      ctx.lineTo(toCanvasX(xMax), toCanvasY(fA + slope * (xMax - a)));
      ctx.stroke();
      ctx.setLineDash([]);

      // Endpoints
      ctx.fillStyle = '#a1a1aa';
      ctx.beginPath();
      ctx.arc(toCanvasX(a), toCanvasY(fA), 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(toCanvasX(b), toCanvasY(fB), 5, 0, 2 * Math.PI);
      ctx.fill();

      // Tangent at c
      let fC: number, fPrimeC: number;
      try { fC = fn(cClamped); fPrimeC = numericalDerivative(fn, cClamped); }
      catch { fC = NaN; fPrimeC = NaN; }

      if (isFinite(fC) && isFinite(fPrimeC)) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(toCanvasX(xMin), toCanvasY(fC + fPrimeC * (xMin - cClamped)));
        ctx.lineTo(toCanvasX(xMax), toCanvasY(fC + fPrimeC * (xMax - cClamped)));
        ctx.stroke();

        // Point c
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(toCanvasX(cClamped), toCanvasY(fC), 6, 0, 2 * Math.PI);
        ctx.fill();

        // Labels
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.fillText(`Secant slope: ${slope.toFixed(3)}`, 10, 20);
        ctx.fillText(`f'(c) at c=${cClamped.toFixed(2)}: ${fPrimeC.toFixed(3)}`, 10, 40);
      }
    }
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
      <!-- Theorem statements -->
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

      <!-- Custom function input -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-2">Custom Function</h3>

        <div class="flex flex-wrap gap-2 mb-3">
          {#each PRESETS as preset}
            <Button
              variant="outline"
              size="sm"
              onclick={() => { rawExpr = preset; }}
            >
              {preset}
            </Button>
          {/each}
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs text-muted" for="fn-input">f(x) =</label>
          <input
            id="fn-input"
            type="text"
            bind:value={rawExpr}
            placeholder="e.g. x^3 - 3*x + 1"
            class="bg-bg text-primary border border-border-strong px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent"
          />
          {#if parseError}
            <p class="text-error text-xs">{parseError}</p>
          {/if}
          <p class="text-xs text-muted">
            Supported: <span class="font-mono">+  -  *  /  ^  sin  cos  tan  sqrt  abs  exp  log  ln  pi  e  ( )</span>
          </p>
        </div>
      </div>

      <!-- Interval controls -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-3">Interval [a, b]</h3>
        <div class="grid grid-cols-2 gap-4">
          <label class="block text-xs text-muted" for="slider-a">
            a = {intervalA.toFixed(2)}
            <input
              id="slider-a"
              type="range"
              min="-10"
              max="-0.1"
              step="0.1"
              bind:value={intervalA}
              class="w-full mt-1"
            />
          </label>
          <label class="block text-xs text-muted" for="slider-b">
            b = {intervalB.toFixed(2)}
            <input
              id="slider-b"
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              bind:value={intervalB}
              class="w-full mt-1"
            />
          </label>
        </div>
      </div>

      <!-- Canvas -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-3">Interactive Visualization</h3>
        <p class="text-xs text-muted mb-3">
          Adjust <KaTeX math="c" /> to find where the tangent line is parallel to the secant.
          Derivative computed numerically via central difference: <KaTeX math={"f'(x) \\approx \\frac{f(x+h)-f(x-h)}{2h}"} />.
        </p>

        <div class="w-full overflow-x-auto">
          <canvas
            bind:this={mvtCanvas}
            style="width: 100%; height: 300px;"
            class="border border-border bg-[#18181b]"
          ></canvas>
        </div>

        <div class="mt-4">
          <label class="block text-xs text-muted mb-2" for="slider-c">
            c = {mvtC.toFixed(2)}
            <input
              id="slider-c"
              type="range"
              min={intervalA}
              max={intervalB}
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

    <!-- Example 1.3: Rolle's Theorem -->
    <Card class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-primary">Example 1.3: Rolle's Theorem</h3>
        <Button variant="ghost" size="sm" onclick={() => showRolleEx = !showRolleEx}>
          {showRolleEx ? 'Hide' : 'Show'}
        </Button>
      </div>

      {#if showRolleEx}
        <div class="space-y-3 pt-1">
          <p class="text-xs text-muted">
            Let <KaTeX math={"f(x) = x^4 - 2x^2"} /> on <KaTeX math={"[-2,\\, 2]"} />.
          </p>

          <div>
            <p class="text-xs font-semibold text-accent mb-1">Step 1 — Continuity &amp; Differentiability</p>
            <p class="text-xs text-muted">
              f is a polynomial, so it is continuous on [−2, 2] and differentiable on (−2, 2). ✓
            </p>
          </div>

          <div>
            <p class="text-xs font-semibold text-accent mb-1">Step 2 — Equal Endpoint Values</p>
            <KaTeX math={"f(-2) = (-2)^4 - 2(-2)^2 = 16 - 8 = 8"} displayMode={true} />
            <KaTeX math={"f(2) = (2)^4 - 2(2)^2 = 16 - 8 = 8"} displayMode={true} />
            <p class="text-xs text-muted">So f(−2) = f(2) = 8. ✓</p>
          </div>

          <div>
            <p class="text-xs font-semibold text-accent mb-1">Step 3 — Derivative</p>
            <KaTeX math={"f'(x) = 4x^3 - 4x = 4x(x^2 - 1)"} displayMode={true} />
          </div>

          <div>
            <p class="text-xs font-semibold text-accent mb-1">Step 4 — Solve f′(ξ) = 0</p>
            <KaTeX math={"4\\xi(\\xi^2 - 1) = 0 \\implies \\xi = -1,\\; 0,\\; 1"} displayMode={true} />
          </div>

          <div>
            <p class="text-xs font-semibold text-accent mb-1">Step 5 — Verify ξ ∈ (−2, 2)</p>
            <p class="text-xs text-muted">
              All three critical points −1, 0, 1 lie in the open interval (−2, 2). ■
            </p>
          </div>
        </div>
      {/if}
    </Card>

    <!-- Example 1.4: Mean Value Theorem -->
    <Card class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-primary">Example 1.4: Mean Value Theorem</h3>
        <Button variant="ghost" size="sm" onclick={() => showMVTEx = !showMVTEx}>
          {showMVTEx ? 'Hide' : 'Show'}
        </Button>
      </div>

      {#if showMVTEx}
        <div class="space-y-3 pt-1">
          <p class="text-xs text-muted">
            Let <KaTeX math={"f(x) = x^3 + 2x^2 - x"} /> on <KaTeX math={"[-1,\\, 2]"} />.
          </p>

          <div>
            <p class="text-xs font-semibold text-accent mb-1">Step 1 — Continuity &amp; Differentiability</p>
            <p class="text-xs text-muted">
              f is a polynomial, so it is continuous on [−1, 2] and differentiable on (−1, 2). ✓
            </p>
          </div>

          <div>
            <p class="text-xs font-semibold text-accent mb-1">Step 2 — Endpoint Values</p>
            <KaTeX math={"f(-1) = (-1)^3 + 2(-1)^2 - (-1) = -1 + 2 + 1 = 2"} displayMode={true} />
            <KaTeX math={"f(2) = (2)^3 + 2(2)^2 - (2) = 8 + 8 - 2 = 14"} displayMode={true} />
          </div>

          <div>
            <p class="text-xs font-semibold text-accent mb-1">Step 3 — Secant Slope</p>
            <KaTeX math={"\\frac{f(2) - f(-1)}{2 - (-1)} = \\frac{14 - 2}{3} = \\frac{12}{3} = 4"} displayMode={true} />
          </div>

          <div>
            <p class="text-xs font-semibold text-accent mb-1">Step 4 — Derivative</p>
            <KaTeX math={"f'(x) = 3x^2 + 4x - 1"} displayMode={true} />
          </div>

          <div>
            <p class="text-xs font-semibold text-accent mb-1">Step 5 — Solve f′(ξ) = 4</p>
            <KaTeX math={"3\\xi^2 + 4\\xi - 1 = 4 \\implies 3\\xi^2 + 4\\xi - 5 = 0"} displayMode={true} />
          </div>

          <div>
            <p class="text-xs font-semibold text-accent mb-1">Step 6 — Quadratic Formula</p>
            <KaTeX math={"\\xi = \\frac{-4 \\pm \\sqrt{16 + 60}}{6} = \\frac{-4 \\pm \\sqrt{76}}{6}"} displayMode={true} />
            <p class="text-xs text-muted">
              Only <KaTeX math={"\\xi = \\frac{-4 + \\sqrt{76}}{6} \\approx 0.7863"} /> lies in (−1, 2). ■
            </p>
          </div>
        </div>
      {/if}
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
