<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Button } from '$lib/components/ui';

  let show = $state(true);
  let showExample = $state(false);

  // --- Function parser ---
  function parseFunction(expr: string): (x: number) => number {
    try {
      const sanitized = expr
        .replace(/\^/g, '**')
        .replace(/\bpi\b/g, String(Math.PI))
        .replace(/\be\b/g, String(Math.E))
        .replace(/\bsin\b/g, 'Math.sin')
        .replace(/\bcos\b/g, 'Math.cos')
        .replace(/\btan\b/g, 'Math.tan')
        .replace(/\bsqrt\b/g, 'Math.sqrt')
        .replace(/\bexp\b/g, 'Math.exp')
        .replace(/\blog\b/g, 'Math.log');
      // eslint-disable-next-line no-new-func
      const fn = new Function('x', `"use strict"; return (${sanitized});`) as (x: number) => number;
      const test = fn(1);
      if (typeof test !== 'number' || !isFinite(test)) return () => NaN;
      return fn;
    } catch {
      return () => NaN;
    }
  }

  // --- Simpson's rule numerical integration (n=1000) ---
  function simpsonIntegral(fn: (x: number) => number, a: number, b: number, n = 1000): number {
    if (n % 2 !== 0) n += 1;
    const h = (b - a) / n;
    let sum = fn(a) + fn(b);
    for (let i = 1; i < n; i++) {
      const x = a + i * h;
      sum += (i % 2 === 0 ? 2 : 4) * fn(x);
    }
    return (h / 3) * sum;
  }

  // --- State ---
  type Preset = { label: string; expr: string; a: number; b: number };
  const presets: Preset[] = [
    { label: 'x\u00b2 + 1', expr: 'x^2 + 1', a: 0, b: 2 },
    { label: 'sin(x)', expr: 'sin(x)', a: 0, b: Math.PI },
    { label: 'e^x', expr: 'exp(x)', a: 0, b: 1 },
    { label: '\u221ax', expr: 'sqrt(x)', a: 0, b: 4 },
    { label: 'x\u00b3 - x', expr: 'x^3 - x', a: -1, b: 2 }
  ];

  let funcExpr = $state('x^2 + 1');
  let funcInputValue = $state('x^2 + 1');
  let parseError = $state('');
  let intervalA = $state(0);
  let intervalB = $state(2);
  let cValue = $state(1);
  let canvas: HTMLCanvasElement | undefined = $state();

  let parsedFn = $derived.by(() => {
    const fn = parseFunction(funcExpr);
    const test = fn(1);
    if (isNaN(test)) return null;
    return fn;
  });

  let integralValue = $derived.by(() => {
    if (!parsedFn) return NaN;
    if (intervalA >= intervalB) return NaN;
    return simpsonIntegral(parsedFn, intervalA, intervalB);
  });

  let fAtC = $derived.by(() => {
    if (!parsedFn) return NaN;
    return parsedFn(cValue);
  });

  let rectangleArea = $derived.by(() => {
    return fAtC * (intervalB - intervalA);
  });

  let difference = $derived.by(() => {
    if (isNaN(integralValue) || isNaN(rectangleArea)) return NaN;
    return Math.abs(integralValue - rectangleArea);
  });

  let isMatching = $derived.by(() => {
    return !isNaN(difference) && difference < 0.01;
  });

  $effect(() => {
    if (cValue < intervalA) cValue = intervalA;
    if (cValue > intervalB) cValue = intervalB;
  });

  function applyPreset(preset: Preset) {
    funcExpr = preset.expr;
    funcInputValue = preset.expr;
    parseError = '';
    intervalA = preset.a;
    intervalB = preset.b;
    cValue = (preset.a + preset.b) / 2;
  }

  function handleFuncInput() {
    const fn = parseFunction(funcInputValue);
    const test = fn(1);
    if (isNaN(test)) {
      parseError = 'Invalid expression. Check syntax.';
    } else {
      parseError = '';
      funcExpr = funcInputValue;
      cValue = (intervalA + intervalB) / 2;
    }
  }

  // --- Canvas drawing ---
  $effect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const _fn = parsedFn;
    const _a = intervalA;
    const _b = intervalB;
    const _c = cValue;
    const _fC = fAtC;
    const _matching = isMatching;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const pad = (_b - _a) * 0.3 || 0.5;
    const xMin = _a - pad;
    const xMax = _b + pad;

    let yLow = 0;
    let yHigh = 0;
    if (_fn) {
      for (let i = 0; i <= 200; i++) {
        const x = xMin + (i / 200) * (xMax - xMin);
        const y = _fn(x);
        if (isFinite(y)) {
          if (y < yLow) yLow = y;
          if (y > yHigh) yHigh = y;
        }
      }
    }
    const yRange = yHigh - yLow || 2;
    const yPad = yRange * 0.25;
    const yMin = yLow - yPad;
    const yMax = yHigh + yPad;

    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, width, height);

    const toX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    const xSpan = xMax - xMin;
    const xStep = xSpan > 10 ? 2 : xSpan > 4 ? 1 : 0.5;
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax + 0.001; x += xStep) {
      ctx.beginPath();
      ctx.moveTo(toX(x), 0);
      ctx.lineTo(toX(x), height);
      ctx.stroke();
    }
    const ySpan = yMax - yMin;
    const yStep = ySpan > 10 ? 2 : ySpan > 4 ? 1 : 0.5;
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax + 0.001; y += yStep) {
      ctx.beginPath();
      ctx.moveTo(0, toY(y));
      ctx.lineTo(width, toY(y));
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, toY(0));
    ctx.lineTo(width, toY(0));
    ctx.moveTo(toX(0), 0);
    ctx.lineTo(toX(0), height);
    ctx.stroke();

    if (!_fn) {
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '13px monospace';
      ctx.fillText('Invalid function', width / 2 - 55, height / 2);
      return;
    }

    // Shaded integral area
    ctx.fillStyle = _matching ? 'rgba(16,185,129,0.20)' : 'rgba(129,140,248,0.20)';
    ctx.beginPath();
    const steps = 400;
    ctx.moveTo(toX(_a), toY(0));
    for (let i = 0; i <= steps; i++) {
      const x = _a + (i / steps) * (_b - _a);
      const y = _fn(x);
      ctx.lineTo(toX(x), toY(isFinite(y) ? y : 0));
    }
    ctx.lineTo(toX(_b), toY(0));
    ctx.closePath();
    ctx.fill();

    // Rectangle
    const fC_safe = isFinite(_fC) ? _fC : 0;
    const rectBorder = _matching ? '#10b981' : '#fbbf24';
    ctx.fillStyle = _matching ? 'rgba(16,185,129,0.30)' : 'rgba(251,191,36,0.20)';
    ctx.strokeStyle = rectBorder;
    ctx.lineWidth = _matching ? 2.5 : 1.5;
    ctx.setLineDash([6, 4]);
    const rLeft = toX(_a);
    const rRight = toX(_b);
    const rTop = fC_safe >= 0 ? toY(fC_safe) : toY(0);
    const rBottom = fC_safe >= 0 ? toY(0) : toY(fC_safe);
    ctx.fillRect(rLeft, rTop, rRight - rLeft, rBottom - rTop);
    ctx.strokeRect(rLeft, rTop, rRight - rLeft, rBottom - rTop);
    ctx.setLineDash([]);

    // Horizontal line at f(c)
    ctx.strokeStyle = rectBorder;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(toX(xMin), toY(fC_safe));
    ctx.lineTo(toX(xMax), toY(fC_safe));
    ctx.stroke();
    ctx.setLineDash([]);

    // Function curve
    ctx.strokeStyle = _matching ? '#10b981' : '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    for (let px = 0; px <= width; px++) {
      const x = xMin + (px / width) * (xMax - xMin);
      const y = _fn(x);
      if (!isFinite(y)) { started = false; continue; }
      const py = toY(y);
      if (!started) { ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Vertical boundary lines at a and b
    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(toX(_a), 0);
    ctx.lineTo(toX(_a), height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toX(_b), 0);
    ctx.lineTo(toX(_b), height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vertical dashed line at c
    ctx.strokeStyle = _matching ? '#10b981' : '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(toX(_c), toY(0));
    ctx.lineTo(toX(_c), toY(fC_safe));
    ctx.stroke();
    ctx.setLineDash([]);

    // Point c on curve
    ctx.fillStyle = _matching ? '#10b981' : '#fbbf24';
    ctx.beginPath();
    ctx.arc(toX(_c), toY(fC_safe), 6, 0, 2 * Math.PI);
    ctx.fill();

    // c tick on x-axis
    ctx.beginPath();
    ctx.arc(toX(_c), toY(0), 4, 0, 2 * Math.PI);
    ctx.fill();

    // Labels
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '11px monospace';
    ctx.fillText(`a=${_a.toFixed(2)}`, toX(_a) + 3, height - 5);
    ctx.fillText(`b=${_b.toFixed(2)}`, toX(_b) + 3, height - 5);

    ctx.fillStyle = _matching ? '#10b981' : '#fbbf24';
    ctx.font = '11px monospace';
    const cLy = toY(fC_safe) - 10;
    ctx.fillText(`c=${_c.toFixed(3)}`, toX(_c) + 6, cLy < 14 ? 14 : cLy);

    if (_matching) {
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('Areas match!', 10, 20);
    }
  });
</script>

<section id="mvt-integrals" class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold text-accent">5. MVT for Integrals</h2>
    <Button variant="ghost" size="sm" onclick={() => show = !show}>
      {show ? 'Hide' : 'Show'}
    </Button>
  </div>

  {#if show}
    <Card class="space-y-4">
      <!-- Theorem -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-2">Theorem Statement</h3>
        <KaTeX
          math={`\\text{If } f \\text{ is continuous on } [a,b], \\text{ then } \\exists\\, c \\in (a,b) \\text{ such that}`}
          displayMode={true}
        />
        <KaTeX
          math={`\\int_a^b f(x)\\,dx = f(c)(b - a)`}
          displayMode={true}
        />
        <p class="text-sm text-muted mt-2">
          The value <KaTeX math="f(c)" /> is the <em>average value</em> of <KaTeX math="f" /> on
          <KaTeX math="[a,b]" />. The rectangle with height <KaTeX math="f(c)" /> and width
          <KaTeX math="b - a" /> has the same area as the region under the curve.
        </p>
      </div>

      <!-- Presets + custom function -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-2">Function</h3>
        <div class="flex flex-wrap gap-2 mb-3">
          {#each presets as preset}
            <Button
              variant={funcExpr === preset.expr ? 'primary' : 'outline'}
              size="sm"
              onclick={() => applyPreset(preset)}
            >
              {preset.label}
            </Button>
          {/each}
        </div>
        <div class="flex gap-2 items-end">
          <div class="flex-1">
            <span class="block text-xs text-muted mb-1">Custom f(x) =</span>
            <input
              type="text"
              bind:value={funcInputValue}
              onkeydown={(e) => e.key === 'Enter' && handleFuncInput()}
              placeholder="e.g. x^2 + 1"
              class="w-full bg-bg-2 border border-border text-sm text-primary px-3 py-2 font-mono outline-none focus:border-accent transition-colors"
            />
          </div>
          <Button variant="outline" size="sm" onclick={handleFuncInput}>Apply</Button>
        </div>
        {#if parseError}
          <p class="text-xs mt-1" style="color: #f59e0b;">{parseError}</p>
        {/if}
        <p class="text-xs text-muted mt-1">
          Supports: +, -, *, /, ^, sin, cos, tan, sqrt, exp, log, pi, e, parentheses
        </p>
      </div>

      <!-- Interval sliders -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-muted mb-2">a = {intervalA.toFixed(2)}
            <input
              type="range"
              min="-5"
              max="4.9"
              step="0.05"
              bind:value={intervalA}
              class="w-full"
            />
          </label>
        </div>
        <div>
          <label class="block text-xs text-muted mb-2">b = {intervalB.toFixed(2)}
            <input
              type="range"
              min="-4.9"
              max="5"
              step="0.05"
              bind:value={intervalB}
              class="w-full"
            />
          </label>
        </div>
      </div>
      {#if intervalA >= intervalB}
        <p class="text-xs" style="color: #f59e0b;">Warning: a must be strictly less than b.</p>
      {/if}

      <!-- Canvas -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-3">Interactive Visualization</h3>
        <p class="text-xs text-muted mb-3">
          Move <strong style="color:#fbbf24;">c</strong> until the dashed rectangle matches the shaded area.
          The display turns green when they match (difference &lt; 0.01).
        </p>

        <div class="w-full overflow-x-auto">
          <canvas
            bind:this={canvas}
            style="width: 100%; height: 320px;"
            class="border border-border bg-[#18181b]"
          ></canvas>
        </div>

        <div class="mt-4">
          <label class="block text-xs text-muted mb-2">
            c = {cValue.toFixed(3)}
            <input
              type="range"
              min={intervalA}
              max={intervalB}
              step="0.001"
              bind:value={cValue}
              class="w-full"
            />
          </label>
        </div>
      </div>

      <!-- Computed values -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-3">Computed Values</h3>
        <div class="grid grid-cols-1 gap-2 text-sm font-mono">
          <div class="flex justify-between items-center border border-border px-3 py-2 bg-bg-2">
            <span class="text-muted">
              <KaTeX math={`\\displaystyle\\int_{${intervalA.toFixed(2)}}^{${intervalB.toFixed(2)}} f(x)\\,dx`} />
            </span>
            <span class="text-primary">
              {isNaN(integralValue) ? '\u2014' : integralValue.toFixed(6)}
            </span>
          </div>
          <div class="flex justify-between items-center border border-border px-3 py-2 bg-bg-2">
            <span class="text-muted">
              <KaTeX math={`f(c)\\cdot(b-a) \\text{ at } c=${cValue.toFixed(3)}`} />
            </span>
            <span class="text-primary">
              {isNaN(rectangleArea) ? '\u2014' : rectangleArea.toFixed(6)}
            </span>
          </div>
          <div
            class="flex justify-between items-center border px-3 py-2 transition-colors"
            style="border-color: {isMatching ? '#10b981' : '#334155'}; background: {isMatching ? 'rgba(16,185,129,0.08)' : '#18181b'};"
          >
            <span class="text-muted">|integral &minus; rectangle|</span>
            <span style="color: {isMatching ? '#10b981' : '#fbbf24'}; font-weight: {isMatching ? '700' : '400'};">
              {isNaN(difference) ? '\u2014' : difference.toFixed(6)}
              {#if isMatching}&nbsp;\u2713{/if}
            </span>
          </div>
          <div class="flex justify-between items-center border border-border px-3 py-2 bg-bg-2">
            <span class="text-muted">Average value of f on [a, b]</span>
            <span class="text-primary">
              {isNaN(integralValue) || intervalA >= intervalB
                ? '\u2014'
                : (integralValue / (intervalB - intervalA)).toFixed(6)}
            </span>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="text-xs space-y-1 mt-1">
        <div class="flex items-center gap-2">
          <div style="width:20px;height:10px;background:rgba(129,140,248,0.4);border:1px solid #818cf8;flex-shrink:0;"></div>
          <span class="text-muted">Shaded area = integral &int;f dx</span>
        </div>
        <div class="flex items-center gap-2">
          <div style="width:20px;height:10px;background:rgba(251,191,36,0.25);border:1px dashed #fbbf24;flex-shrink:0;"></div>
          <span class="text-muted">Rectangle = f(c)(b&minus;a)</span>
        </div>
        <div class="flex items-center gap-2">
          <div style="width:20px;height:10px;background:rgba(16,185,129,0.35);border:1px solid #10b981;flex-shrink:0;"></div>
          <span class="text-muted">Green = areas match (MVT c found)</span>
        </div>
        <div class="flex items-center gap-2">
          <div style="width:10px;height:10px;border-radius:50%;background:#fbbf24;flex-shrink:0;"></div>
          <span class="text-muted">Point c on the curve</span>
        </div>
      </div>
    </Card>

    <!-- Worked Example 1.5 -->
    <Card class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-primary">Example 1.5: Worked Solution</h3>
        <Button variant="ghost" size="sm" onclick={() => showExample = !showExample}>
          {showExample ? 'Hide' : 'Show'}
        </Button>
      </div>

      {#if showExample}
        <p class="text-xs text-muted">
          Find all <KaTeX math={"\\xi \\in [1,4]"} /> satisfying the MVT for integrals for
          <KaTeX math={"f(x) = 3x^2 - 2x"} /> on <KaTeX math={"[1,4]"} />.
        </p>

        <div class="space-y-3 text-sm">
          <!-- Step 1 -->
          <div class="border border-border bg-bg-2 px-3 py-2">
            <p class="text-xs text-muted mb-1"><strong class="text-primary">Step 1.</strong> Verify continuity</p>
            <p class="text-xs text-muted">
              <KaTeX math={"f(x) = 3x^2 - 2x"} /> is a polynomial, hence continuous on <KaTeX math={"[1,4]"} />. The MVT for integrals applies. ✓
            </p>
          </div>

          <!-- Step 2 -->
          <div class="border border-border bg-bg-2 px-3 py-2">
            <p class="text-xs text-muted mb-1"><strong class="text-primary">Step 2.</strong> Compute the integral</p>
            <KaTeX
              math={"\\int_1^4 (3x^2 - 2x)\\,dx = \\Big[x^3 - x^2\\Big]_1^4"}
              displayMode={true}
            />
            <KaTeX
              math={"= (64 - 16) - (1 - 1) = 48"}
              displayMode={true}
            />
          </div>

          <!-- Step 3 -->
          <div class="border border-border bg-bg-2 px-3 py-2">
            <p class="text-xs text-muted mb-1"><strong class="text-primary">Step 3.</strong> Set up MVT equation</p>
            <KaTeX
              math={"f(\\xi)(b - a) = 48 \\implies (3\\xi^2 - 2\\xi)(3) = 48"}
              displayMode={true}
            />
          </div>

          <!-- Step 4 -->
          <div class="border border-border bg-bg-2 px-3 py-2">
            <p class="text-xs text-muted mb-1"><strong class="text-primary">Step 4.</strong> Solve the quadratic</p>
            <KaTeX
              math={"9\\xi^2 - 6\\xi - 48 = 0 \\implies 3\\xi^2 - 2\\xi - 16 = 0"}
              displayMode={true}
            />
          </div>

          <!-- Step 5 -->
          <div class="border border-border bg-bg-2 px-3 py-2">
            <p class="text-xs text-muted mb-1"><strong class="text-primary">Step 5.</strong> Apply quadratic formula</p>
            <KaTeX
              math={"\\xi = \\frac{2 \\pm \\sqrt{4 + 192}}{6} = \\frac{2 \\pm 14}{6}"}
              displayMode={true}
            />
          </div>

          <!-- Step 6 -->
          <div class="border border-border bg-bg-2 px-3 py-2">
            <p class="text-xs text-muted mb-1"><strong class="text-primary">Step 6.</strong> Two candidate roots</p>
            <KaTeX
              math={"\\xi = \\frac{16}{6} = \\frac{8}{3} \\approx 2.667 \\qquad \\text{or} \\qquad \\xi = \\frac{-12}{6} = -2"}
              displayMode={true}
            />
          </div>

          <!-- Step 7 -->
          <div class="border border-border bg-bg-2 px-3 py-2">
            <p class="text-xs text-muted mb-1"><strong class="text-primary">Step 7.</strong> Select the valid root</p>
            <p class="text-xs text-muted">
              Since <KaTeX math={"\\xi = -2 \\notin [1,4]"} />, it is rejected.
              <KaTeX math={"\\xi = \\tfrac{8}{3} \\in [1,4]"} /> satisfies the theorem. ■
            </p>
          </div>

          <!-- Step 8: Verification -->
          <div class="border px-3 py-2" style="border-color: #10b981; background: rgba(16,185,129,0.08);">
            <p class="text-xs mb-1" style="color: #10b981;"><strong>Verification</strong></p>
            <KaTeX
              math={"f\\!\\left(\\tfrac{8}{3}\\right) \\cdot 3 = \\left(3 \\cdot \\frac{64}{9} - \\frac{16}{3}\\right) \\cdot 3 = \\left(\\frac{64}{3} - \\frac{16}{3}\\right) \\cdot 3 = \\frac{48}{3} \\cdot 3 = 48 \\;\\checkmark"}
              displayMode={true}
            />
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
    width: 100%;
    display: block;
    margin-top: 4px;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #818cf8;
    cursor: pointer;
    border-radius: 50%;
  }

  input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #818cf8;
    cursor: pointer;
    border: none;
    border-radius: 50%;
  }

  input[type="text"] {
    transition: border-color 0.15s;
  }
</style>
