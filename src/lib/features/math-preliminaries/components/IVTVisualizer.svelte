<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Button } from '$lib/components/ui';

  let show = $state(true);

  // IVT interactive state
  let ivtA = $state(-2);
  let ivtB = $state(1.5);
  let ivtCanvas: HTMLCanvasElement | undefined = $state();

  // Custom function input state
  const DEFAULT_EXPR = 'x^3 - x - 2';
  let funcExpr = $state(DEFAULT_EXPR);
  let funcError = $state('');

  const PRESETS = [
    { label: 'x\u00b3 - x - 2', expr: 'x^3 - x - 2' },
    { label: 'sin(x) - x/2', expr: 'sin(x) - x/2' },
    { label: 'x\u00b2 - 4', expr: 'x^2 - 4' },
    { label: 'cos(x) - x', expr: 'cos(x) - x' }
  ];

  function compileExpr(expr: string): ((x: number) => number) | null {
    let s = expr.trim().toLowerCase();
    s = s
      .replace(/\bpi\b/g, 'Math.PI')
      .replace(/\be\b/g, 'Math.E')
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\btan\b/g, 'Math.tan')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\bexp\b/g, 'Math.exp')
      .replace(/\bln\b/g, 'Math.log')
      .replace(/\blog\b/g, 'Math.log10');
    s = s.replace(/\^/g, '**');
    try {
      const fn = new Function('x', `"use strict"; return (${s});`) as (x: number) => number;
      fn(1);
      return fn;
    } catch {
      return null;
    }
  }

  let compiledFn: (x: number) => number = $state((x: number) => x * x * x - x - 2);

  function applyExpr(expr: string) {
    const fn = compileExpr(expr);
    if (fn === null) {
      funcError = 'Invalid expression -- using last valid function.';
    } else {
      compiledFn = fn;
      funcError = '';
    }
  }

  function ivtFunction(x: number): number {
    try {
      const v = compiledFn(x);
      return isFinite(v) ? v : NaN;
    } catch {
      return NaN;
    }
  }

  function handleExprInput(e: Event) {
    funcExpr = (e.target as HTMLInputElement).value;
  }

  function handleExprKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') applyExpr(funcExpr);
  }

  function selectPreset(expr: string) {
    funcExpr = expr;
    applyExpr(expr);
  }

  $effect(() => {
    if (!ivtCanvas) return;
    const ctx = ivtCanvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = ivtCanvas.getBoundingClientRect();
    ivtCanvas.width = rect.width * dpr;
    ivtCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const xMin = -2.5;
    const xMax = 3;
    const yMin = -6;
    const yMax = 6;

    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, width, height);

    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

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

    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(0));
    ctx.lineTo(width, toCanvasY(0));
    ctx.moveTo(toCanvasX(0), 0);
    ctx.lineTo(toCanvasX(0), height);
    ctx.stroke();

    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let penDown = false;
    for (let px = 0; px <= width; px++) {
      const x = xMin + (px / width) * (xMax - xMin);
      const y = ivtFunction(x);
      const py = toCanvasY(y);
      if (!isFinite(y) || py < -height || py > 2 * height) {
        penDown = false;
        continue;
      }
      if (!penDown) {
        ctx.moveTo(px, py);
        penDown = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    const fA = ivtFunction(ivtA);
    const fB = ivtFunction(ivtB);

    if (isFinite(fA)) {
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(toCanvasX(ivtA), toCanvasY(0));
      ctx.lineTo(toCanvasX(ivtA), toCanvasY(fA));
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (isFinite(fB)) {
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(toCanvasX(ivtB), toCanvasY(0));
      ctx.lineTo(toCanvasX(ivtB), toCanvasY(fB));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(0));
    ctx.lineTo(width, toCanvasY(0));
    ctx.stroke();

    if (isFinite(fA)) {
      ctx.fillStyle = '#a1a1aa';
      ctx.beginPath();
      ctx.arc(toCanvasX(ivtA), toCanvasY(fA), 5, 0, 2 * Math.PI);
      ctx.fill();
    }
    if (isFinite(fB)) {
      ctx.fillStyle = '#a1a1aa';
      ctx.beginPath();
      ctx.arc(toCanvasX(ivtB), toCanvasY(fB), 5, 0, 2 * Math.PI);
      ctx.fill();
    }

    if (isFinite(fA) && isFinite(fB) && fA * fB < 0) {
      let left = ivtA;
      let right = ivtB;
      for (let i = 0; i < 40; i++) {
        const mid = (left + right) / 2;
        const fMid = ivtFunction(mid);
        if (!isFinite(fMid)) break;
        if (fMid * ivtFunction(left) < 0) right = mid;
        else left = mid;
      }
      const root = (left + right) / 2;

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(toCanvasX(root), toCanvasY(0), 6, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '12px monospace';
    if (isFinite(fA)) {
      ctx.fillText(`a=${ivtA.toFixed(1)}`, toCanvasX(ivtA) - 20, toCanvasY(0) + 20);
      ctx.fillText(`f(a)=${fA.toFixed(2)}`, toCanvasX(ivtA) + 10, toCanvasY(fA));
    }
    if (isFinite(fB)) {
      ctx.fillText(`b=${ivtB.toFixed(1)}`, toCanvasX(ivtB) - 20, toCanvasY(0) + 20);
      ctx.fillText(`f(b)=${fB.toFixed(2)}`, toCanvasX(ivtB) + 10, toCanvasY(fB));
    }
  });

  let showExample = $state(false);

  let ivtAnswer = $state('');
  let ivtFeedback = $state('');

  function checkIVTAnswer() {
    if (ivtAnswer === 'b') {
      ivtFeedback = 'Correct! f(1) = -2 and f(2) = 1 have opposite signs, so a root exists in [1, 2].';
    } else {
      ivtFeedback = 'Incorrect. Check the signs of f at the endpoints of each interval.';
    }
  }
</script>

<section id="ivt" class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold text-accent">1. Intermediate Value Theorem</h2>
    <Button variant="ghost" size="sm" onclick={() => show = !show}>
      {show ? 'Hide' : 'Show'}
    </Button>
  </div>

  {#if show}
    <Card class="space-y-4">
      <div>
        <h3 class="text-sm font-semibold text-primary mb-2">Theorem Statement</h3>
        <KaTeX
          math={'\\text{If } f \\text{ is continuous on } [a,b] \\text{ and } k \\text{ is between } f(a) \\text{ and } f(b), \\\\ \\text{then } \\exists \\, c \\in (a,b) \\text{ such that } f(c) = k'}
          displayMode={true}
        />
        <p class="text-sm text-muted mt-2">
          In particular, if <KaTeX math="f(a)" /> and <KaTeX math="f(b)" /> have opposite signs, there exists a root <KaTeX math="c" /> where <KaTeX math="f(c) = 0" />.
        </p>
      </div>

      <div>
        <h3 class="text-sm font-semibold text-primary mb-3">Interactive Visualization</h3>

        <div class="mb-4 space-y-2">
          <label class="block text-xs text-muted mb-1">
            Custom function <span class="text-tertiary">(press Enter or Apply)</span>
          </label>
          <div class="flex gap-2">
            <input
              type="text"
              value={funcExpr}
              oninput={handleExprInput}
              onkeydown={handleExprKeydown}
              placeholder="e.g. x^3 - x - 2"
              class="flex-1 bg-bg text-primary border border-border-strong px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent"
            />
            <Button variant="outline" size="sm" onclick={() => applyExpr(funcExpr)}>
              Apply
            </Button>
          </div>
          {#if funcError}
            <p class="text-error text-xs">{funcError}</p>
          {/if}
          <div class="flex flex-wrap gap-2 mt-1">
            {#each PRESETS as preset}
              <Button
                variant="outline"
                size="sm"
                onclick={() => selectPreset(preset.expr)}
                class={funcExpr === preset.expr ? 'border-accent text-accent' : ''}
              >
                {preset.label}
              </Button>
            {/each}
          </div>
        </div>

        <p class="text-xs text-muted mb-3">
          Adjust the interval <KaTeX math="[a, b]" /> to see when opposite signs guarantee a root.
        </p>

        <div class="w-full overflow-x-auto">
          <canvas
            bind:this={ivtCanvas}
            style="width: 100%; height: 300px;"
            class="border border-border bg-[#18181b]"
          ></canvas>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label class="block text-xs text-muted mb-2">a = {ivtA.toFixed(2)}
            <input
              type="range"
              min="-2"
              max="2.5"
              step="0.1"
              bind:value={ivtA}
              class="w-full"
            />
            </label>
          </div>
          <div>
            <label class="block text-xs text-muted mb-2">b = {ivtB.toFixed(2)}
            <input
              type="range"
              min="-2"
              max="3"
              step="0.1"
              bind:value={ivtB}
              class="w-full"
            />
            </label>
          </div>
        </div>

        <div class="mt-3 text-xs space-y-1">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-[#818cf8]"></div>
            <span class="text-muted">Function curve</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-[#a1a1aa]"></div>
            <span class="text-muted">Interval endpoints</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-[#10b981]"></div>
            <span class="text-muted">Root (when <KaTeX math="f(a)" /> and <KaTeX math="f(b)" /> have opposite signs)</span>
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-sm font-semibold text-primary mb-3">Practice Problem</h3>
        <p class="text-sm text-muted mb-3">
          Given <KaTeX math="f(x) = x^2 - 3" />, which interval contains a root?
        </p>

        <div class="space-y-2">
          <label class="flex items-center gap-2 text-sm">
            <input type="radio" name="ivt" value="a" bind:group={ivtAnswer} />
            <span class="text-muted">A. [0, 1]</span>
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input type="radio" name="ivt" value="b" bind:group={ivtAnswer} />
            <span class="text-muted">B. [1, 2]</span>
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input type="radio" name="ivt" value="c" bind:group={ivtAnswer} />
            <span class="text-muted">C. [2, 3]</span>
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input type="radio" name="ivt" value="d" bind:group={ivtAnswer} />
            <span class="text-muted">D. [3, 4]</span>
          </label>
        </div>

        <Button variant="primary" size="sm" onclick={checkIVTAnswer} class="mt-3">
          Check Answer
        </Button>

        {#if ivtFeedback}
          <p class="text-sm mt-3 {ivtAnswer === 'b' ? 'text-[#10b981]' : 'text-[#f59e0b]'}">
            {ivtFeedback}
          </p>
        {/if}
      </div>
    </Card>

    <Card class="space-y-4 mt-6">
      <button class="w-full flex items-center justify-between text-left" onclick={() => showExample = !showExample}>
        <h3 class="text-sm font-semibold text-accent">Worked Example 1.2</h3>
        <span class="text-xs text-muted">{showExample ? '▲' : '▼'}</span>
      </button>
      {#if showExample}
        <div class="space-y-3 text-sm">
          <p class="text-muted font-semibold">Use the IVT to prove that x³ − 3x² − 2x + 9 = 0 is solvable.</p>

          <div class="space-y-2">
            <p class="text-muted"><span class="text-primary font-semibold">Step 1.</span> Let f(x) = x³ − 3x² − 2x + 9. This is a polynomial, hence continuous on all of ℝ.</p>

            <p class="text-muted"><span class="text-primary font-semibold">Step 2.</span> Evaluate at a = −2:</p>
            <KaTeX math={"f(-2) = (-2)^3 - 3(-2)^2 - 2(-2) + 9 = -8 - 12 + 4 + 9 = -7"} displayMode={true} />

            <p class="text-muted"><span class="text-primary font-semibold">Step 3.</span> Evaluate at b = −1:</p>
            <KaTeX math={"f(-1) = (-1)^3 - 3(-1)^2 - 2(-1) + 9 = -1 - 3 + 2 + 9 = 7"} displayMode={true} />

            <p class="text-muted"><span class="text-primary font-semibold">Step 4.</span> Since f(−2) = −7 &lt; 0 and f(−1) = 7 &gt; 0, there is a sign change on [−2, −1].</p>

            <p class="text-muted"><span class="text-primary font-semibold">Step 5.</span> By the IVT:</p>
            <KaTeX math={"\\exists\\, \\xi \\in (-2,\\,-1) \\text{ such that } f(\\xi) = 0"} displayMode={true} />

            <p class="text-muted">Therefore the equation x³ − 3x² − 2x + 9 = 0 has a solution in (−2, −1). <span class="text-primary">■</span></p>
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

  input[type="radio"] {
    accent-color: #818cf8;
  }
</style>
