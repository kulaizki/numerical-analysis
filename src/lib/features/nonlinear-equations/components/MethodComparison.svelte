<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Button } from '$lib/components/ui';

  const defaultF = (x: number) => x ** 3 - x - 2;
  const defaultFPrime = (x: number) => 3 * x ** 2 - 1;
  const fixedPointG = (x: number) => Math.cbrt(x + 2);

  type ComparisonResult = {
    method: string;
    iterations: number;
    finalValue: number;
    convergenceData: Array<{x: number, y: number}>;
  };

  let comparisonResults = $state<ComparisonResult[]>([]);
  let comparing = $state(false);

  async function runComparison() {
    comparing = true;
    comparisonResults = [];

    // Bisection
    const bisectData: ComparisonResult = {
      method: 'Bisection',
      iterations: 0,
      finalValue: 0,
      convergenceData: []
    };
    let a = -2, b = 3;
    for (let i = 0; i < 50; i++) {
      const c = (a + b) / 2;
      const fc = defaultF(c);
      const fa = defaultF(a);
      const error = Math.abs(b - a);
      bisectData.convergenceData.push({ x: i + 1, y: error });

      if (error < 1e-6) {
        bisectData.iterations = i + 1;
        bisectData.finalValue = c;
        break;
      }

      if (fa * fc < 0) b = c;
      else a = c;
    }

    // Fixed-Point
    const fixedData: ComparisonResult = {
      method: 'Fixed-Point',
      iterations: 0,
      finalValue: 0,
      convergenceData: []
    };
    let x = 1.5;
    for (let i = 0; i < 50; i++) {
      const xNew = fixedPointG(x);
      const error = Math.abs(xNew - x);
      fixedData.convergenceData.push({ x: i + 1, y: error });

      if (error < 1e-6) {
        fixedData.iterations = i + 1;
        fixedData.finalValue = xNew;
        break;
      }
      x = xNew;
    }

    // Newton
    const newtonData: ComparisonResult = {
      method: 'Newton',
      iterations: 0,
      finalValue: 0,
      convergenceData: []
    };
    let xn = 1.5;
    for (let i = 0; i < 50; i++) {
      const fx = defaultF(xn);
      const fpx = defaultFPrime(xn);
      const xNew = xn - fx / fpx;
      const error = Math.abs(xNew - xn);
      newtonData.convergenceData.push({ x: i + 1, y: error });

      if (error < 1e-6) {
        newtonData.iterations = i + 1;
        newtonData.finalValue = xNew;
        break;
      }
      xn = xNew;
    }

    // Secant
    const secantData: ComparisonResult = {
      method: 'Secant',
      iterations: 0,
      finalValue: 0,
      convergenceData: []
    };
    let x0 = 1, x1 = 2;
    for (let i = 0; i < 50; i++) {
      const fx0 = defaultF(x0);
      const fx1 = defaultF(x1);
      const x2 = x1 - fx1 * (x1 - x0) / (fx1 - fx0);
      const error = Math.abs(x2 - x1);
      secantData.convergenceData.push({ x: i + 1, y: error });

      if (error < 1e-6) {
        secantData.iterations = i + 1;
        secantData.finalValue = x2;
        break;
      }
      x0 = x1;
      x1 = x2;
    }

    comparisonResults = [bisectData, fixedData, newtonData, secantData];
    comparing = false;
  }

  const comparisonChartData = $derived(() => {
    if (comparisonResults.length === 0) return null;

    return {
      labels: Array.from({ length: 20 }, (_, i) => i + 1),
      datasets: comparisonResults.map((result, idx) => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
        return {
          label: result.method,
          data: result.convergenceData,
          borderColor: colors[idx],
          backgroundColor: colors[idx],
          parsing: {
            xAxisKey: 'x',
            yAxisKey: 'y'
          }
        };
      })
    };
  });
</script>

<div class="space-y-6">
  <Card>
    <h2 class="text-xl font-semibold text-accent mb-4">Method Comparison</h2>

    <div class="space-y-4">
      <p class="text-muted mb-4">
        Run all four methods on <KaTeX math="f(x) = x^3 - x - 2" inline /> with tolerance = 1e-6
      </p>

      <Button onclick={runComparison} disabled={comparing}>
        {comparing ? 'Running...' : 'Run Comparison'}
      </Button>

      {#if comparisonResults.length > 0}
        <div class="overflow-x-auto mb-6">
          <table class="w-full text-sm">
            <thead class="border-b border-border">
              <tr class="text-muted">
                <th class="text-left p-2">Method</th>
                <th class="text-right p-2">Iterations</th>
                <th class="text-right p-2">Final Approximation</th>
              </tr>
            </thead>
            <tbody>
              {#each comparisonResults as result}
                <tr class="border-b border-border/50">
                  <td class="p-2 text-primary font-medium">{result.method}</td>
                  <td class="p-2 text-right text-accent font-mono">{result.iterations}</td>
                  <td class="p-2 text-right text-primary font-mono">{result.finalValue.toFixed(8)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <div class="h-96">
          <Chart
            type="line"
            data={comparisonChartData()}
            options={{
              scales: {
                y: {
                  type: 'logarithmic',
                  title: { display: true, text: 'Error (log scale)' }
                },
                x: {
                  title: { display: true, text: 'Iteration' }
                }
              },
              plugins: {
                legend: {
                  display: true,
                  position: 'top'
                }
              }
            }}
          />
        </div>

        <div class="bg-background/50 p-4">
          <h3 class="text-lg font-medium text-primary mb-2">Observations</h3>
          <ul class="list-disc list-inside space-y-1 text-muted">
            <li>Newton's method converges fastest (quadratic convergence)</li>
            <li>Secant method is nearly as fast as Newton but doesn't require derivative</li>
            <li>Fixed-point iteration is slower (linear convergence)</li>
            <li>Bisection is most reliable but slowest (guaranteed convergence)</li>
          </ul>
        </div>
      {/if}
    </div>
  </Card>
</div>
