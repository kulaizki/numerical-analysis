<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Button } from '$lib/components/ui';

  // ── State ──────────────────────────────────────────────────────────────────
  let show = $state(true);
  let taylorDegree = $state(5);
  let taylorCanvas: HTMLCanvasElement | undefined = $state();

  type FnKey = 'sin' | 'cos' | 'exp' | 'ln1p' | 'geo';
  let selectedFn: FnKey = $state('sin');
  let centerA = $state(0);
  let evalX = $state(1);

  // ── Function definitions ───────────────────────────────────────────────────
  interface FnDef {
    label: string;
    f: (x: number) => number;
    dn: (n: number, x: number) => number;
    maxDn1: (n: number, a: number, R: number) => number;
    yRange: [number, number];
  }

  const FUNCTIONS: Record<FnKey, FnDef> = {
    sin: {
      label: 'sin(x)',
      f: Math.sin,
      dn: (n, x) => {
        const cycle = [Math.sin(x), Math.cos(x), -Math.sin(x), -Math.cos(x)];
        return cycle[((n % 4) + 4) % 4];
      },
      maxDn1: (_n, _a, _R) => 1,
      yRange: [-1.5, 1.5]
    },
    cos: {
      label: 'cos(x)',
      f: Math.cos,
      dn: (n, x) => {
        const cycle = [Math.cos(x), -Math.sin(x), -Math.cos(x), Math.sin(x)];
        return cycle[((n % 4) + 4) % 4];
      },
      maxDn1: (_n, _a, _R) => 1,
      yRange: [-1.5, 1.5]
    },
    exp: {
      label: 'e^x',
      f: Math.exp,
      dn: (_n, x) => Math.exp(x),
      maxDn1: (_n, a, R) => Math.exp(a + R),
      yRange: [-0.5, 8]
    },
    ln1p: {
      label: 'ln(1+x)',
      f: (x) => Math.log(1 + x),
      dn: (n, x) => {
        if (n === 0) return Math.log(1 + x);
        const sign = (n - 1) % 2 === 0 ? 1 : -1;
        return sign * factorial(n - 1) / Math.pow(1 + x, n);
      },
      maxDn1: (n, a, R) => {
        const minX = a - R;
        const denom = Math.max(1e-10, 1 + minX);
        return factorial(n) / Math.pow(denom, n + 1);
      },
      yRange: [-3, 3]
    },
    geo: {
      label: '1/(1-x)',
      f: (x) => 1 / (1 - x),
      dn: (n, x) => factorial(n) / Math.pow(1 - x, n + 1),
      maxDn1: (n, a, R) => {
        const worstX = a + R;
        const denom = Math.max(1e-10, Math.abs(1 - worstX));
        return factorial(n + 1) / Math.pow(denom, n + 2);
      },
      yRange: [-4, 6]
    }
  };

  // ── Math helpers ───────────────────────────────────────────────────────────
  function factorial(n: number): number {
    if (n <= 0) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  function taylorPoly(fn: FnDef, x: number, a: number, n: number): number {
    let sum = 0;
    for (let k = 0; k <= n; k++) {
      const dk = fn.dn(k, a);
      if (!isFinite(dk)) return NaN;
      sum += (dk / factorial(k)) * Math.pow(x - a, k);
    }
    return sum;
  }

  // ── KaTeX polynomial formula ───────────────────────────────────────────────
  function buildPolyLatex(fn: FnKey, a: number, n: number): string {
    const def = FUNCTIONS[fn];
    const terms: string[] = [];

    for (let k = 0; k <= n; k++) {
      let dk: number;
      try { dk = def.dn(k, a); } catch { break; }
      if (!isFinite(dk) || Math.abs(dk) < 1e-14) continue;

      const coeff = dk / factorial(k);
      const absCoeff = Math.abs(coeff);
      const isNeg = coeff < 0;

      const fk = factorial(k);
      const dkRound = Math.round(dk * 1e9) / 1e9;
      let coeffTex: string;
      if (k === 0) {
        coeffTex = absCoeff.toPrecision(5).replace(/\.?0+$/, '');
      } else if (fk === 1 || Number.isInteger(coeff * 100) / 100 === coeff) {
        const v = absCoeff.toPrecision(4).replace(/\.?0+$/, '');
        coeffTex = v === '1' ? '' : v;
      } else {
        const numStr = Math.abs(dkRound).toPrecision(4).replace(/\.?0+$/, '');
        coeffTex = `\\frac{${numStr}}{${fk}}`;
      }

      let xPart = '';
      if (k === 1) xPart = a === 0 ? 'x' : `(x - ${a})`;
      else if (k > 1) xPart = a === 0 ? `x^{${k}}` : `(x - ${a})^{${k}}`;

      if (k === 0) {
        terms.push(`${isNeg ? '-' : ''}${coeffTex}`);
      } else {
        const sign = isNeg ? '-' : '+';
        terms.push(`${sign} ${coeffTex}${xPart}`);
      }
    }

    if (terms.length === 0) return `P_{${n}}(x) = 0`;
    return `P_{${n}}(x) = ${terms.join(' ')}`;
  }

  // ── Error bound computation ────────────────────────────────────────────────
  let errorBoundResult = $derived.by(() => {
    const def = FUNCTIONS[selectedFn];
    const a = Number(centerA);
    const x = Number(evalX);
    const n = taylorDegree;

    if (!isFinite(a) || !isFinite(x)) return null;

    let Pnx: number, fx: number;
    try {
      Pnx = taylorPoly(def, x, a, n);
      fx = def.f(x);
    } catch { return null; }

    if (!isFinite(Pnx) || !isFinite(fx)) return null;

    const R = Math.abs(x - a) + 0.5;
    let M: number;
    try { M = def.maxDn1(n, a, R); } catch { M = Infinity; }

    const bound = isFinite(M) ? (M / factorial(n + 1)) * Math.pow(Math.abs(x - a), n + 1) : Infinity;
    const actualError = Math.abs(fx - Pnx);
    const holds = actualError <= bound + 1e-10;

    return { Pnx, fx, bound, actualError, holds };
  });

  // ── Canvas rendering ───────────────────────────────────────────────────────
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

    const def = FUNCTIONS[selectedFn];
    const a = Number(centerA);
    const [yMin, yMax] = def.yRange;

    const xMin = a - 8;
    const xMax = a + 8;

    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, width, height);

    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let gx = Math.ceil(xMin); gx <= Math.floor(xMax); gx++) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(gx), 0);
      ctx.lineTo(toCanvasX(gx), height);
      ctx.stroke();
    }
    for (let gy = Math.ceil(yMin); gy <= Math.floor(yMax); gy++) {
      ctx.beginPath();
      ctx.moveTo(0, toCanvasY(gy));
      ctx.lineTo(width, toCanvasY(gy));
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

    // Center-a dashed marker
    if (a >= xMin && a <= xMax) {
      ctx.strokeStyle = '#fbbf2460';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(toCanvasX(a), 0);
      ctx.lineTo(toCanvasX(a), height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Exact function
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    for (let px = 0; px <= width; px++) {
      const x = xMin + (px / width) * (xMax - xMin);
      let y: number;
      try { y = def.f(x); } catch { started = false; continue; }
      if (!isFinite(y)) { started = false; continue; }
      const py = toCanvasY(y);
      if (!started) { ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Taylor polynomial
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    started = false;
    for (let px = 0; px <= width; px++) {
      const x = xMin + (px / width) * (xMax - xMin);
      const y = taylorPoly(def, x, a, taylorDegree);
      if (!isFinite(y)) { started = false; continue; }
      const py = toCanvasY(Math.max(yMin - 20, Math.min(yMax + 20, y)));
      if (!started) { ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Eval-x vertical line
    const ex = Number(evalX);
    if (isFinite(ex) && ex >= xMin && ex <= xMax) {
      ctx.strokeStyle = '#34d39970';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(toCanvasX(ex), 0);
      ctx.lineTo(toCanvasX(ex), height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Labels
    ctx.fillStyle = '#818cf8';
    ctx.font = '12px monospace';
    ctx.fillText(def.label, 10, 20);
    ctx.fillStyle = '#f472b6';
    ctx.fillText(`P${taylorDegree}(x)`, 10, 38);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`a = ${a}`, 10, 56);
  });

  // ── Derived LaTeX ──────────────────────────────────────────────────────────
  let polyLatex = $derived(buildPolyLatex(selectedFn, Number(centerA), taylorDegree));

  const FN_KEYS: FnKey[] = ['sin', 'cos', 'exp', 'ln1p', 'geo'];
</script>

<section id="taylor" class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold text-accent">4. Taylor's Theorem</h2>
    <Button variant="ghost" size="sm" onclick={() => show = !show}>
      {show ? 'Hide' : 'Show'}
    </Button>
  </div>

  {#if show}
    <Card class="space-y-6">
      <!-- Theorem statement -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-2">Theorem Statement</h3>
        <KaTeX
          math={'f(x) = \\sum_{k=0}^{n} \\frac{f^{(k)}(a)}{k!}(x-a)^k + R_n(x)'}
          displayMode={true}
        />
        <p class="text-xs text-muted mt-1">
          The Lagrange remainder is
          <KaTeX math={'R_n(x) = \\dfrac{f^{(n+1)}(\\xi)}{(n+1)!}(x-a)^{n+1}'} />
          for some ξ between a and x.
        </p>
      </div>

      <!-- Controls -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-3">Interactive Visualization</h3>

        <!-- Function selector -->
        <div class="mb-4">
          <p class="text-xs text-muted mb-2">Function to approximate</p>
          <div class="flex flex-wrap gap-2">
            {#each FN_KEYS as key}
              <button
                onclick={() => selectedFn = key}
                class="px-3 py-1.5 text-xs font-mono border transition-all duration-150 cursor-pointer
                  {selectedFn === key
                    ? 'bg-accent text-bg border-accent'
                    : 'bg-transparent text-muted border-border-strong hover:border-accent hover:text-accent'}"
              >
                {FUNCTIONS[key].label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Center point + eval x inputs -->
        <div class="flex flex-wrap gap-4 mb-4">
          <label class="flex flex-col gap-1">
            <span class="text-xs text-muted">Center point <KaTeX math={'a'} /></span>
            <input
              type="number"
              step="0.5"
              bind:value={centerA}
              class="bg-bg text-primary border border-border-strong px-3 py-2 text-sm font-mono w-28 outline-none focus:border-accent"
            />
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-xs text-muted">Evaluate at <KaTeX math={'x'} /></span>
            <input
              type="number"
              step="0.1"
              bind:value={evalX}
              class="bg-bg text-primary border border-border-strong px-3 py-2 text-sm font-mono w-28 outline-none focus:border-accent"
            />
          </label>
        </div>

        <!-- Canvas -->
        <div class="w-full overflow-x-auto">
          <canvas
            bind:this={taylorCanvas}
            style="width: 100%; height: 320px;"
            class="border border-border bg-[#18181b]"
          ></canvas>
        </div>

        <!-- Legend -->
        <div class="mt-3 text-xs flex flex-wrap gap-4">
          <div class="flex items-center gap-2">
            <div class="w-4 h-0.5 bg-[#818cf8]"></div>
            <span class="text-muted">{FUNCTIONS[selectedFn].label} exact</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 border-t-2 border-dashed border-[#f472b6]"></div>
            <span class="text-muted">P<sub>{taylorDegree}</sub>(x) Taylor</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 border-t border-dashed border-[#fbbf24]"></div>
            <span class="text-muted">Center a</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 border-t border-dashed border-[#34d399]"></div>
            <span class="text-muted">Eval x</span>
          </div>
        </div>

        <!-- Degree slider -->
        <div class="mt-4">
          <label class="block text-xs text-muted mb-2">
            Polynomial degree n = {taylorDegree}
          </label>
          <input
            type="range"
            min="0"
            max="15"
            step="1"
            bind:value={taylorDegree}
            class="w-full"
          />
          <div class="flex justify-between text-xs text-muted mt-1">
            <span>0</span><span>5</span><span>10</span><span>15</span>
          </div>
        </div>
      </div>

      <!-- Taylor polynomial formula -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-2">Polynomial Formula</h3>
        <div class="overflow-x-auto">
          <KaTeX math={polyLatex} displayMode={true} />
        </div>
      </div>

      <!-- Error bound section -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-2">Taylor Error Bound</h3>
        <p class="text-xs text-muted mb-3">
          The Lagrange remainder gives an upper bound on the approximation error:
        </p>
        <KaTeX
          math={'|R_n(x)| \\leq \\frac{M}{(n+1)!}|x-a|^{n+1}, \\quad M = \\max_{\\xi}\\left|f^{(n+1)}(\\xi)\\right|'}
          displayMode={true}
        />

        {#if errorBoundResult}
          {@const r = errorBoundResult}
          <div class="mt-4 border border-border-strong bg-bg p-4 space-y-3 text-sm font-mono">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p class="text-xs text-muted mb-0.5">f(x) exact</p>
                <p class="text-primary">{r.fx.toPrecision(10)}</p>
              </div>
              <div>
                <p class="text-xs text-muted mb-0.5">P<sub>{taylorDegree}</sub>(x) approx.</p>
                <p class="text-primary">{r.Pnx.toPrecision(10)}</p>
              </div>
              <div>
                <p class="text-xs text-muted mb-0.5">Actual error |f(x) - P<sub>{taylorDegree}</sub>(x)|</p>
                <p class="text-accent">{r.actualError.toExponential(4)}</p>
              </div>
              <div>
                <p class="text-xs text-muted mb-0.5">Error bound M/(n+1)! · |x-a|^(n+1)</p>
                <p class="{isFinite(r.bound) ? 'text-accent' : 'text-red-400'}">
                  {isFinite(r.bound) ? r.bound.toExponential(4) : 'Infinity (outside radius)'}
                </p>
              </div>
            </div>
            <div class="border-t border-border pt-3 flex items-center gap-2">
              <span class="text-xs text-muted">Bound holds?</span>
              {#if !isFinite(r.bound)}
                <span class="text-yellow-400 text-xs">N/A (bound is infinite)</span>
              {:else if r.holds}
                <span class="text-green-400 text-xs font-semibold">Yes — actual error is within the bound</span>
              {:else}
                <span class="text-red-400 text-xs font-semibold">No — numerical precision issue</span>
              {/if}
            </div>
          </div>
        {:else}
          <p class="text-xs text-muted mt-3">Enter finite values for a and x to compute the error bound.</p>
        {/if}

        <!-- Derivative bounds reference -->
        <div class="mt-4 text-xs text-muted space-y-1">
          <p class="font-semibold text-primary">Max derivative bounds used per function:</p>
          <ul class="list-disc list-inside space-y-0.5 ml-1">
            <li>sin(x), cos(x): <KaTeX math={'M = 1'} /> (all derivatives bounded by 1)</li>
            <li>e^x: <KaTeX math={'M = e^{a+R}'} /> where R = |x - a|</li>
            <li>ln(1+x): <KaTeX math={'M = n! \\ / \\ (1 + \\min\\xi)^{n+1}'} /></li>
            <li>1/(1-x): <KaTeX math={'M = (n+1)! \\ / \\ |1 - \\max\\xi|^{n+2}'} /></li>
          </ul>
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
</style>
