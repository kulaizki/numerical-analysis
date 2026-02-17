<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Button } from '$lib/components/ui';

  let show = $state(true);
  let showExample = $state(false);

  type Preset = {
    label: string;
    fn: (x: number) => number;
    fnLatex: string;
    a: number;
    L: number;
    dne: boolean;
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  };

  const presets: Preset[] = [
    {
      label: 'f(x) = 2x+1, a=1',
      fn: (x: number) => 2 * x + 1,
      fnLatex: 'f(x) = 2x + 1,\\; a = 1,\\; L = 3',
      a: 1,
      L: 3,
      dne: false,
      xMin: -0.5,
      xMax: 2.5,
      yMin: 0,
      yMax: 6
    },
    {
      label: 'f(x) = x², a=2',
      fn: (x: number) => x * x,
      fnLatex: 'f(x) = x^2,\\; a = 2,\\; L = 4',
      a: 2,
      L: 4,
      dne: false,
      xMin: 0,
      xMax: 4,
      yMin: 0,
      yMax: 8
    },
    {
      label: 'f(x) = sin(x)/x, a=0',
      fn: (x: number) => (Math.abs(x) < 1e-12 ? 1 : Math.sin(x) / x),
      fnLatex: 'f(x) = \\tfrac{\\sin x}{x},\\; a = 0,\\; L = 1',
      a: 0,
      L: 1,
      dne: false,
      xMin: -3,
      xMax: 3,
      yMin: -0.5,
      yMax: 1.5
    },
    {
      label: 'f(x) = |x|/x, a=0 (DNE)',
      fn: (x: number) => (Math.abs(x) < 1e-12 ? NaN : x / Math.abs(x)),
      fnLatex: 'f(x) = \\tfrac{|x|}{x},\\; a = 0,\\; L = \\text{DNE}',
      a: 0,
      L: 0,
      dne: true,
      xMin: -2,
      xMax: 2,
      yMin: -2,
      yMax: 2
    }
  ];

  let presetIdx = $state(0);
  let epsilon = $state(0.5);
  let delta = $state(0.3);

  let canvas: HTMLCanvasElement | undefined = $state();

  let currentPreset = $derived(presets[presetIdx]);

  let isValid = $derived.by(() => {
    if (currentPreset.dne) return false;
    const { fn, a, L } = currentPreset;
    const steps = 500;
    for (let i = 0; i <= steps; i++) {
      const x = a - delta + (2 * delta * i) / steps;
      if (Math.abs(x - a) < 1e-10) continue;
      if (Math.abs(x - a) >= delta) continue;
      const fx = fn(x);
      if (isNaN(fx)) return false;
      if (Math.abs(fx - L) >= epsilon) return false;
    }
    return true;
  });

  $effect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const _eps = epsilon;
    const _del = delta;
    const _preset = currentPreset;
    const _valid = isValid;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const { fn, a, L, xMin, xMax, yMin, yMax } = _preset;

    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Background
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, width, height);

    // Grid
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

    // Epsilon band (horizontal, green)
    const epsTop = toCanvasY(L + _eps);
    const epsBot = toCanvasY(L - _eps);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.fillRect(0, epsTop, width, epsBot - epsTop);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, epsTop);
    ctx.lineTo(width, epsTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, epsBot);
    ctx.lineTo(width, epsBot);
    ctx.stroke();
    ctx.setLineDash([]);

    // Delta band (vertical, blue)
    const delLeft = toCanvasX(a - _del);
    const delRight = toCanvasX(a + _del);
    ctx.fillStyle = 'rgba(129, 140, 248, 0.15)';
    ctx.fillRect(delLeft, 0, delRight - delLeft, height);
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(delLeft, 0);
    ctx.lineTo(delLeft, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(delRight, 0);
    ctx.lineTo(delRight, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Function curve
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let penUp = true;
    const steps = Math.round(width * 2);
    for (let px = 0; px <= steps; px++) {
      const x = xMin + (px / steps) * (xMax - xMin);
      const fx = fn(x);
      if (isNaN(fx) || !isFinite(fx)) { penUp = true; continue; }
      const cy = toCanvasY(fx);
      const cx = toCanvasX(x);
      if (penUp) { ctx.moveTo(cx, cy); penUp = false; }
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Limit point (a, L) — hollow circle
    const validColor = _valid ? '#10b981' : '#f87171';
    ctx.strokeStyle = validColor;
    ctx.fillStyle = '#18181b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(toCanvasX(a), toCanvasY(L), 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Labels
    ctx.font = '11px monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`L+ε=${(L + _eps).toFixed(2)}`, 4, epsTop - 4);
    ctx.fillText(`L-ε=${(L - _eps).toFixed(2)}`, 4, epsBot + 12);
    ctx.fillStyle = '#818cf8';
    ctx.fillText('a-δ', delLeft + 2, height - 6);
    ctx.fillText('a+δ', delRight - 22, height - 6);
    ctx.fillStyle = validColor;
    ctx.fillText(`(${a}, ${L})`, toCanvasX(a) + 8, toCanvasY(L) - 8);
  });
</script>

<section id="epsilon-delta" class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold text-accent">6. Epsilon-Delta Limits</h2>
    <Button variant="ghost" size="sm" onclick={() => show = !show}>
      {show ? 'Hide' : 'Show'}
    </Button>
  </div>

  {#if show}
    <Card class="space-y-4">

      <!-- Theory -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-2">Formal Definition</h3>
        <KaTeX
          math={'\\lim_{x \\to a} f(x) = L \\iff \\forall\\, \\varepsilon > 0,\\; \\exists\\, \\delta > 0 : 0 < |x - a| < \\delta \\implies |f(x) - L| < \\varepsilon'}
          displayMode={true}
        />
        <div class="mt-3 grid grid-cols-1 gap-2 text-sm text-muted">
          <p>
            <span class="text-[#10b981] font-semibold">ε (epsilon)</span> is the tolerance in the <em>output</em> — how close <KaTeX math="f(x)" /> must be to <KaTeX math="L" />.
          </p>
          <p>
            <span class="text-[#818cf8] font-semibold">δ (delta)</span> is the tolerance in the <em>input</em> — how close <KaTeX math="x" /> must stay to <KaTeX math="a" />.
          </p>
          <p>
            <span class="text-primary font-semibold">The game:</span> your adversary picks any <KaTeX math="\varepsilon > 0" />; you must respond with a <KaTeX math="\delta > 0" /> that keeps <KaTeX math="f(x)" /> inside the <KaTeX math="\varepsilon" />-band whenever <KaTeX math="x" /> is inside the <KaTeX math="\delta" />-band.
          </p>
        </div>
      </div>

      <!-- Presets -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-2">Preset Functions</h3>
        <div class="flex flex-wrap gap-2">
          {#each presets as preset, i}
            <Button
              variant={presetIdx === i ? 'primary' : 'outline'}
              size="sm"
              onclick={() => { presetIdx = i; delta = 0.3; epsilon = 0.5; }}
            >
              {preset.label}
            </Button>
          {/each}
        </div>
        <p class="mt-2 text-xs text-muted">
          Current: <KaTeX math={currentPreset.fnLatex} />
        </p>
        {#if currentPreset.dne}
          <p class="mt-1 text-xs text-[#f87171]">
            This limit does not exist — no matter how small δ is, the function jumps between -1 and +1 near a=0, so it can never stay in any ε-band with ε &lt; 1.
          </p>
        {/if}
      </div>

      <!-- Canvas -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-2">Interactive Visualization</h3>
        <div class="w-full overflow-x-auto">
          <canvas
            bind:this={canvas}
            style="width: 100%; height: 320px;"
            class="border border-border bg-[#18181b]"
          ></canvas>
        </div>

        <div class="mt-3 flex flex-wrap gap-4 text-xs">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3" style="background: rgba(16,185,129,0.4); border: 1px solid #10b981;"></div>
            <span class="text-muted">ε-band (output tolerance)</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3" style="background: rgba(129,140,248,0.4); border: 1px solid #818cf8;"></div>
            <span class="text-muted">δ-band (input tolerance)</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-[#818cf8]"></div>
            <span class="text-muted">Function f(x)</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full border-2" style="border-color: #10b981;"></div>
            <span class="text-muted">Limit point (a, L)</span>
          </div>
        </div>
      </div>

      <!-- Sliders -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-3">Controls</h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <span class="block text-xs text-[#10b981] mb-1">
              ε (epsilon) = {epsilon.toFixed(3)}
            </span>
            <input
              type="range"
              min="0.01"
              max="2.0"
              step="0.01"
              bind:value={epsilon}
              class="w-full slider-green"
            />
            <p class="text-xs text-muted mt-1">Output tolerance: |f(x) − L| &lt; ε</p>
          </div>
          <div>
            <span class="block text-xs text-[#818cf8] mb-1">
              δ (delta) = {delta.toFixed(3)}
            </span>
            <input
              type="range"
              min="0.01"
              max="2.0"
              step="0.01"
              bind:value={delta}
              class="w-full slider-indigo"
            />
            <p class="text-xs text-muted mt-1">Input tolerance: 0 &lt; |x − a| &lt; δ</p>
          </div>
        </div>
      </div>

      <!-- Status -->
      <div
        class="flex items-center gap-3 px-4 py-3 border rounded text-sm font-medium
          {isValid
            ? 'border-[#10b981] bg-[rgba(16,185,129,0.08)] text-[#10b981]'
            : 'border-[#f87171] bg-[rgba(248,113,113,0.08)] text-[#f87171]'}"
      >
        <span class="text-lg">{isValid ? '✓' : '✗'}</span>
        {#if currentPreset.dne}
          <span>Invalid — this limit does not exist; no δ can ever satisfy the definition.</span>
        {:else if isValid}
          <span>Valid! δ = {delta.toFixed(3)} works for ε = {epsilon.toFixed(3)}. The curve stays in the ε-band across the entire δ-band.</span>
        {:else}
          <span>Invalid! f(x) leaves the ε-band within the δ-band. Try a smaller δ.</span>
        {/if}
      </div>

    </Card>

    <Card class="space-y-4 mt-6">
      <button class="w-full flex items-center justify-between text-left" onclick={() => showExample = !showExample}>
        <h3 class="text-sm font-semibold text-accent">Worked Example 1.1</h3>
        <span class="text-xs text-muted">{showExample ? '▲' : '▼'}</span>
      </button>
      {#if showExample}
        <div class="space-y-4 text-sm">

          <!-- Scratch Work -->
          <div>
            <h4 class="text-xs font-semibold text-primary mb-2">Scratch Work</h4>
            <p class="text-muted mb-2">
              Prove that <KaTeX math={"\\lim_{x \\to 1} x^2 = 1"} />.
              We need to find <KaTeX math={"\\delta > 0"} /> such that <KaTeX math={"0 < |x - 1| < \\delta \\implies |x^2 - 1| < \\varepsilon"} />.
            </p>
            <KaTeX math={"|f(x) - L| = |x^2 - 1| = |x - 1||x + 1| < \\varepsilon"} displayMode={true} />
            <p class="text-muted mb-2">
              This means we need <KaTeX math={"|x - 1| < \\dfrac{\\varepsilon}{|x + 1|}"} />.
              Since <KaTeX math={"x \\to 1"} />, assume <KaTeX math={"x \\in (0, 2)"} />, so <KaTeX math={"1 < x + 1 < 3"} />, meaning <KaTeX math={"|x + 1| < 3"} />.
            </p>
            <KaTeX math={"\\frac{1}{3} < \\frac{1}{|x+1|} \\implies \\frac{\\varepsilon}{3} < \\frac{\\varepsilon}{|x+1|}"} displayMode={true} />
            <p class="text-muted">
              Therefore it suffices to set <KaTeX math={"\\delta \\leq \\dfrac{\\varepsilon}{3}"} />.
            </p>
          </div>

          <!-- Formal Proof -->
          <div>
            <h4 class="text-xs font-semibold text-primary mb-2">Formal Proof</h4>
            <p class="text-muted mb-2">
              Given <KaTeX math={"\\varepsilon > 0"} />, let <KaTeX math={"\\delta = \\dfrac{\\varepsilon}{3}"} />. Then whenever <KaTeX math={"0 < |x - 1| < \\delta"} />:
            </p>
            <KaTeX math={"|x - 1| < \\delta = \\frac{\\varepsilon}{3} < \\frac{\\varepsilon}{|x+1|} \\quad (\\text{since } |x+1| < 3)"} displayMode={true} />
            <KaTeX math={"|x - 1|\\,|x + 1| < \\varepsilon"} displayMode={true} />
            <KaTeX math={"|x^2 - 1| < \\varepsilon \\qquad \\blacksquare"} displayMode={true} />
          </div>

          <!-- Try This -->
          <div class="border border-border rounded p-3 bg-[rgba(129,140,248,0.06)]">
            <h4 class="text-xs font-semibold text-[#818cf8] mb-2">Try This</h4>
            <p class="text-muted mb-2">
              Prove that <KaTeX math={"\\lim_{x \\to 2}\\,(x^2 - 2x + 1) = 1"} />.
            </p>
            <p class="text-muted text-xs">
              <span class="text-primary font-semibold">Hint:</span>{' '}
              <KaTeX math={"|f(x) - 1| = |x^2 - 2x| = |x|\\,|x - 2|"} />.
              Since <KaTeX math={"x \\to 2"} />, assume <KaTeX math={"x \\in (1, 3)"} /> so <KaTeX math={"|x| < 3"} />.
              Set <KaTeX math={"\\delta \\leq \\dfrac{\\varepsilon}{3}"} />.
            </p>
          </div>

        </div>
      {/if}
    </Card>
  {/if}
</section>

<style>
  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    background: #334155;
    outline: none;
    border-radius: 2px;
  }

  input[type='range'].slider-green::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #10b981;
    cursor: pointer;
    border-radius: 50%;
  }

  input[type='range'].slider-green::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #10b981;
    cursor: pointer;
    border-radius: 50%;
    border: none;
  }

  input[type='range'].slider-indigo::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #818cf8;
    cursor: pointer;
    border-radius: 50%;
  }

  input[type='range'].slider-indigo::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #818cf8;
    cursor: pointer;
    border-radius: 50%;
    border: none;
  }
</style>
