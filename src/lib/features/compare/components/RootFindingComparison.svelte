<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Badge, Button, Input } from '$lib/components/ui';

  // Function definitions
  const rootFunctions = [
    { label: 'x³ - x - 2', f: (x: number) => Math.pow(x, 3) - x - 2, fprime: (x: number) => 3*Math.pow(x, 2) - 1, latex: 'x^3 - x - 2' },
    { label: 'x² - 2', f: (x: number) => Math.pow(x, 2) - 2, fprime: (x: number) => 2*x, latex: 'x^2 - 2' },
    { label: 'cos(x) - x', f: (x: number) => Math.cos(x) - x, fprime: (x: number) => -Math.sin(x) - 1, latex: '\\cos(x) - x' },
    { label: 'eˣ - 3x', f: (x: number) => Math.exp(x) - 3*x, fprime: (x: number) => Math.exp(x) - 3, latex: 'e^x - 3x' }
  ];

  let rootFuncIndex = $state(0);
  let rootA = $state(-2);
  let rootB = $state(3);
  let rootTol = $state(1e-6);
  let rootX0 = $state(1.5);

  let selectedMethods = $state({
    bisection: true,
    newton: true,
    secant: true,
    fixedPoint: false
  });

  interface RootResult {
    method: string;
    root: number;
    iterations: number;
    finalError: number;
    convergenceData: Array<{ iteration: number; error: number; value: number }>;
  }

  let rootResults = $state<RootResult[]>([]);
  let rootRunning = $state(false);

  function bisectionMethod(f: (x: number) => number, a: number, b: number, tol: number): RootResult {
    const convergence: Array<{ iteration: number; error: number; value: number }> = [];
    let fa = f(a);
    let fb = f(b);

    if (fa * fb > 0) {
      throw new Error("f(a) and f(b) must have opposite signs");
    }

    let iter = 0;
    let error = Math.abs(b - a);

    while (error > tol && iter < 100) {
      const c = (a + b) / 2;
      const fc = f(c);
      error = Math.abs(b - a) / 2;

      convergence.push({ iteration: iter + 1, error, value: c });

      if (Math.abs(fc) < tol) break;

      if (fa * fc < 0) {
        b = c;
        fb = fc;
      } else {
        a = c;
        fa = fc;
      }
      iter++;
    }

    return {
      method: 'Bisection',
      root: (a + b) / 2,
      iterations: iter,
      finalError: error,
      convergenceData: convergence
    };
  }

  function newtonMethod(f: (x: number) => number, fprime: (x: number) => number, x0: number, tol: number): RootResult {
    const convergence: Array<{ iteration: number; error: number; value: number }> = [];
    let x = x0;
    let iter = 0;
    let error = Infinity;

    while (iter < 100) {
      const fx = f(x);
      const fpx = fprime(x);

      if (Math.abs(fpx) < 1e-12) {
        throw new Error("Derivative too small");
      }

      const xNew = x - fx / fpx;
      error = Math.abs(xNew - x);

      convergence.push({ iteration: iter + 1, error, value: xNew });

      x = xNew;
      iter++;

      if (error < tol || Math.abs(fx) < tol) break;
    }

    return {
      method: 'Newton',
      root: x,
      iterations: iter,
      finalError: error,
      convergenceData: convergence
    };
  }

  function secantMethod(f: (x: number) => number, x0: number, x1: number, tol: number): RootResult {
    const convergence: Array<{ iteration: number; error: number; value: number }> = [];
    let xPrev = x0;
    let x = x1;
    let iter = 0;
    let error = Infinity;

    while (iter < 100) {
      const fx = f(x);
      const fxPrev = f(xPrev);

      if (Math.abs(fx - fxPrev) < 1e-12) {
        throw new Error("Division by zero");
      }

      const xNew = x - fx * (x - xPrev) / (fx - fxPrev);
      error = Math.abs(xNew - x);

      convergence.push({ iteration: iter + 1, error, value: xNew });

      xPrev = x;
      x = xNew;
      iter++;

      if (error < tol || Math.abs(fx) < tol) break;
    }

    return {
      method: 'Secant',
      root: x,
      iterations: iter,
      finalError: error,
      convergenceData: convergence
    };
  }

  function fixedPointMethod(g: (x: number) => number, x0: number, tol: number): RootResult {
    const convergence: Array<{ iteration: number; error: number; value: number }> = [];
    let x = x0;
    let iter = 0;
    let error = Infinity;

    while (iter < 100) {
      const xNew = g(x);
      error = Math.abs(xNew - x);

      convergence.push({ iteration: iter + 1, error, value: xNew });

      x = xNew;
      iter++;

      if (error < tol) break;
    }

    return {
      method: 'Fixed-Point',
      root: x,
      iterations: iter,
      finalError: error,
      convergenceData: convergence
    };
  }

  function runRootComparison() {
    rootRunning = true;
    rootResults = [];
    const results: RootResult[] = [];

    const currentFunc = rootFunctions[rootFuncIndex];

    try {
      if (selectedMethods.bisection) {
        results.push(bisectionMethod(currentFunc.f, rootA, rootB, rootTol));
      }
      if (selectedMethods.newton) {
        results.push(newtonMethod(currentFunc.f, currentFunc.fprime, rootX0, rootTol));
      }
      if (selectedMethods.secant) {
        results.push(secantMethod(currentFunc.f, rootA, rootB, rootTol));
      }
      if (selectedMethods.fixedPoint) {
        // For x³ - x - 2 = 0, rearrange to x = ∛(x + 2)
        const g = (x: number) => Math.cbrt(x + 2);
        results.push(fixedPointMethod(g, rootX0, rootTol));
      }

      rootResults = results;
    } catch (e: any) {
      alert(e.message);
    } finally {
      rootRunning = false;
    }
  }

  let rootChartData = $derived({
    labels: rootResults[0]?.convergenceData.map(d => d.iteration) || [],
    datasets: rootResults.map((result, idx) => ({
      label: result.method,
      data: result.convergenceData.map(d => Math.log10(d.error + 1e-16)),
      borderColor: ['#818cf8', '#22c55e', '#f59e0b', '#a5b4fc'][idx],
      backgroundColor: ['#818cf8', '#22c55e', '#f59e0b', '#a5b4fc'][idx] + '40',
      tension: 0.1,
      borderWidth: 2
    }))
  });

  let rootWinner = $derived.by(() => {
    if (rootResults.length === 0) return null;
    return rootResults.reduce((min, r) => r.iterations < min.iterations ? r : min);
  });

  export function copyResults() {
    let text = 'Method Comparison - Root Finding\n\n';
    text += `Function: ${rootFunctions[rootFuncIndex].label}\n`;
    text += `Interval: [${rootA}, ${rootB}], Tolerance: ${rootTol}\n\n`;
    text += 'Method\t\tRoot\t\tIterations\tFinal Error\n';
    rootResults.forEach(r => {
      text += `${r.method}\t\t${r.root.toFixed(8)}\t${r.iterations}\t\t${r.finalError.toExponential(2)}\n`;
    });
    if (rootWinner) {
      text += `\nWinner: ${rootWinner.method} (${rootWinner.iterations} iterations)\n`;
    }
    return text;
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <!-- Controls -->
  <Card class="lg:col-span-1 p-6">
    <h3 class="text-lg font-semibold text-primary mb-4">Configuration</h3>

    <div class="mb-4">
      <label class="block text-sm text-muted mb-2">Function</label>
      <select
        bind:value={rootFuncIndex}
        class="w-full bg-bg-3 text-primary border border-border px-3 py-2 text-sm focus:outline-none focus:border-accent"
      >
        {#each rootFunctions as func, i}
          <option value={i}>{func.label}</option>
        {/each}
      </select>
      <div class="mt-2 text-center">
        <KaTeX math="f(x) = {rootFunctions[rootFuncIndex].latex}" displayMode={true} />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 mb-4">
      <Input type="number" label="a (left)" bind:value={rootA} step="0.1" />
      <Input type="number" label="b (right)" bind:value={rootB} step="0.1" />
    </div>

    <Input type="number" label="Initial guess x₀" bind:value={rootX0} step="0.1" class="mb-4" />
    <Input type="number" label="Tolerance" bind:value={rootTol} step="1e-7" class="mb-4" mono />

    <div class="mb-4">
      <label class="block text-sm text-muted mb-2">Select Methods</label>
      <div class="space-y-2">
        <label class="flex items-center gap-2 text-sm text-primary cursor-pointer">
          <input type="checkbox" bind:checked={selectedMethods.bisection} class="accent-accent" />
          Bisection
        </label>
        <label class="flex items-center gap-2 text-sm text-primary cursor-pointer">
          <input type="checkbox" bind:checked={selectedMethods.newton} class="accent-accent" />
          Newton
        </label>
        <label class="flex items-center gap-2 text-sm text-primary cursor-pointer">
          <input type="checkbox" bind:checked={selectedMethods.secant} class="accent-accent" />
          Secant
        </label>
        <label class="flex items-center gap-2 text-sm text-primary cursor-pointer">
          <input type="checkbox" bind:checked={selectedMethods.fixedPoint} class="accent-accent" />
          Fixed-Point
        </label>
      </div>
    </div>

    <Button onclick={runRootComparison} disabled={rootRunning} class="w-full mb-3">
      {rootRunning ? 'Running...' : 'Run Comparison'}
    </Button>

    {#if rootResults.length > 0}
      <Button variant="outline" onclick={() => {
        navigator.clipboard.writeText(copyResults());
        alert('Results copied to clipboard!');
      }} class="w-full">
        Copy Results
      </Button>
    {/if}
  </Card>

  <!-- Results -->
  <div class="lg:col-span-2 space-y-6">
    {#if rootResults.length > 0}
      <!-- Convergence Chart -->
      <Card class="p-6">
        <h3 class="text-lg font-semibold text-primary mb-4">Convergence (log₁₀ error)</h3>
        <Chart type="line" data={rootChartData} options={{
          plugins: {
            legend: { display: true, position: 'top' }
          },
          scales: {
            y: { title: { display: true, text: 'log₁₀(error)', color: '#a1a1aa' } },
            x: { title: { display: true, text: 'Iteration', color: '#a1a1aa' } }
          }
        }} height="350px" />
      </Card>

      <!-- Results Table -->
      <Card class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-primary">Results</h3>
          {#if rootWinner}
            <Badge color="#22c55e">Winner: {rootWinner.method}</Badge>
          {/if}
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left py-2 px-3 text-muted font-medium">Method</th>
                <th class="text-right py-2 px-3 text-muted font-medium">Root</th>
                <th class="text-right py-2 px-3 text-muted font-medium">Iterations</th>
                <th class="text-right py-2 px-3 text-muted font-medium">Final Error</th>
              </tr>
            </thead>
            <tbody>
              {#each rootResults as result}
                <tr class="border-b border-border hover:bg-bg-3 transition-colors">
                  <td class="py-2 px-3 text-primary font-medium">
                    {result.method}
                    {#if rootWinner && result.method === rootWinner.method}
                      <Badge color="#22c55e" class="ml-2">🏆</Badge>
                    {/if}
                  </td>
                  <td class="py-2 px-3 text-right font-mono text-primary">{result.root.toFixed(8)}</td>
                  <td class="py-2 px-3 text-right text-primary">{result.iterations}</td>
                  <td class="py-2 px-3 text-right font-mono text-primary">{result.finalError.toExponential(2)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </Card>
    {:else}
      <Card class="p-12 text-center">
        <p class="text-muted">Configure parameters and click "Run Comparison" to see results</p>
      </Card>
    {/if}
  </div>
</div>
