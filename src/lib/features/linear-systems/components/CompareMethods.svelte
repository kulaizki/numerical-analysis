<script lang="ts">
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Button } from '$lib/components/ui';
  import { DEFAULT_A, DEFAULT_B, type IterationEntry } from '../types.ts';
  import {
    deepCopyMatrix,
    jacobiIteration,
    seidelIteration,
    calculateResidual
  } from '../utils.ts';

  let compareA = $state(deepCopyMatrix(DEFAULT_A));
  let compareB = $state([...DEFAULT_B]);
  let compareJacobiIters = $state<IterationEntry[]>([]);
  let compareSeidelIters = $state<IterationEntry[]>([]);
  let compareRunning = $state(false);

  async function runComparison() {
    compareJacobiIters = [];
    compareSeidelIters = [];
    compareRunning = true;

    // Run Jacobi
    let xJacobi = [0, 0, 0];
    compareJacobiIters.push({
      n: 0,
      x: [...xJacobi],
      residual: calculateResidual(compareA, compareB, xJacobi)
    });

    for (let iter = 0; iter < 30; iter++) {
      xJacobi = jacobiIteration(compareA, compareB, xJacobi);
      const residual = calculateResidual(compareA, compareB, xJacobi);
      compareJacobiIters = [...compareJacobiIters, {
        n: iter + 1,
        x: [...xJacobi],
        residual
      }];
      if (residual < 1e-6) break;
    }

    // Run Seidel
    let xSeidel = [0, 0, 0];
    compareSeidelIters.push({
      n: 0,
      x: [...xSeidel],
      residual: calculateResidual(compareA, compareB, xSeidel)
    });

    for (let iter = 0; iter < 30; iter++) {
      xSeidel = seidelIteration(compareA, compareB, xSeidel);
      const residual = calculateResidual(compareA, compareB, xSeidel);
      compareSeidelIters = [...compareSeidelIters, {
        n: iter + 1,
        x: [...xSeidel],
        residual
      }];
      if (residual < 1e-6) break;
    }

    compareRunning = false;
  }

  let compareChartData = $derived({
    labels: Array.from({length: Math.max(compareJacobiIters.length, compareSeidelIters.length)}, (_, i) => i.toString()),
    datasets: [
      {
        label: 'Jacobi Residual',
        data: compareJacobiIters.map(iter => iter.residual),
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1
      },
      {
        label: 'Gauss-Seidel Residual',
        data: compareSeidelIters.map(iter => iter.residual),
        borderColor: 'rgb(236, 72, 153)',
        tension: 0.1
      }
    ]
  });
</script>

<div class="space-y-6">
  <Card>
    <div class="p-6">
      <h3 class="text-xl font-semibold text-primary mb-4">Method Comparison</h3>

      <p class="text-tertiary mb-4">
        Compare the convergence speed of Jacobi vs Gauss-Seidel on the same system.
      </p>

      <div class="flex gap-4 mb-6">
        <Button onclick={runComparison} disabled={compareRunning}>
          {compareRunning ? 'Running...' : 'Run Comparison'}
        </Button>
      </div>

      {#if compareJacobiIters.length > 0 && compareSeidelIters.length > 0}
        <div class="space-y-6">
          <!-- Statistics -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-bg-2 p-4 border border-blue-500">
              <h4 class="text-blue-400 font-semibold mb-2">Gauss-Jacobi</h4>
              <div class="space-y-1 text-sm">
                <p class="text-tertiary">Iterations to converge: <span class="font-mono text-primary">{compareJacobiIters.length - 1}</span></p>
                <p class="text-tertiary">Final residual: <span class="font-mono text-primary">{compareJacobiIters[compareJacobiIters.length - 1].residual.toExponential(3)}</span></p>
                <p class="text-tertiary">Final solution:</p>
                <p class="font-mono text-xs text-primary">
                  [{compareJacobiIters[compareJacobiIters.length - 1].x.map(v => v.toFixed(4)).join(', ')}]
                </p>
              </div>
            </div>

            <div class="bg-bg-2 p-4 border border-pink-500">
              <h4 class="text-pink-400 font-semibold mb-2">Gauss-Seidel</h4>
              <div class="space-y-1 text-sm">
                <p class="text-tertiary">Iterations to converge: <span class="font-mono text-primary">{compareSeidelIters.length - 1}</span></p>
                <p class="text-tertiary">Final residual: <span class="font-mono text-primary">{compareSeidelIters[compareSeidelIters.length - 1].residual.toExponential(3)}</span></p>
                <p class="text-tertiary">Final solution:</p>
                <p class="font-mono text-xs text-primary">
                  [{compareSeidelIters[compareSeidelIters.length - 1].x.map(v => v.toFixed(4)).join(', ')}]
                </p>
              </div>
            </div>
          </div>

          <!-- Convergence Comparison Chart -->
          <div>
            <h4 class="text-tertiary font-semibold mb-2">Residual Convergence Comparison</h4>
            <Chart
              type="line"
              data={compareChartData}
              options={{
                scales: {
                  y: {
                    type: 'logarithmic'
                  }
                }
              }}
              height="400px"
            />
          </div>

          <!-- Analysis -->
          <div class="p-4 bg-bg-2 border border-border">
            <h4 class="text-primary font-semibold mb-2">Analysis</h4>
            <div class="space-y-2 text-tertiary text-sm">
              <p>
                <strong>Speedup:</strong> Gauss-Seidel converged {((compareJacobiIters.length - 1) / (compareSeidelIters.length - 1)).toFixed(2)}x faster than Jacobi
              </p>
              <p>
                <strong>Why?</strong> Gauss-Seidel uses the most recent values immediately, while Jacobi waits until the next iteration. This leads to faster information propagation through the system.
              </p>
              <p>
                <strong>Trade-off:</strong> Jacobi can be parallelized (all updates are independent), while Gauss-Seidel is inherently sequential.
              </p>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </Card>

  <!-- Summary Card -->
  <Card>
    <div class="p-6">
      <h3 class="text-xl font-semibold text-primary mb-4">Method Summary</h3>

      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="border-b border-border">
              <th class="text-left py-3 px-4 text-tertiary">Method</th>
              <th class="text-left py-3 px-4 text-tertiary">Type</th>
              <th class="text-left py-3 px-4 text-tertiary">Complexity</th>
              <th class="text-left py-3 px-4 text-tertiary">Advantages</th>
              <th class="text-left py-3 px-4 text-tertiary">Disadvantages</th>
            </tr>
          </thead>
          <tbody class="text-tertiary">
            <tr class="border-b border-border/50">
              <td class="py-3 px-4 font-semibold text-primary">Gaussian Elimination</td>
              <td class="py-3 px-4">Direct</td>
              <td class="py-3 px-4 font-mono">O(n³)</td>
              <td class="py-3 px-4">Exact (up to rounding), works for all non-singular systems</td>
              <td class="py-3 px-4">Expensive for large systems, sensitive to pivoting issues</td>
            </tr>
            <tr class="border-b border-border/50">
              <td class="py-3 px-4 font-semibold text-primary">LU Decomposition</td>
              <td class="py-3 px-4">Direct</td>
              <td class="py-3 px-4 font-mono">O(n³) + O(n²) per solve</td>
              <td class="py-3 px-4">Efficient for multiple right-hand sides</td>
              <td class="py-3 px-4">Initial decomposition still O(n³)</td>
            </tr>
            <tr class="border-b border-border/50">
              <td class="py-3 px-4 font-semibold text-primary">Gauss-Jacobi</td>
              <td class="py-3 px-4">Iterative</td>
              <td class="py-3 px-4 font-mono">O(n²) per iteration</td>
              <td class="py-3 px-4">Parallelizable, good for sparse matrices</td>
              <td class="py-3 px-4">Slow convergence, requires diagonal dominance</td>
            </tr>
            <tr class="border-b border-border/50">
              <td class="py-3 px-4 font-semibold text-primary">Gauss-Seidel</td>
              <td class="py-3 px-4">Iterative</td>
              <td class="py-3 px-4 font-mono">O(n²) per iteration</td>
              <td class="py-3 px-4">Faster than Jacobi, good for sparse matrices</td>
              <td class="py-3 px-4">Sequential (not parallelizable), requires diagonal dominance</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </Card>
</div>
