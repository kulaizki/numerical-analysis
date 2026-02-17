<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Badge, Button, Input } from '$lib/components/ui';
  import {
    matrixVectorMultiply,
    normalize,
    rayleighQuotient,
    matrixInverse,
    matrixSubtract,
    drawVectorConvergence
  } from '../utils';

  // === STATE ===
  let inverseMatrix = $state<number[][]>([[6, 5, -5], [2, 6, -2], [2, 5, -1]]);
  let inverseInitial = $state<number[]>([1, 1, 1]);
  let inverseIterations = $state<{step: number; vector: number[]; eigenvalue: number; error: number}[]>([]);
  let inverseMaxIter = $state(10);
  let inverseShift = $state(0);
  let inverseUseShift = $state(false);
  let inverseShowTheory = $state(false);

  // === CHART STATE ===
  let inverseChartData = $state<any>({});
  let inverseChartOptions = $state<any>({
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
  let inverseCanvas: HTMLCanvasElement | undefined = $state();

  // === LOGIC ===
  function runInversePowerMethod() {
    const iterations: typeof inverseIterations = [];
    let v = [...inverseInitial];
    let prevEigenvalue = 0;

    let A = inverseMatrix;
    if (inverseUseShift && inverseShift !== 0) {
      const I = A.map((row, i) => row.map((val, j) => i === j ? inverseShift : 0));
      A = matrixSubtract(A, I);
    }

    const AInv = matrixInverse(A);
    if (!AInv) {
      alert('Matrix is singular or shift equals an eigenvalue');
      return;
    }

    for (let i = 0; i < inverseMaxIter; i++) {
      const Av = matrixVectorMultiply(AInv, v);
      v = normalize(Av);
      let eigenvalue = rayleighQuotient(inverseMatrix, v);
      const error = Math.abs(eigenvalue - prevEigenvalue);

      iterations.push({
        step: i + 1,
        vector: [...v],
        eigenvalue,
        error
      });

      prevEigenvalue = eigenvalue;
    }

    inverseIterations = iterations;
    updateInverseChart();
  }

  function updateInverseChart() {
    inverseChartData = {
      labels: inverseIterations.map(it => it.step.toString()),
      datasets: [{
        label: 'Error',
        data: inverseIterations.map(it => it.error || 1e-10),
        borderColor: '#f59e0b',
        backgroundColor: '#f59e0b',
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

  const inverseProblems: PowerProblem[] = [
    { matrix: [[4, 1], [2, 3]], initial: [1, 1], targetEigenvalue: 2 },
    { matrix: [[5, 2], [1, 4]], initial: [1, 0], targetEigenvalue: 3 },
    { matrix: [[3, -1], [1, 1]], initial: [1, 1], targetEigenvalue: 2 }
  ];

  let inverseProblemAnswers = $state<string[]>(inverseProblems.map(() => ''));
  let inverseProblemSubmitted = $state<boolean[]>(inverseProblems.map(() => false));

  function checkInverseAnswer(index: number): boolean {
    const answer = parseFloat(inverseProblemAnswers[index]);
    return Math.abs(answer - inverseProblems[index].targetEigenvalue) < 0.1;
  }

  // === EFFECTS ===
  $effect(() => {
    if (inverseCanvas && inverseIterations.length > 0) {
      drawVectorConvergence(inverseCanvas, inverseIterations, '#f59e0b');
    }
  });
</script>

<section>
  <h2 class="text-xl font-bold text-primary mb-4">Inverse Power Method</h2>
  <p class="text-muted mb-6">
    Finds the smallest eigenvalue (or eigenvalue closest to a shift value).
  </p>

  <!-- Theory -->
  <Card class="mb-6">
    <button
      class="w-full flex items-center justify-between text-lg font-semibold text-primary"
      onclick={() => inverseShowTheory = !inverseShowTheory}
    >
      <span>Theory</span>
      <span class="text-2xl">{inverseShowTheory ? '−' : '+'}</span>
    </button>

    {#if inverseShowTheory}
      <div class="mt-4 space-y-4 text-muted">
        <p>
          The inverse power method applies the power method to A^-1, finding the smallest eigenvalue of A.
        </p>
        <div class="space-y-2">
          <p class="font-semibold text-primary">Algorithm:</p>
          <KaTeX math={'v^{(k+1)} = \\frac{A^{-1}v^{(k)}}{\\|A^{-1}v^{(k)}\\|}'} displayMode={true} />
          <p class="text-sm">Converges to the eigenvector corresponding to the smallest eigenvalue.</p>
        </div>
        <div class="space-y-2">
          <p class="font-semibold text-primary">Shifted Inverse Power Method:</p>
          <KaTeX math={'v^{(k+1)} = \\frac{(A - \\sigma I)^{-1}v^{(k)}}{\\|(A - \\sigma I)^{-1}v^{(k)}\\|}'} displayMode={true} />
          <p class="text-sm">Finds eigenvalue closest to shift sigma. Faster convergence when sigma is near target eigenvalue.</p>
        </div>
        <div class="p-3 bg-bg-3 border border-border">
          <p class="text-sm font-semibold text-primary mb-2">Use Cases:</p>
          <ul class="text-xs space-y-1 list-disc list-inside">
            <li>Finding smallest eigenvalue (no shift)</li>
            <li>Finding specific eigenvalue near known value (with shift)</li>
            <li>Faster convergence than power method when eigenvalue is well-separated</li>
          </ul>
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
          {#each inverseMatrix as row, i}
            {#each row as val, j}
              <Input
                type="number"
                value={val.toString()}
                mono={true}
                class="text-center"
                oninput={(e) => inverseMatrix[i][j] = parseFloat((e.target as HTMLInputElement).value) || 0}
              />
            {/each}
          {/each}
        </div>
      </div>

      <div>
        <p class="text-sm text-muted mb-2">Initial Vector v(0)</p>
        <div class="grid grid-cols-3 gap-2">
          {#each inverseInitial as val, i}
            <Input
              type="number"
              value={val.toString()}
              mono={true}
              class="text-center"
              oninput={(e) => inverseInitial[i] = parseFloat((e.target as HTMLInputElement).value) || 0}
            />
          {/each}
        </div>

        <div class="mt-4">
          <p class="text-sm text-muted mb-2">Max Iterations</p>
          <Input
            type="number"
            bind:value={inverseMaxIter}
            mono={true}
            min={1}
            max={50}
          />
        </div>
      </div>
    </div>

    <div class="mb-6 p-4 bg-bg-3 border border-border">
      <label class="flex items-center gap-2 text-sm text-primary cursor-pointer">
        <input type="checkbox" bind:checked={inverseUseShift} class="accent-primary" />
        <span>Use shifted inverse power (find eigenvalue near sigma)</span>
      </label>

      {#if inverseUseShift}
        <div class="mt-3">
          <Input
            label="Shift sigma"
            type="number"
            bind:value={inverseShift}
            mono={true}
            step="0.1"
            placeholder="Enter shift value"
          />
        </div>
      {/if}
    </div>

    <Button onclick={runInversePowerMethod}>Run Inverse Power Method</Button>
  </Card>

  {#if inverseIterations.length > 0}
    <!-- Visualization -->
    <Card class="mb-6">
      <h3 class="text-lg font-semibold text-primary mb-4">Eigenvector Convergence (2D projection)</h3>
      <div class="w-full overflow-x-auto">
        <canvas
          bind:this={inverseCanvas}
          style="width: 100%; height: 400px;"
          class="border border-border bg-bg-3"
        ></canvas>
      </div>
    </Card>

    <!-- Convergence Chart -->
    <Card class="mb-6">
      <h3 class="text-lg font-semibold text-primary mb-4">Convergence Rate</h3>
      <Chart type="line" data={inverseChartData} options={inverseChartOptions} height="300px" />
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
            {#each inverseIterations as it}
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
          {inverseUseShift ? 'Nearest' : 'Smallest'} Eigenvalue: {inverseIterations[inverseIterations.length - 1].eigenvalue.toFixed(6)}
        </p>
        <p class="font-mono text-muted text-xs mt-1">
          Eigenvector: [{inverseIterations[inverseIterations.length - 1].vector.map(v => v.toFixed(4)).join(', ')}]
        </p>
      </div>
    </Card>
  {/if}

  <!-- Practice Problems -->
  <Card>
    <h3 class="text-lg font-semibold text-primary mb-4">Practice Problems</h3>
    <p class="text-sm text-muted mb-6">
      Use the inverse power method to find the smallest eigenvalue of each matrix.
    </p>

    {#each inverseProblems as problem, idx}
      <div class="mb-6 pb-6 {idx < inverseProblems.length - 1 ? 'border-b border-border' : ''}">
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
              label="Smallest eigenvalue"
              type="number"
              bind:value={inverseProblemAnswers[idx]}
              mono={true}
              step="0.01"
              placeholder="Enter eigenvalue"
            />
          </div>
          <Button onclick={() => inverseProblemSubmitted[idx] = true}>Check</Button>
        </div>

        {#if inverseProblemSubmitted[idx]}
          <div class="mt-2">
            {#if checkInverseAnswer(idx)}
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
