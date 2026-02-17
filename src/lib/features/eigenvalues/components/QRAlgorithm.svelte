<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Badge, Button, Input } from '$lib/components/ui';
  import { qrFactorization, matrixMultiply } from '../utils';

  // === STATE ===
  let qrMatrix = $state<number[][]>([[6, 5, -5], [2, 6, -2], [2, 5, -1]]);
  let qrIterations = $state<{step: number; A: number[][]; Q: number[][]; R: number[][]; eigenvalues: number[]}[]>([]);
  let qrMaxIter = $state(10);
  let qrShowTheory = $state(false);

  // === CHART STATE ===
  let qrChartData = $state<any>({});
  let qrChartOptions = $state<any>({
    scales: {
      y: {
        title: { display: true, text: 'Diagonal Value', color: '#a1a1aa' }
      },
      x: {
        title: { display: true, text: 'Iteration', color: '#a1a1aa' }
      }
    }
  });

  // === LOGIC ===
  function runQRAlgorithm() {
    const iterations: typeof qrIterations = [];
    let A = qrMatrix.map(row => [...row]);

    for (let i = 0; i < qrMaxIter; i++) {
      const { Q, R } = qrFactorization(A);
      A = matrixMultiply(R, Q);

      const eigenvalues = A.map((row, i) => row[i]);

      iterations.push({
        step: i + 1,
        A: A.map(row => [...row]),
        Q: Q.map(row => [...row]),
        R: R.map(row => [...row]),
        eigenvalues
      });
    }

    qrIterations = iterations;
    updateQRChart();
  }

  function updateQRChart() {
    const n = qrMatrix.length;
    qrChartData = {
      labels: qrIterations.map(it => it.step.toString()),
      datasets: Array(n).fill(0).map((_, i) => ({
        label: `lambda${i + 1}`,
        data: qrIterations.map(it => it.eigenvalues[i]),
        borderColor: ['#818cf8', '#f59e0b', '#a855f7'][i],
        backgroundColor: ['#818cf8', '#f59e0b', '#a855f7'][i],
        tension: 0.1
      }))
    };
  }

  // === PRACTICE PROBLEMS ===
  type QRProblem = {
    matrix: number[][];
    eigenvalues: number[];
  };

  const qrProblems: QRProblem[] = [
    { matrix: [[4, 1], [2, 3]], eigenvalues: [2, 5] },
    { matrix: [[5, 2], [1, 4]], eigenvalues: [3, 6] },
    { matrix: [[3, -1], [1, 1]], eigenvalues: [2, 2] }
  ];

  let qrProblemAnswers = $state<string[]>(qrProblems.map(() => ''));
  let qrProblemSubmitted = $state<boolean[]>(qrProblems.map(() => false));

  function checkQRAnswer(index: number): boolean {
    const answer = qrProblemAnswers[index].split(',').map(s => parseFloat(s.trim())).sort();
    const correct = [...qrProblems[index].eigenvalues].sort();
    if (answer.length !== correct.length) return false;
    return answer.every((val, i) => Math.abs(val - correct[i]) < 0.1);
  }
</script>

<section>
  <h2 class="text-xl font-semibold text-accent mb-4">QR Algorithm</h2>
  <p class="text-muted mb-6">
    Iterative method for finding all eigenvalues simultaneously using QR factorization.
  </p>

  <!-- Theory -->
  <Card class="mb-6">
    <button
      class="w-full flex items-center justify-between text-lg font-semibold text-primary"
      onclick={() => qrShowTheory = !qrShowTheory}
    >
      <span>Theory</span>
      <span class="text-2xl">{qrShowTheory ? '−' : '+'}</span>
    </button>

    {#if qrShowTheory}
      <div class="mt-4 space-y-4 text-muted">
        <p>
          The QR algorithm finds all eigenvalues by repeatedly factorizing the matrix into orthogonal Q and upper triangular R matrices.
        </p>
        <div class="space-y-2">
          <p class="font-semibold text-primary">Algorithm:</p>
          <KaTeX math={'A_k = Q_k R_k \\quad \\text{(QR factorization)}'} displayMode={true} />
          <KaTeX math={'A_{k+1} = R_k Q_k'} displayMode={true} />
          <p class="text-sm">As k approaches infinity, A_k converges to upper triangular form with eigenvalues on diagonal.</p>
        </div>
        <div class="p-3 bg-bg-3 border border-border">
          <p class="text-sm font-semibold text-primary mb-2">Key Properties:</p>
          <ul class="text-xs space-y-1 list-disc list-inside">
            <li>A_k is similar to A (same eigenvalues)</li>
            <li>Finds all eigenvalues simultaneously</li>
            <li>Typically faster than power methods for multiple eigenvalues</li>
            <li>Can be accelerated with shifts</li>
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
          {#each qrMatrix as row, i}
            {#each row as val, j}
              <Input
                type="number"
                value={val.toString()}
                mono={true}
                class="text-center"
                oninput={(e) => qrMatrix[i][j] = parseFloat((e.target as HTMLInputElement).value) || 0}
              />
            {/each}
          {/each}
        </div>
      </div>

      <div>
        <p class="text-sm text-muted mb-2">Max Iterations</p>
        <Input
          type="number"
          bind:value={qrMaxIter}
          mono={true}
          min={1}
          max={50}
        />
      </div>
    </div>

    <Button onclick={runQRAlgorithm}>Run QR Algorithm</Button>
  </Card>

  {#if qrIterations.length > 0}
    <!-- Convergence Chart -->
    <Card class="mb-6">
      <h3 class="text-lg font-semibold text-primary mb-4">Eigenvalue Convergence</h3>
      <Chart type="line" data={qrChartData} options={qrChartOptions} height="300px" />
    </Card>

    <!-- Iteration Table -->
    <Card class="mb-6">
      <h3 class="text-lg font-semibold text-primary mb-4">Iteration Details</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="border-b border-border">
            <tr class="text-left text-muted">
              <th class="p-2">Step</th>
              <th class="p-2">Matrix A_k (diagonal)</th>
              <th class="p-2">Eigenvalue Estimates</th>
            </tr>
          </thead>
          <tbody>
            {#each qrIterations.slice(0, 10) as it}
              <tr class="border-b border-border font-mono text-xs">
                <td class="p-2 text-primary">{it.step}</td>
                <td class="p-2 text-muted">
                  {#each it.A as row, i}
                    <div>[{row.map((v, j) => i === j ? v.toFixed(4) : '...').join(', ')}]</div>
                  {/each}
                </td>
                <td class="p-2 text-accent">[{it.eigenvalues.map(v => v.toFixed(4)).join(', ')}]</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="mt-4 p-3 bg-bg-3 border border-border">
        <p class="text-sm font-semibold text-primary mb-1">Final Result</p>
        <p class="font-mono text-accent">
          Eigenvalues: [{qrIterations[qrIterations.length - 1].eigenvalues.map(v => v.toFixed(6)).join(', ')}]
        </p>
      </div>
    </Card>
  {/if}

  <!-- Practice Problems -->
  <Card>
    <h3 class="text-lg font-semibold text-primary mb-4">Practice Problems</h3>
    <p class="text-sm text-muted mb-6">
      Use the QR algorithm to find all eigenvalues of each matrix. Enter as comma-separated values.
    </p>

    {#each qrProblems as problem, idx}
      <div class="mb-6 pb-6 {idx < qrProblems.length - 1 ? 'border-b border-border' : ''}">
        <p class="text-sm font-semibold text-primary mb-2">Problem {idx + 1}</p>
        <div class="mb-3">
          <p class="text-xs text-muted mb-1">Matrix A:</p>
          <div class="font-mono text-sm text-accent">
            {#each problem.matrix as row}
              <div>[{row.join(', ')}]</div>
            {/each}
          </div>
        </div>

        <div class="flex gap-2 items-end">
          <div class="flex-1">
            <Input
              label="Eigenvalues (comma-separated)"
              type="text"
              bind:value={qrProblemAnswers[idx]}
              mono={true}
              placeholder="e.g., 2, 5"
            />
          </div>
          <Button onclick={() => qrProblemSubmitted[idx] = true}>Check</Button>
        </div>

        {#if qrProblemSubmitted[idx]}
          <div class="mt-2">
            {#if checkQRAnswer(idx)}
              <Badge color="#10b981">Correct! lambda = {problem.eigenvalues.join(', ')}</Badge>
            {:else}
              <Badge color="#ef4444">Incorrect. Remember to find all eigenvalues.</Badge>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </Card>
</section>
