<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Badge, Button, Input } from '$lib/components/ui';
  import { onMount } from 'svelte';
  import { evaluateFunc, checkAnswer } from '../utils';

  // State
  let diffX = $state(Math.PI / 4);
  let diffH = $state(0.1);
  let diffFunc = $state('sin(x)');
  let diffCanvas: HTMLCanvasElement;
  let showDiffTheory = $state(false);

  // Exact derivative for common functions
  function exactDerivative(x: number): number {
    if (diffFunc.toLowerCase().includes('sin')) {
      return Math.cos(x);
    } else if (diffFunc.toLowerCase().includes('cos')) {
      return -Math.sin(x);
    } else if (diffFunc.toLowerCase().includes('x^2')) {
      return 2 * x;
    } else if (diffFunc.toLowerCase().includes('x^3')) {
      return 3 * x * x;
    }
    // Numerical approximation fallback
    const h = 0.00001;
    return (evaluateFunc(diffFunc, x + h) - evaluateFunc(diffFunc, x - h)) / (2 * h);
  }

  let forwardDiff = $derived((evaluateFunc(diffFunc, diffX + diffH) - evaluateFunc(diffFunc, diffX)) / diffH);
  let backwardDiff = $derived((evaluateFunc(diffFunc, diffX) - evaluateFunc(diffFunc, diffX - diffH)) / diffH);
  let centralDiff = $derived((evaluateFunc(diffFunc, diffX + diffH) - evaluateFunc(diffFunc, diffX - diffH)) / (2 * diffH));
  let exactDeriv = $derived(exactDerivative(diffX));
  let forwardError = $derived(Math.abs(forwardDiff - exactDeriv));
  let backwardError = $derived(Math.abs(backwardDiff - exactDeriv));
  let centralError = $derived(Math.abs(centralDiff - exactDeriv));

  function drawDifferentiation() {
    if (!diffCanvas) return;
    const ctx = diffCanvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = diffCanvas.getBoundingClientRect();
    diffCanvas.width = rect.width * dpr;
    diffCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;

    // Clear
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // Padding
    const pad = 40;
    const plotWidth = width - 2 * pad;
    const plotHeight = height - 2 * pad;

    // Domain: -1 to 2pi
    const xMin = -1;
    const xMax = 2 * Math.PI;
    const yMin = -2;
    const yMax = 2;

    // Scale functions
    const scaleX = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * plotWidth;
    const scaleY = (y: number) => pad + ((yMax - y) / (yMax - yMin)) * plotHeight;

    // Draw axes
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(scaleX(0), pad);
    ctx.lineTo(scaleX(0), height - pad);
    ctx.moveTo(pad, scaleY(0));
    ctx.lineTo(width - pad, scaleY(0));
    ctx.stroke();

    // Draw function curve
    ctx.strokeStyle = '#a5b4fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const x = xMin + (i / 200) * (xMax - xMin);
      const y = evaluateFunc(diffFunc, x);
      if (i === 0) ctx.moveTo(scaleX(x), scaleY(y));
      else ctx.lineTo(scaleX(x), scaleY(y));
    }
    ctx.stroke();

    // Draw point of interest
    const fx = evaluateFunc(diffFunc, diffX);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(scaleX(diffX), scaleY(fx), 5, 0, 2 * Math.PI);
    ctx.fill();

    // Draw tangent line (exact derivative)
    const slope = exactDeriv;
    const x1 = diffX - 1;
    const x2 = diffX + 1;
    const y1 = fx + slope * (x1 - diffX);
    const y2 = fx + slope * (x2 - diffX);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(scaleX(x1), scaleY(y1));
    ctx.lineTo(scaleX(x2), scaleY(y2));
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw forward difference secant
    const fxh = evaluateFunc(diffFunc, diffX + diffH);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(scaleX(diffX), scaleY(fx));
    ctx.lineTo(scaleX(diffX + diffH), scaleY(fxh));
    ctx.stroke();

    // Draw backward difference secant
    const fxmh = evaluateFunc(diffFunc, diffX - diffH);
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(scaleX(diffX - diffH), scaleY(fxmh));
    ctx.lineTo(scaleX(diffX), scaleY(fx));
    ctx.stroke();

    // Draw central difference secant
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(scaleX(diffX - diffH), scaleY(fxmh));
    ctx.lineTo(scaleX(diffX + diffH), scaleY(fxh));
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '12px Manrope';
    ctx.fillText('f(x)', scaleX(xMax) - 30, scaleY(evaluateFunc(diffFunc, xMax)) - 10);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`x = ${diffX.toFixed(3)}`, scaleX(diffX) + 10, scaleY(fx) - 10);
  }

  $effect(() => {
    diffX;
    diffH;
    diffFunc;
    drawDifferentiation();
  });

  // Practice problems
  type DiffProblem = {
    func: string;
    x: number;
    exactDeriv: number;
  };

  const diffProblems: DiffProblem[] = [
    { func: 'cos(x)', x: Math.PI / 6, exactDeriv: -Math.sin(Math.PI / 6) },
    { func: 'x^2', x: 2, exactDeriv: 4 },
    { func: 'x^3', x: 1.5, exactDeriv: 6.75 }
  ];

  let diffUserAnswers = $state<string[]>(diffProblems.map(() => ''));
  let diffSubmitted = $state<boolean[]>(diffProblems.map(() => false));

  function submitDiffProblem(index: number) {
    diffSubmitted[index] = true;
  }

  onMount(() => {
    drawDifferentiation();
  });
</script>

<div class="space-y-6">
  <Card>
    <h2 class="text-xl font-semibold text-accent mb-4">Numerical Differentiation</h2>
    <p class="text-muted mb-4">
      Approximate the derivative f'(x) using finite difference formulas. The exact derivative is the limit as h → 0.
    </p>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Controls -->
      <div class="space-y-4">
        <div>
          <span class="block text-sm font-medium text-muted mb-1">Function <KaTeX math="f(x)" /></span>
          <Input
            type="text"
            bind:value={diffFunc}
            placeholder="e.g., sin(x), x^2, cos(x)"
            class="w-full font-mono"
          />
        </div>

        <div>
          <span class="block text-sm font-medium text-muted mb-1">
            Point x = {diffX.toFixed(4)}
          </span>
          <input
            type="range"
            bind:value={diffX}
            min="0"
            max={Math.PI}
            step="0.01"
            class="w-full"
          />
        </div>

        <div>
          <span class="block text-sm font-medium text-muted mb-1">
            Step size h = {diffH.toFixed(4)}
          </span>
          <input
            type="range"
            bind:value={diffH}
            min="0.001"
            max="0.5"
            step="0.001"
            class="w-full"
          />
        </div>

        <!-- Results -->
        <div class="space-y-2 p-4 bg-bg-3 border border-border">
          <div class="flex justify-between items-center">
            <span class="text-sm text-muted">Exact f'(x):</span>
            <Badge class="font-mono">{exactDeriv.toFixed(6)}</Badge>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm" style="color: #ef4444;">Forward:</span>
            <div class="flex gap-2">
              <Badge class="font-mono">{forwardDiff.toFixed(6)}</Badge>
              <Badge class="font-mono text-xs">ε = {forwardError.toFixed(8)}</Badge>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm" style="color: #8b5cf6;">Backward:</span>
            <div class="flex gap-2">
              <Badge class="font-mono">{backwardDiff.toFixed(6)}</Badge>
              <Badge class="font-mono text-xs">ε = {backwardError.toFixed(8)}</Badge>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm" style="color: #f59e0b;">Central:</span>
            <div class="flex gap-2">
              <Badge class="font-mono">{centralDiff.toFixed(6)}</Badge>
              <Badge class="font-mono text-xs">ε = {centralError.toFixed(8)}</Badge>
            </div>
          </div>
        </div>
      </div>

      <!-- Visualization -->
      <div class="w-full overflow-x-auto">
        <canvas
          bind:this={diffCanvas}
          style="width: 100%; height: 400px;"
          class="border border-border bg-bg-3"
        ></canvas>
        <div class="mt-2 text-xs text-muted space-y-1">
          <div><span style="color: #a5b4fc;">━━</span> Function <KaTeX math="f(x)" /></div>
          <div><span style="color: #10b981;">- - -</span> Exact tangent (green)</div>
          <div><span style="color: #ef4444;">━━</span> Forward difference secant</div>
          <div><span style="color: #8b5cf6;">━━</span> Backward difference secant</div>
          <div><span style="color: #f59e0b;">━━</span> Central difference secant</div>
        </div>
      </div>
    </div>

    <!-- Theory -->
    <div class="mt-6">
      <button
        class="text-accent hover:underline text-sm"
        onclick={() => (showDiffTheory = !showDiffTheory)}
      >
        {showDiffTheory ? '▼' : '▶'} Theory & Error Analysis
      </button>
      {#if showDiffTheory}
        <div class="mt-4 space-y-3 p-4 bg-bg-3 border border-border text-sm text-muted">
          <div>
            <strong class="text-primary">Forward Difference:</strong>
            <KaTeX math={'f\'(x) \\approx \\frac{f(x+h) - f(x)}{h}'} displayMode={true} />
            <p>Truncation error: <KaTeX math="O(h)" /></p>
          </div>
          <div>
            <strong class="text-primary">Backward Difference:</strong>
            <KaTeX math={'f\'(x) \\approx \\frac{f(x) - f(x-h)}{h}'} displayMode={true} />
            <p>Truncation error: <KaTeX math="O(h)" /></p>
          </div>
          <div>
            <strong class="text-primary">Central Difference:</strong>
            <KaTeX math={'f\'(x) \\approx \\frac{f(x+h) - f(x-h)}{2h}'} displayMode={true} />
            <p>Truncation error: <KaTeX math="O(h^2)" /> (more accurate!)</p>
          </div>
          <p class="mt-4">
            Central difference is preferred for accuracy. Smaller h reduces truncation error but may increase round-off error.
          </p>
        </div>
      {/if}
    </div>
  </Card>

  <!-- Practice Problems -->
  <Card>
    <h3 class="text-lg font-bold text-primary mb-4">Practice Problems</h3>
    <p class="text-sm text-muted mb-4">
      Use central difference with h = 0.01 to approximate f'(x). Enter your answer to 3 decimal places.
    </p>

    <div class="space-y-4">
      {#each diffProblems as problem, i}
        <div class="p-4 bg-bg-3 border border-border">
          <p class="text-sm mb-2">
            <strong>Problem {i + 1}:</strong> <KaTeX math="f(x)" /> = {problem.func}, x = {problem.x.toFixed(3)}
          </p>
          <p class="text-sm text-muted mb-3">
            <KaTeX math={'f\'(' + problem.x.toFixed(3) + ') \\approx \\frac{f(' + (problem.x + 0.01).toFixed(3) + ') - f(' + (problem.x - 0.01).toFixed(3) + ')}{0.02}'} />
          </p>
          <div class="flex gap-2 items-center">
            <Input
              type="text"
              bind:value={diffUserAnswers[i]}
              placeholder="Your answer"
              class="w-32 font-mono"
              disabled={diffSubmitted[i]}
            />
            <Button
              onclick={() => submitDiffProblem(i)}
              variant="primary"
              size="sm"
              disabled={diffSubmitted[i]}
            >
              {diffSubmitted[i] ? 'Submitted' : 'Submit'}
            </Button>
            {#if diffSubmitted[i]}
              {#if checkAnswer(diffUserAnswers[i], problem.exactDeriv, 0.02)}
                <Badge class="bg-green-900 text-green-200">Correct!</Badge>
              {:else}
                <Badge class="bg-red-900 text-red-200">
                  Incorrect. Expected: {problem.exactDeriv.toFixed(3)}
                </Badge>
              {/if}
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </Card>
</div>

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
