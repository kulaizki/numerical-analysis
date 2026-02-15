<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Button, Input } from '$lib/components/ui';
  import { DEFAULT_A, DEFAULT_B, type IterationEntry } from '../types.ts';
  import {
    deepCopyMatrix,
    checkDiagonalDominance,
    jacobiIteration,
    calculateResidual
  } from '../utils.ts';

  let jacobiA = $state(deepCopyMatrix(DEFAULT_A));
  let jacobiB = $state([...DEFAULT_B]);
  let jacobiX0 = $state([0, 0, 0]);
  let jacobiIterations = $state<IterationEntry[]>([]);
  let jacobiCurrentIter = $state(0);
  let jacobiRunning = $state(false);
  let jacobiShowTheory = $state(false);

  function resetJacobi() {
    jacobiIterations = [];
    jacobiCurrentIter = 0;
    jacobiRunning = false;
  }

  async function runJacobi() {
    resetJacobi();

    if (!checkDiagonalDominance(jacobiA)) {
      alert('Warning: Matrix is not diagonally dominant. Convergence not guaranteed!');
    }

    jacobiRunning = true;
    let x = [...jacobiX0];

    jacobiIterations.push({
      n: 0,
      x: [...x],
      residual: calculateResidual(jacobiA, jacobiB, x)
    });

    for (let iter = 0; iter < 30; iter++) {
      x = jacobiIteration(jacobiA, jacobiB, x);
      const residual = calculateResidual(jacobiA, jacobiB, x);

      jacobiIterations = [...jacobiIterations, {
        n: iter + 1,
        x: [...x],
        residual
      }];

      jacobiCurrentIter = jacobiIterations.length;

      await new Promise(resolve => setTimeout(resolve, 200));

      if (residual < 1e-6) break;
    }

    jacobiRunning = false;
  }

  let jacobiChartData = $derived({
    labels: jacobiIterations.map(iter => iter.n.toString()),
    datasets: [
      {
        label: 'x₁',
        data: jacobiIterations.map(iter => iter.x[0]),
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1
      },
      {
        label: 'x₂',
        data: jacobiIterations.map(iter => iter.x[1]),
        borderColor: 'rgb(139, 92, 246)',
        tension: 0.1
      },
      {
        label: 'x₃',
        data: jacobiIterations.map(iter => iter.x[2]),
        borderColor: 'rgb(236, 72, 153)',
        tension: 0.1
      }
    ]
  });

  let jacobiResidualData = $derived({
    labels: jacobiIterations.map(iter => iter.n.toString()),
    datasets: [{
      label: 'Residual',
      data: jacobiIterations.map(iter => iter.residual),
      borderColor: 'rgb(34, 197, 94)',
      tension: 0.1
    }]
  });

  // Practice problem
  let jacobiPracticeUserIter = $state('');
  let jacobiPracticeCorrect = $state<boolean | null>(null);

  function checkJacobiPractice() {
    const userIter = parseInt(jacobiPracticeUserIter);
    jacobiPracticeCorrect = userIter >= 8 && userIter <= 20;
  }
</script>

<div class="space-y-6">
  <!-- Theory -->
  <Card>
    <button
      class="w-full flex items-center justify-between p-4"
      onclick={() => jacobiShowTheory = !jacobiShowTheory}
    >
      <h3 class="text-xl font-semibold text-primary">Theory</h3>
      <span class="text-muted">{jacobiShowTheory ? '▼' : '▶'}</span>
    </button>
    {#if jacobiShowTheory}
      <div class="px-4 pb-4 space-y-4 text-tertiary">
        <p>
          The Gauss-Jacobi method is an iterative technique where each variable is updated simultaneously based on the previous iteration values.
        </p>
        <div class="space-y-2">
          <p class="font-semibold text-primary">Iteration Formula:</p>
          <KaTeX
            math={'x_i^{(k+1)} = \\frac{1}{a_{ii}} \\left( b_i - \\sum_{j \\neq i} a_{ij} x_j^{(k)} \\right)'}
            displayMode
          />
          <p class="mt-4">
            <strong>Convergence:</strong> Guaranteed if the matrix is strictly diagonally dominant:
          </p>
          <KaTeX
            math={'|a_{ii}| > \\sum_{j \\neq i} |a_{ij}| \\quad \\forall i'}
            displayMode
          />
        </div>
        <p class="text-sm">
          <strong>Advantage:</strong> Simple to implement and parallelize. Each component can be computed independently.
        </p>
      </div>
    {/if}
  </Card>

  <!-- Diagonal Dominance Check -->
  <Card>
    <div class="p-6">
      <h3 class="text-xl font-semibold text-primary mb-4">Diagonal Dominance Check</h3>

      {#if true}
        {@const isDominant = checkDiagonalDominance(jacobiA)}
        <div class="p-4 border {isDominant ? 'bg-green-500/10 border-green-500' : 'bg-yellow-500/10 border-yellow-500'}">
          {#if isDominant}
            <p class="text-green-400 font-semibold">✓ Matrix is diagonally dominant</p>
            <p class="text-tertiary text-sm mt-1">Convergence is guaranteed!</p>
          {:else}
            <p class="text-yellow-400 font-semibold">⚠ Matrix is NOT diagonally dominant</p>
            <p class="text-tertiary text-sm mt-1">Convergence is not guaranteed, but may still converge.</p>
          {/if}
        </div>
      {/if}
    </div>
  </Card>

  <!-- Iteration Visualizer -->
  <Card>
    <div class="p-6">
      <h3 class="text-xl font-semibold text-primary mb-4">Iteration Visualizer</h3>

      <div class="mb-4">
        <p class="text-muted mb-2">System: Same 3x3 system (solution: x = [2, 4, 3])</p>
        <p class="text-tertiary text-sm">Starting from x⁽⁰⁾ = [0, 0, 0]</p>
      </div>

      <div class="flex gap-4 mb-6">
        <Button onclick={runJacobi} disabled={jacobiRunning}>
          {jacobiRunning ? 'Running...' : 'Run Iterations'}
        </Button>
        <Button onclick={resetJacobi} disabled={jacobiIterations.length === 0 || jacobiRunning}>
          Reset
        </Button>
      </div>

      {#if jacobiIterations.length > 0}
        <div class="space-y-6">
          <!-- Iteration Table -->
          <div class="overflow-x-auto">
            <table class="w-full font-mono text-sm">
              <thead>
                <tr class="border-b border-border">
                  <th class="text-left py-2 px-4 text-tertiary">Iter</th>
                  <th class="text-right py-2 px-4 text-tertiary">x₁</th>
                  <th class="text-right py-2 px-4 text-tertiary">x₂</th>
                  <th class="text-right py-2 px-4 text-tertiary">x₃</th>
                  <th class="text-right py-2 px-4 text-tertiary">Residual</th>
                </tr>
              </thead>
              <tbody>
                {#each jacobiIterations.slice(-10) as iter}
                  <tr class="border-b border-border/50">
                    <td class="py-2 px-4 text-muted">{iter.n}</td>
                    <td class="text-right py-2 px-4 text-tertiary">{iter.x[0].toFixed(6)}</td>
                    <td class="text-right py-2 px-4 text-tertiary">{iter.x[1].toFixed(6)}</td>
                    <td class="text-right py-2 px-4 text-tertiary">{iter.x[2].toFixed(6)}</td>
                    <td class="text-right py-2 px-4 {iter.residual < 1e-6 ? 'text-green-400' : 'text-yellow-400'}">
                      {iter.residual.toExponential(3)}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
            {#if jacobiIterations.length > 10}
              <p class="text-muted text-sm mt-2">Showing last 10 iterations</p>
            {/if}
          </div>

          <!-- Convergence Plot -->
          <div>
            <h4 class="text-tertiary font-semibold mb-2">Solution Vector Convergence</h4>
            <Chart
              type="line"
              data={jacobiChartData}
              height="300px"
            />
          </div>

          <!-- Residual Plot -->
          <div>
            <h4 class="text-tertiary font-semibold mb-2">Residual (Log Scale)</h4>
            <Chart
              type="line"
              data={jacobiResidualData}
              options={{
                scales: {
                  y: {
                    type: 'logarithmic'
                  }
                }
              }}
              height="300px"
            />
          </div>

          {#if jacobiIterations[jacobiIterations.length - 1].residual < 1e-6}
            <div class="p-4 bg-green-500/10 border border-green-500">
              <p class="text-primary font-semibold">
                ✓ Converged in {jacobiIterations.length - 1} iterations
              </p>
              <p class="font-mono text-sm mt-2">
                Final solution: x = [{jacobiIterations[jacobiIterations.length - 1].x.map(v => v.toFixed(6)).join(', ')}]
              </p>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </Card>

  <!-- Practice Problem -->
  <Card>
    <div class="p-6">
      <h3 class="text-xl font-semibold text-primary mb-4">Practice Problem</h3>

      <div class="mb-4">
        <p class="text-tertiary mb-2">How many iterations does Jacobi need to converge (residual &lt; 10⁻⁶) for this system?</p>
        <div class="bg-bg-2 p-4 border border-border font-mono text-sm">
          <div>5x₁ - 2x₂ + 3x₃ = -1</div>
          <div>-3x₁ + 9x₂ + x₃ = 2</div>
          <div>2x₁ - x₂ - 7x₃ = 3</div>
        </div>
        <p class="text-muted text-sm mt-2">Start from x⁽⁰⁾ = [0, 0, 0]</p>
      </div>

      <div class="space-y-3">
        <div class="flex items-center gap-4">
          <label class="text-tertiary">Number of iterations:</label>
          <Input
            type="number"
            bind:value={jacobiPracticeUserIter}
            class="w-32"
          />
        </div>

        <Button onclick={checkJacobiPractice}>Check Answer</Button>

        {#if jacobiPracticeCorrect !== null}
          <div class="p-4 border {jacobiPracticeCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}">
            {jacobiPracticeCorrect ? '✓ Correct! Jacobi converges in about 10-15 iterations for this system.' : '✗ Try again! Hint: It converges in 10-15 iterations.'}
          </div>
        {/if}
      </div>
    </div>
  </Card>
</div>
