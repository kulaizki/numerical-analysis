<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Button, Input } from '$lib/components/ui';
  import { Chart, registerables } from 'chart.js';

  // ── types ──────────────────────────────────────────────────────────────────
  type PresetKey = 'geometric' | 'harmonic' | 'pseries' | 'alternating' | 'exponential';

  interface Preset {
    label: string;
    formula: string;
    description: string;
    hasParam: boolean;
    paramLabel?: string;
    paramMin?: number;
    paramMax?: number;
    paramStep?: number;
    defaultParam?: number;
    fn: (n: number, p: number) => number;
  }

  // ── presets ────────────────────────────────────────────────────────────────
  const PRESETS: Record<PresetKey, Preset> = {
    geometric: {
      label: 'Geometric',
      formula: 'a_n = r^n',
      description: 'Converges when |r| < 1',
      hasParam: true,
      paramLabel: 'r',
      paramMin: -0.99,
      paramMax: 0.99,
      paramStep: 0.01,
      defaultParam: 0.5,
      fn: (n, r) => Math.pow(r, n)
    },
    harmonic: {
      label: 'Harmonic',
      formula: 'a_n = 1/n',
      description: 'Diverges (classic example)',
      hasParam: false,
      fn: (n) => 1 / n
    },
    pseries: {
      label: 'p-Series',
      formula: 'a_n = 1/n^p',
      description: 'Converges when p > 1',
      hasParam: true,
      paramLabel: 'p',
      paramMin: 0.1,
      paramMax: 5,
      paramStep: 0.1,
      defaultParam: 2,
      fn: (n, p) => 1 / Math.pow(n, p)
    },
    alternating: {
      label: 'Alternating',
      formula: 'a_n = (-1)^n / n',
      description: 'Converges by alternating series test',
      hasParam: false,
      fn: (n) => Math.pow(-1, n) / n
    },
    exponential: {
      label: 'Exponential',
      formula: 'a_n = 1/n!',
      description: 'Converges to e − 1',
      hasParam: false,
      fn: (n) => 1 / factorial(n)
    }
  };

  // ── helpers ────────────────────────────────────────────────────────────────
  function factorial(n: number): number {
    if (n <= 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  function safeEval(expr: string, n: number): number {
    // Prepare expression: replace ^ with ** and common math names
    let e = expr
      .replace(/\^/g, '**')
      .replace(/\bpi\b/gi, String(Math.PI))
      .replace(/\be\b/g, String(Math.E))
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\blog\b/g, 'Math.log')
      .replace(/\bexp\b/g, 'Math.exp');

    // Replace factorial patterns: n! or (expr)!
    // We handle simple n! only here — not arbitrary sub-expressions
    e = e.replace(/(\d+)!/g, (_m, d) => String(factorial(parseInt(d))));
    // Replace `n!` as a unit
    e = e.replace(/\bn!/g, String(factorial(n)));

    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('n', 'Math', `return (${e});`);
      const val = fn(n, Math);
      return typeof val === 'number' && isFinite(val) ? val : NaN;
    } catch {
      return NaN;
    }
  }

  function classifyConvergence(partials: number[], terms: number[]): {
    converges: boolean;
    limit: number;
    ratioTest: number | null;
  } {
    const N = partials.length;
    if (N < 10) return { converges: false, limit: NaN, ratioTest: null };

    // Ratio test on last few terms
    const absTerms = terms.map(Math.abs);
    const ratios: number[] = [];
    for (let i = N - 10; i < N - 1; i++) {
      if (absTerms[i] !== 0) ratios.push(absTerms[i + 1] / absTerms[i]);
    }
    const avgRatio = ratios.length
      ? ratios.reduce((a, b) => a + b, 0) / ratios.length
      : 1;

    // Check if partial sums are stabilising
    const last10 = partials.slice(-10);
    const variance =
      last10.reduce((acc, v) => acc + Math.pow(v - last10[last10.length - 1], 2), 0) / 10;
    const stable = variance < 1e-6;

    const converges = avgRatio < 0.9999 || stable;
    const limit = partials[N - 1];
    return { converges, limit, ratioTest: ratios.length ? avgRatio : null };
  }

  // ── state ──────────────────────────────────────────────────────────────────
  let show = $state(true);
  let activePreset = $state<PresetKey>('geometric');
  let presetParam = $state(0.5);
  let customFormula = $state('');
  let useCustom = $state(false);
  let numTerms = $state(50);
  let parseError = $state('');

  // Chart canvas ref
  let canvas: HTMLCanvasElement | undefined = $state();
  let chartInstance: Chart | null = null;

  // ── derived computation ────────────────────────────────────────────────────
  let computed = $derived.by(() => {
    const N = numTerms;
    const terms: number[] = [];
    const partials: number[] = [];
    let running = 0;

    for (let n = 1; n <= N; n++) {
      let a: number;
      if (useCustom && customFormula.trim()) {
        a = safeEval(customFormula, n);
      } else {
        const preset = PRESETS[activePreset];
        a = preset.fn(n, presetParam);
      }
      if (!isFinite(a)) a = NaN;
      terms.push(a);
      running += isNaN(a) ? 0 : a;
      partials.push(running);
    }

    const classification = classifyConvergence(partials, terms);
    return { terms, partials, classification };
  });

  // Table rows — first 20
  let tableRows = $derived(
    computed.terms.slice(0, 20).map((a, i) => ({
      n: i + 1,
      a,
      s: computed.partials[i]
    }))
  );

  // ── chart ──────────────────────────────────────────────────────────────────
  $effect(() => {
    // Access reactive deps so $effect re-runs when they change
    const partials = computed.partials;
    const terms = computed.terms;
    const { converges, limit } = computed.classification;
    const N = numTerms;

    // Destroy previous chart instance
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    if (!canvas) return;

    Chart.register(...registerables);

    const labels = Array.from({ length: N }, (_, i) => String(i + 1));

    const datasets: any[] = [
      {
        label: 'Partial sums Sₙ',
        data: partials,
        borderColor: '#818cf8',
        backgroundColor: 'rgba(129,140,248,0.08)',
        tension: 0.1,
        pointRadius: N > 100 ? 0 : 2,
        yAxisID: 'y'
      },
      {
        label: '|aₙ| (term size)',
        data: terms.map(Math.abs),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.08)',
        tension: 0.1,
        pointRadius: 0,
        borderDash: [4, 4],
        yAxisID: 'y2'
      }
    ];

    if (converges && isFinite(limit)) {
      datasets.push({
        label: `Limit ≈ ${limit.toFixed(6)}`,
        data: Array(N).fill(limit),
        borderColor: '#f59e0b',
        borderDash: [8, 4],
        pointRadius: 0,
        borderWidth: 1.5,
        yAxisID: 'y'
      });
    }

    chartInstance = new Chart(canvas, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { labels: { color: '#fafafa', boxWidth: 16 } }
        },
        scales: {
          x: {
            ticks: { color: '#a1a1aa', maxTicksLimit: 10 },
            grid: { color: '#27272a' }
          },
          y: {
            ticks: { color: '#818cf8' },
            grid: { color: '#27272a' },
            title: { display: true, text: 'Sₙ', color: '#818cf8' }
          },
          y2: {
            position: 'right',
            ticks: { color: '#10b981' },
            grid: { drawOnChartArea: false },
            title: { display: true, text: '|aₙ|', color: '#10b981' }
          }
        }
      }
    });

    return () => {
      chartInstance?.destroy();
      chartInstance = null;
    };
  });

  // ── handlers ───────────────────────────────────────────────────────────────
  function selectPreset(key: PresetKey) {
    activePreset = key;
    useCustom = false;
    parseError = '';
    const preset = PRESETS[key];
    presetParam = preset.defaultParam ?? 0.5;
  }

  function applyCustom() {
    if (!customFormula.trim()) return;
    // Quick validation: try first 3 terms
    for (let n = 1; n <= 3; n++) {
      const v = safeEval(customFormula, n);
      if (isNaN(v)) {
        parseError = `Could not evaluate formula at n=${n}. Check syntax.`;
        return;
      }
    }
    parseError = '';
    useCustom = true;
  }

  function fmt(v: number, digits = 6): string {
    if (isNaN(v)) return 'NaN';
    if (!isFinite(v)) return v > 0 ? '+∞' : '−∞';
    if (Math.abs(v) < 1e-4 && v !== 0) return v.toExponential(3);
    return v.toFixed(digits);
  }
</script>

<section id="series-analyzer" class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold text-accent">5. Series Convergence</h2>
    <Button variant="ghost" size="sm" onclick={() => (show = !show)}>
      {show ? 'Hide' : 'Show'}
    </Button>
  </div>

  {#if show}
    <Card class="space-y-6">

      <!-- ── Theory ─────────────────────────────────────────────────────────── -->
      <div>
        <h3 class="text-lg font-semibold text-primary mb-3">Theory</h3>

        <div class="space-y-4 text-sm text-muted">
          <div>
            <p class="mb-1">An infinite series is a sum of infinitely many terms:</p>
            <KaTeX math={'S = \\sum_{n=1}^{\\infty} a_n'} displayMode={true} />
          </div>

          <div>
            <p class="mb-1">The <span class="text-primary">N-th partial sum</span> accumulates the first N terms:</p>
            <KaTeX math={'S_N = \\sum_{n=1}^{N} a_n = a_1 + a_2 + \\cdots + a_N'} displayMode={true} />
          </div>

          <div>
            <p class="mb-1"><span class="text-primary">Convergence</span> means the partial sums approach a finite limit:</p>
            <KaTeX math={'S_N \\xrightarrow{N\\to\\infty} S \\in \\mathbb{R}'} displayMode={true} />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div class="p-3 bg-bg-3 border border-border text-xs">
              <p class="text-primary font-semibold mb-1">Ratio Test</p>
              <KaTeX math={'L = \\lim_{n\\to\\infty}\\left|\\frac{a_{n+1}}{a_n}\\right|'} />
              <p class="mt-1 text-muted">L &lt; 1 → converges; L &gt; 1 → diverges</p>
            </div>
            <div class="p-3 bg-bg-3 border border-border text-xs">
              <p class="text-primary font-semibold mb-1">Comparison Test</p>
              <KaTeX math={'0 \\le a_n \\le b_n'} />
              <p class="mt-1 text-muted">If Σbₙ converges, so does Σaₙ</p>
            </div>
            <div class="p-3 bg-bg-3 border border-border text-xs">
              <p class="text-primary font-semibold mb-1">Integral Test</p>
              <KaTeX math={'\\sum a_n \\sim \\int_1^\\infty f(x)\\,dx'} />
              <p class="mt-1 text-muted">Same convergence when f is decreasing</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Preset buttons ─────────────────────────────────────────────────── -->
      <div>
        <h3 class="text-base font-semibold text-primary mb-3">Preset Series</h3>
        <div class="flex flex-wrap gap-2">
          {#each Object.entries(PRESETS) as [key, preset]}
            <Button
              variant={activePreset === key && !useCustom ? 'primary' : 'outline'}
              size="sm"
              onclick={() => selectPreset(key as PresetKey)}
            >
              {preset.label}
            </Button>
          {/each}
        </div>

        {#if !useCustom}
          <div class="mt-3 p-3 bg-bg-3 border border-border text-sm">
            <p class="font-mono text-primary mb-1">
              <KaTeX math={PRESETS[activePreset].formula} />
            </p>
            <p class="text-muted text-xs">{PRESETS[activePreset].description}</p>

            {#if PRESETS[activePreset].hasParam}
              <div class="mt-3">
                <span class="block text-xs text-muted mb-1">
                  {PRESETS[activePreset].paramLabel} = {presetParam.toFixed(2)}
                </span>
                <input
                  type="range"
                  bind:value={presetParam}
                  min={PRESETS[activePreset].paramMin}
                  max={PRESETS[activePreset].paramMax}
                  step={PRESETS[activePreset].paramStep}
                  class="w-full"
                />
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- ── Custom formula ─────────────────────────────────────────────────── -->
      <div>
        <h3 class="text-base font-semibold text-primary mb-2">Custom Series</h3>
        <p class="text-xs text-muted mb-2">
          Enter a formula for a_n using variable <span class="font-mono text-primary">n</span>.
          Supports: <span class="font-mono">+  -  *  /  ^  sin  cos  sqrt  abs  log  exp  pi  e  n!</span>
        </p>
        <div class="flex gap-2">
          <Input
            bind:value={customFormula}
            placeholder="e.g.  1/n^2  or  (-1)^n/n  or  1/n!"
            mono={true}
            class="flex-1"
          />
          <Button variant="outline" size="sm" onclick={applyCustom}>Apply</Button>
          {#if useCustom}
            <Button
              variant="ghost"
              size="sm"
              onclick={() => {
                useCustom = false;
                customFormula = '';
                parseError = '';
              }}
            >Clear</Button>
          {/if}
        </div>
        {#if parseError}
          <p class="mt-1 text-xs text-red-400">{parseError}</p>
        {/if}
        {#if useCustom}
          <p class="mt-1 text-xs text-green-400">Custom formula active: a_n = {customFormula}</p>
        {/if}
      </div>

      <!-- ── Controls ───────────────────────────────────────────────────────── -->
      <div>
        <span class="block text-sm text-muted mb-1">
          Number of terms N = {numTerms}
        </span>
        <input
          type="range"
          bind:value={numTerms}
          min="10"
          max="500"
          step="10"
          class="w-full"
        />
      </div>

      <!-- ── Convergence result ─────────────────────────────────────────────── -->
      <div class="p-4 bg-bg-3 border border-border">
        {#if computed.classification.converges}
          <p class="text-green-400 font-medium">
            Appears to converge to ≈ {fmt(computed.classification.limit)}
          </p>
        {:else}
          <p class="text-red-400 font-medium">Appears to diverge</p>
        {/if}
        {#if computed.classification.ratioTest !== null}
          <p class="text-xs text-muted mt-1">
            Ratio test estimate: |a_&#123;n+1&#125;/a_n| ≈ {computed.classification.ratioTest.toFixed(5)}
            {computed.classification.ratioTest < 1 ? '(< 1, supports convergence)' : '(≥ 1, supports divergence)'}
          </p>
        {/if}
      </div>

      <!-- ── Chart ──────────────────────────────────────────────────────────── -->
      <div>
        <h3 class="text-base font-semibold text-primary mb-2">Visualization</h3>
        <div class="border border-border bg-bg-3" style="height: 340px;">
          <canvas bind:this={canvas} style="width:100%;height:100%;"></canvas>
        </div>
        <div class="mt-2 flex gap-4 text-xs text-muted">
          <span><span style="color:#818cf8;">━━</span> Partial sums Sₙ</span>
          <span><span style="color:#10b981;">╌╌</span> |aₙ| (term size)</span>
          <span><span style="color:#f59e0b;">╌╌</span> Estimated limit</span>
        </div>
      </div>

      <!-- ── Table ──────────────────────────────────────────────────────────── -->
      <div>
        <h3 class="text-base font-semibold text-primary mb-2">
          Partial Sums Table <span class="text-xs text-muted font-normal">(first 20 rows)</span>
        </h3>
        <div class="overflow-auto max-h-72 border border-border">
          <table class="w-full text-xs font-mono">
            <thead class="sticky top-0 bg-bg-2">
              <tr>
                <th class="px-3 py-2 text-left text-muted border-b border-border">n</th>
                <th class="px-3 py-2 text-left text-muted border-b border-border">aₙ</th>
                <th class="px-3 py-2 text-left text-muted border-b border-border">Sₙ</th>
              </tr>
            </thead>
            <tbody>
              {#each tableRows as row}
                <tr class="border-b border-border hover:bg-bg-3 transition-colors duration-100">
                  <td class="px-3 py-1.5 text-muted">{row.n}</td>
                  <td class="px-3 py-1.5 text-primary">{fmt(row.a)}</td>
                  <td class="px-3 py-1.5 text-accent">{fmt(row.s)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
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
