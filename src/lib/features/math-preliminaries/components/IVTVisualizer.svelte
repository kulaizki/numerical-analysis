<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Button } from '$lib/components/ui';

  let show = $state(true);

  // IVT interactive state
  let ivtA = $state(-2);
  let ivtB = $state(1.5);
  let ivtCanvas: HTMLCanvasElement | undefined = $state();

  function ivtFunction(x: number): number {
    return x * x * x - x - 2;
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

    // Clear canvas
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, width, height);

    // Transform helpers
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

    // Draw grid
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
      const y = ivtFunction(x);
      const py = toCanvasY(y);
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Highlight interval [a, b]
    const fA = ivtFunction(ivtA);
    const fB = ivtFunction(ivtB);

    // Draw vertical lines at a and b
    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(toCanvasX(ivtA), toCanvasY(0));
    ctx.lineTo(toCanvasX(ivtA), toCanvasY(fA));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toCanvasX(ivtB), toCanvasY(0));
    ctx.lineTo(toCanvasX(ivtB), toCanvasY(fB));
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw horizontal line at y=0
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(0));
    ctx.lineTo(width, toCanvasY(0));
    ctx.stroke();

    // Draw points at f(a) and f(b)
    ctx.fillStyle = '#a1a1aa';
    ctx.beginPath();
    ctx.arc(toCanvasX(ivtA), toCanvasY(fA), 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(toCanvasX(ivtB), toCanvasY(fB), 5, 0, 2 * Math.PI);
    ctx.fill();

    // If opposite signs, highlight root region
    if (fA * fB < 0) {
      // Approximate root using bisection (few iterations)
      let left = ivtA;
      let right = ivtB;
      for (let i = 0; i < 20; i++) {
        const mid = (left + right) / 2;
        const fMid = ivtFunction(mid);
        if (fMid * ivtFunction(left) < 0) right = mid;
        else left = mid;
      }
      const root = (left + right) / 2;

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(toCanvasX(root), toCanvasY(0), 6, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Labels
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '12px monospace';
    ctx.fillText(`a=${ivtA.toFixed(1)}`, toCanvasX(ivtA) - 20, toCanvasY(0) + 20);
    ctx.fillText(`b=${ivtB.toFixed(1)}`, toCanvasX(ivtB) - 20, toCanvasY(0) + 20);
    ctx.fillText(`f(a)=${fA.toFixed(2)}`, toCanvasX(ivtA) + 10, toCanvasY(fA));
    ctx.fillText(`f(b)=${fB.toFixed(2)}`, toCanvasX(ivtB) + 10, toCanvasY(fB));
  });

  // IVT Practice
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
        <p class="text-xs text-muted mb-3">
          Function: <KaTeX math="f(x) = x^3 - x - 2" />. Adjust the interval <KaTeX math="[a, b]" /> to see when opposite signs guarantee a root.
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
