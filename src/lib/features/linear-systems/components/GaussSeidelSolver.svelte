<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Button, Input } from '$lib/components/ui';
  import { DEFAULT_A, DEFAULT_B, type IterationEntry } from '../types.ts';
  import {
    deepCopyMatrix,
    checkDiagonalDominance,
    seidelIteration,
    calculateResidual
  } from '../utils.ts';

  let seidelA = $state(deepCopyMatrix(DEFAULT_A));
  let seidelB = $state([...DEFAULT_B]);
  let seidelX0 = $state([0, 0, 0]);
  let seidelIterations = $state<IterationEntry[]>([]);
  let seidelCurrentIter = $state(0);
  let seidelRunning = $state(false);
  let seidelShowTheory = $state(false);

  function resetSeidel() {
    seidelIterations = [];
    seidelCurrentIter = 0;
    seidelRunning = false;
  }

  async function runSeidel() {
    resetSeidel();

    if (!checkDiagonalDominance(seidelA)) {
      alert('Warning: Matrix is not diagonally dominant. Convergence not guaranteed!');
    }

    seidelRunning = true;
    let x = [...seidelX0];

    seidelIterations.push({
      n: 0,
      x: [...x],
      residual: calculateResidual(seidelA, seidelB, x)
    });

    for (let iter = 0; iter < 30; iter++) {
      x = seidelIteration(seidelA, seidelB, x);
      const residual = calculateResidual(seidelA, seidelB, x);

      seidelIterations = [...seidelIterations, {
        n: iter + 1,
        x: [...x],
        residual
      }];

      seidelCurrentIter = seidelIterations.length;

      await new Promise(resolve => setTimeout(resolve, 200));

      if (residual < 1e-6) break;
    }

    seidelRunning = false;
  }

  let seidelChartData = $derived({
    labels: seidelIterations.map(iter => iter.n.toString()),
    datasets: [
      {
        label: 'x₁',
        data: seidelIterations.map(iter => iter.x[0]),
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1
      },
      {
        label: 'x₂',
        data: seidelIterations.map(iter => iter.x[1]),
        borderColor: 'rgb(139, 92, 246)',
        tension: 0.1
      },
      {
        label: 'x₃',
        data: seidelIterations.map(iter => iter.x[2]),
        borderColor: 'rgb(236, 72, 153)',
        tension: 0.1
      }
    ]
  });

  let seidelResidualData = $derived({
    labels: seidelIterations.map(iter => iter.n.toString()),
    datasets: [{
      label: 'Residual',
      data: seidelIterations.map(iter => iter.residual),
      borderColor: 'rgb(34, 197, 94)',
      tension: 0.1
    }]
  });

  let showExample = $state(false);

  // Practice problem
  let seidelPracticeUserIter = $state('');
  let seidelPracticeCorrect = $state<boolean | null>(null);

  function checkSeidelPractice() {
    const userIter = parseInt(seidelPracticeUserIter);
    seidelPracticeCorrect = userIter >= 3 && userIter <= 12;
  }
</script>

<div class="space-y-6">
  <!-- Theory -->
  <Card>
    <button
      class="w-full flex items-center justify-between p-4"
      onclick={() => seidelShowTheory = !seidelShowTheory}
    >
      <h3 class="text-xl font-semibold text-primary">Theory</h3>
      <span class="text-muted">{seidelShowTheory ? '▼' : '▶'}</span>
    </button>
    {#if seidelShowTheory}
      <div class="px-4 pb-4 space-y-4 text-tertiary">
        <p>
          The Gauss-Seidel method improves upon Jacobi by using the most recently computed values immediately, leading to faster convergence.
        </p>
        <div class="space-y-2">
          <p class="font-semibold text-primary">Iteration Formula:</p>
          <KaTeX
            math={'x_i^{(k+1)} = \\frac{1}{a_{ii}} \\left( b_i - \\sum_{j < i} a_{ij} x_j^{(k+1)} - \\sum_{j > i} a_{ij} x_j^{(k)} \\right)'}
            displayMode
          />
          <p class="mt-4">
            Notice that for j &lt; i, we use the <strong>new</strong> values x<sub>j</sub><sup>(k+1)</sup>, while for j &gt; i we still use the old values x<sub>j</sub><sup>(k)</sup>.
          </p>
        </div>
        <p class="text-sm">
          <strong>Advantage:</strong> Typically converges about twice as fast as Jacobi for the same system.
        </p>
      </div>
    {/if}
  </Card>

  <!-- Diagonal Dominance Check -->
  <Card>
    <div class="p-6">
      <h3 class="text-xl font-semibold text-primary mb-4">Diagonal Dominance Check</h3>

      {#if true}
        {@const isDominant = checkDiagonalDominance(seidelA)}
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
        <Button onclick={runSeidel} disabled={seidelRunning}>
          {seidelRunning ? 'Running...' : 'Run Iterations'}
        </Button>
        <Button onclick={resetSeidel} disabled={seidelIterations.length === 0 || seidelRunning}>
          Reset
        </Button>
      </div>

      {#if seidelIterations.length > 0}
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
                {#each seidelIterations.slice(-10) as iter}
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
            {#if seidelIterations.length > 10}
              <p class="text-muted text-sm mt-2">Showing last 10 iterations</p>
            {/if}
          </div>

          <!-- Convergence Plot -->
          <div>
            <h4 class="text-tertiary font-semibold mb-2">Solution Vector Convergence</h4>
            <Chart
              type="line"
              data={seidelChartData}
              height="300px"
            />
          </div>

          <!-- Residual Plot -->
          <div>
            <h4 class="text-tertiary font-semibold mb-2">Residual (Log Scale)</h4>
            <Chart
              type="line"
              data={seidelResidualData}
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

          {#if seidelIterations[seidelIterations.length - 1].residual < 1e-6}
            <div class="p-4 bg-green-500/10 border border-green-500">
              <p class="text-primary font-semibold">
                ✓ Converged in {seidelIterations.length - 1} iterations
              </p>
              <p class="font-mono text-sm mt-2">
                Final solution: x = [{seidelIterations[seidelIterations.length - 1].x.map(v => v.toFixed(6)).join(', ')}]
              </p>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </Card>

  <!-- Worked Example -->
  <Card>
    <button
      class="w-full flex items-center justify-between p-4"
      onclick={() => showExample = !showExample}
    >
      <h3 class="text-xl font-semibold text-primary">Worked Example</h3>
      <span class="text-muted">{showExample ? '▼' : '▶'}</span>
    </button>
    {#if showExample}
      <div class="px-4 pb-4 space-y-6 text-tertiary">
        <div>
          <p class="font-semibold text-primary mb-2">System:</p>
          <div class="bg-bg-2 p-4 border border-border font-mono text-sm space-y-1">
            <div>6x₁ − 2x₂ + x₃ = 11</div>
            <div>−2x₁ + 7x₂ + 2x₃ = 5</div>
            <div>x₁ + 2x₂ − 5x₃ = −1</div>
          </div>
        </div>

        <div>
          <p class="font-semibold text-primary mb-2">Matrix Update Formula:</p>
          <KaTeX math={"\\mathbf{x}^{(k+1)} = -(L+D)^{-1}U\\mathbf{x}^{(k)} + (L+D)^{-1}\\mathbf{b}"} displayMode={true} />
          <p class="text-sm mt-2">
            Unlike Jacobi, updated components are used immediately within the same iteration.
          </p>
        </div>

        <div>
          <p class="font-semibold text-primary mb-2">Iterations from x⁽⁰⁾ = (0, 0, 0):</p>
          <div class="overflow-x-auto">
            <table class="w-full font-mono text-sm border border-border">
              <thead>
                <tr class="border-b border-border bg-bg-2">
                  <th class="text-center py-2 px-4 text-tertiary">k</th>
                  <th class="text-right py-2 px-4 text-tertiary">x₁</th>
                  <th class="text-right py-2 px-4 text-tertiary">x₂</th>
                  <th class="text-right py-2 px-4 text-tertiary">x₃</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-border/50">
                  <td class="text-center py-2 px-4 text-muted">0</td>
                  <td class="text-right py-2 px-4">0.0000</td>
                  <td class="text-right py-2 px-4">0.0000</td>
                  <td class="text-right py-2 px-4">0.0000</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="text-center py-2 px-4 text-muted">1</td>
                  <td class="text-right py-2 px-4">1.8333</td>
                  <td class="text-right py-2 px-4">1.2381</td>
                  <td class="text-right py-2 px-4">1.0619</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="text-center py-2 px-4 text-muted">2</td>
                  <td class="text-right py-2 px-4">2.0690</td>
                  <td class="text-right py-2 px-4">1.0020</td>
                  <td class="text-right py-2 px-4">1.0146</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="text-center py-2 px-4 text-muted">3</td>
                  <td class="text-right py-2 px-4">2.0015</td>
                  <td class="text-right py-2 px-4">0.9984</td>
                  <td class="text-right py-2 px-4">1.0003</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="text-center py-2 px-4 text-muted">4</td>
                  <td class="text-right py-2 px-4">1.9994</td>
                  <td class="text-right py-2 px-4">1.0000</td>
                  <td class="text-right py-2 px-4">0.9999</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="text-center py-2 px-4 text-muted">5</td>
                  <td class="text-right py-2 px-4 text-green-400">2.0001</td>
                  <td class="text-right py-2 px-4 text-green-400">1.0001</td>
                  <td class="text-right py-2 px-4 text-green-400">1.0001</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-sm mt-2 text-green-400 font-semibold">Converges in ~5 iterations vs Jacobi's 8!</p>
        </div>

        <div class="p-4 border border-border bg-bg-2 space-y-3">
          <p class="font-semibold text-primary">Jacobi vs Gauss-Seidel Comparison:</p>
          <div class="space-y-2 text-sm">
            <div class="flex items-start gap-2">
              <span class="text-yellow-400 font-semibold shrink-0">Jacobi:</span>
              <span>Uses ALL previous iteration values → 8 iterations to converge</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-green-400 font-semibold shrink-0">Gauss-Seidel:</span>
              <span>Uses UPDATED values as soon as available → 5 iterations to converge</span>
            </div>
          </div>
          <p class="text-sm mt-2">
            Gauss-Seidel converges faster because it uses the most recent information at every sub-step of the iteration.
          </p>
        </div>
      </div>
    {/if}
  </Card>

  <!-- Practice Problem -->
  <Card>
    <div class="p-6">
      <h3 class="text-xl font-semibold text-primary mb-4">Practice Problem</h3>

      <div class="mb-4">
        <p class="text-tertiary mb-2">How many iterations does Gauss-Seidel need to converge (residual &lt; 10⁻⁶)?</p>
        <div class="bg-bg-2 p-4 border border-border font-mono text-sm">
          <div>10x₁ - x₂ + 2x₃ = 6</div>
          <div>-x₁ + 11x₂ - x₃ = 25</div>
          <div>2x₁ - x₂ + 10x₃ = -11</div>
        </div>
        <p class="text-muted text-sm mt-2">Start from x⁽⁰⁾ = [0, 0, 0]</p>
      </div>

      <div class="space-y-3">
        <div class="flex items-center gap-4">
          <span class="text-tertiary">Number of iterations:</span>
          <Input
            type="number"
            bind:value={seidelPracticeUserIter}
            class="w-32"
          />
        </div>

        <Button onclick={checkSeidelPractice}>Check Answer</Button>

        {#if seidelPracticeCorrect !== null}
          <div class="p-4 border {seidelPracticeCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}">
            {seidelPracticeCorrect ? '✓ Correct! Gauss-Seidel converges faster, typically in 5-10 iterations.' : '✗ Try again! Hint: It converges in about 5-10 iterations.'}
          </div>
        {/if}
      </div>
    </div>
  </Card>
</div>
