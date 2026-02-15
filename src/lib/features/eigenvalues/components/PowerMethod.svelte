<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Badge, Button, Input } from '$lib/components/ui';
  import {
    matrixVectorMultiply,
    normalize,
    rayleighQuotient,
    drawVectorConvergence
  } from '../utils';

  // === STATE ===
  let powerMatrix = $state<number[][]>([[6, 5, -5], [2, 6, -2], [2, 5, -1]]);
  let powerInitial = $state<number[]>([1, 1, 1]);
  let powerIterations = $state<{step: number; vector: number[]; eigenvalue: number; error: number}[]>([]);
  let powerMaxIter = $state(10);
  let powerShowTheory = $state(false);

  // === CHART STATE ===
  let powerChartData = $state<any>({});
  let powerChartOptions = $state<any>({
    scales: {
      y: {
        type: 'logarithmic',
        title: { display: true, text: 'Error', color: '#a1a1aa' }
      },
      x: {
        title: { display: true, text: 'Iteration', color: '#a1a1aa' }
      }
    }
  });

  // === CANVAS ===
  let powerCanvas: HTMLCanvasElement;

  // === LOGIC ===
  function runPowerMethod() {
    const iterations: typeof powerIterations = [];
    let v = [...powerInitial];
    let prevEigenvalue = 0;

    for (let i = 0; i < powerMaxIter; i++) {
      const Av = matrixVectorMultiply(powerMatrix, v);
      v = normalize(Av);
      const eigenvalue = rayleighQuotient(powerMatrix, v);
      const error = Math.abs(eigenvalue - prevEigenvalue);

      iterations.push({
        step: i + 1,
        vector: [...v],
        eigenvalue,
        error
      });

      prevEigenvalue = eigenvalue;
    }

    powerIterations = iterations;
    updatePowerChart();
  }

  function updatePowerChart() {
    powerChartData = {
      labels: powerIterations.map(it => it.step.toString()),
      datasets: [{
        label: 'Error',
        data: powerIterations.map(it => it.error || 1e-10),
        borderColor: '#818cf8',
        backgroundColor: '#818cf8',
        tension: 0.1
      }]
    };
  }

  // === PRACTICE PROBLEMS ===
  type PowerProblem = {
    matrix: number[][];
    initial: number[];
    targetEigenvalue: number;
  };

  const powerProblems: PowerProblem[] = [
    { matrix: [[4, 1], [2, 3]], initial: [1, 1], targetEigenvalue: 5 },
    { matrix: [[3, -1], [1, 1]], initial: [1, 0], targetEigenvalue: 2 },
    { matrix: [[5, 2], [1, 4]], initial: [1, 1], targetEigenvalue: 6 }
  ];

  let powerProblemAnswers = $state<string[]>(powerProblems.map(() => ''));
  let powerProblemSubmitted = $state<boolean[]>(powerProblems.map(() => false));

  function checkPowerAnswer(index: number): boolean {
    const answer = parseFloat(powerProblemAnswers[index]);
    return Math.abs(answer - powerProblems[index].targetEigenvalue) < 0.1;
  }

  // === EFFECTS ===
  $effect(() => {
    if (powerCanvas && powerIterations.length > 0) {
      drawVectorConvergence(powerCanvas, powerIterations, '#818cf8');
    }
  });
</script>

<section>
  <h2 class="text-xl font-bold text-primary mb-4">Power Method</h2>
  <p class="text-muted mb-6">
    Iterative method for finding the dominant eigenvalue and corresponding eigenvector.
  </p>

  <!-- Theory -->
  <Card class="mb-6">
    <button
      class="w-full flex items-center justify-between text-lg font-semibold text-primary"
      onclick={() => powerShowTheory = !powerShowTheory}
    >
      <span>Theory</span>
      <span class="text-2xl">{powerShowTheory ? '−' : '+'}</span>
    </button>

    {#if powerShowTheory}
      <div class="mt-4 space-y-4 text-muted">
        <p>
          The power method finds the eigenvalue with the largest absolute value (dominant eigenvalue) and its corresponding eigenvector.
        </p>
        <div class="space-y-2">
          <p class="font-semibold text-primary">Algorithm:</p>
          <KaTeX math={'v^{(k+1)} = \\frac{Av^{(k)}}{\\|Av^{(k)}\\|}'} displayMode={true} />
          <KaTeX math={'\\lambda^{(k)} = \\frac{(v^{(k)})^T A v^{(k)}}{(v^{(k)})^T v^{(k)}}'} displayMode={true} />
          <p class="text-sm">where the eigenvalue estimate is the Rayleigh quotient.</p>
        </div>
        <div class="p-3 bg-bg-3 border border-border">
          <p class="text-sm font-semibold text-primary mb-2">Convergence Rate:</p>
          <KaTeX math={'e^{(k)} \\approx \\left|\\frac{\\lambda_2}{\\lambda_1}\\right|^k e^{(0)}'} />
          <p class="text-xs mt-2">Linear convergence, rate depends on ratio of two largest eigenvalues.</p>
        </div>
      </div>
    {/if}
  </Card>

  <!-- Interactive Demo -->
  <Card class="mb-6">
    <h3 class="text-lg font-semibold text-primary mb-4">Interactive Demonstration</h3>

    <div class="grid grid-cols-2 gap-6 mb-6">
      <div>
        <p class="text-sm text-muted mb-2">Matrix A (3x3)</p>
        <div class="grid grid-cols-3 gap-2">
          {#each powerMatrix as row, i}
            {#each row as val, j}
              <Input
                type="number"
                value={val.toString()}
                mono={true}
                class="text-center"
                oninput={(e) => powerMatrix[i][j] = parseFloat((e.target as HTMLInputElement).value) || 0}
              />
            {/each}
          {/each}
        </div>
      </div>

      <div>
        <p class="text-sm text-muted mb-2">Initial Vector v(0)</p>
        <div class="grid grid-cols-3 gap-2">
          {#each powerInitial as val, i}
            <Input
              type="number"
              value={val.toString()}
              mono={true}
              class="text-center"
              oninput={(e) => powerInitial[i] = parseFloat((e.target as HTMLInputElement).value) || 0}
            />
          {/each}
        </div>

        <div class="mt-4">
          <p class="text-sm text-muted mb-2">Max Iterations</p>
          <Input
            type="number"
            bind:value={powerMaxIter}
            mono={true}
            min={1}
            max={50}
          />
        </div>
      </div>
    </div>

    <Button onclick={runPowerMethod}>Run Power Method</Button>
  </Card>

  {#if powerIterations.length > 0}
    <!-- Visualization -->
    <Card class="mb-6">
      <h3 class="text-lg font-semibold text-primary mb-4">Eigenvector Convergence (2D projection)</h3>
      <div class="w-full overflow-x-auto">
        <canvas
          bind:this={powerCanvas}
          style="width: 100%; height: 400px;"
          class="border border-border bg-bg-3"
        ></canvas>
      </div>
    </Card>

    <!-- Convergence Chart -->
    <Card class="mb-6">
      <h3 class="text-lg font-semibold text-primary mb-4">Convergence Rate</h3>
      <Chart type="line" data={powerChartData} options={powerChartOptions} height="300px" />
    </Card>

    <!-- Iteration Table -->
    <Card class="mb-6">
      <h3 class="text-lg font-semibold text-primary mb-4">Iteration Details</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="border-b border-border">
            <tr class="text-left text-muted">
              <th class="p-2">Step</th>
              <th class="p-2">Vector v(k)</th>
              <th class="p-2">Eigenvalue lambda(k)</th>
              <th class="p-2">Error</th>
            </tr>
          </thead>
          <tbody>
            {#each powerIterations as it}
              <tr class="border-b border-border font-mono text-xs">
                <td class="p-2 text-primary">{it.step}</td>
                <td class="p-2 text-accent">[{it.vector.map(v => v.toFixed(4)).join(', ')}]</td>
                <td class="p-2 text-tertiary">{it.eigenvalue.toFixed(6)}</td>
                <td class="p-2 text-muted">{it.error.toExponential(2)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="mt-4 p-3 bg-bg-3 border border-border">
        <p class="text-sm font-semibold text-primary mb-1">Final Result</p>
        <p class="font-mono text-accent">
          Dominant Eigenvalue: {powerIterations[powerIterations.length - 1].eigenvalue.toFixed(6)}
        </p>
        <p class="font-mono text-muted text-xs mt-1">
          Eigenvector: [{powerIterations[powerIterations.length - 1].vector.map(v => v.toFixed(4)).join(', ')}]
        </p>
      </div>
    </Card>
  {/if}

  <!-- Practice Problems -->
  <Card>
    <h3 class="text-lg font-semibold text-primary mb-4">Practice Problems</h3>
    <p class="text-sm text-muted mb-6">
      Use the power method to find the dominant eigenvalue of each matrix.
    </p>

    {#each powerProblems as problem, idx}
      <div class="mb-6 pb-6 {idx < powerProblems.length - 1 ? 'border-b border-border' : ''}">
        <p class="text-sm font-semibold text-primary mb-2">Problem {idx + 1}</p>
        <div class="flex items-start gap-4 mb-3">
          <div>
            <p class="text-xs text-muted mb-1">Matrix A:</p>
            <div class="font-mono text-sm text-accent">
              {#each problem.matrix as row}
                <div>[{row.join(', ')}]</div>
              {/each}
            </div>
          </div>
          <div>
            <p class="text-xs text-muted mb-1">Initial v(0):</p>
            <div class="font-mono text-sm text-accent">[{problem.initial.join(', ')}]</div>
          </div>
        </div>

        <div class="flex gap-2 items-end">
          <div class="flex-1">
            <Input
              label="Dominant eigenvalue"
              type="number"
              bind:value={powerProblemAnswers[idx]}
              mono={true}
              step="0.01"
              placeholder="Enter eigenvalue"
            />
          </div>
          <Button onclick={() => powerProblemSubmitted[idx] = true}>Check</Button>
        </div>

        {#if powerProblemSubmitted[idx]}
          <div class="mt-2">
            {#if checkPowerAnswer(idx)}
              <Badge color="#10b981">Correct! lambda = {problem.targetEigenvalue}</Badge>
            {:else}
              <Badge color="#ef4444">Incorrect. Try again or run more iterations.</Badge>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </Card>
</section>
