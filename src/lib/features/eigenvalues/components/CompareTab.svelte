<script lang="ts">
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Button, Input } from '$lib/components/ui';
  import {
    matrixVectorMultiply,
    normalize,
    rayleighQuotient,
    matrixInverse,
    qrFactorization,
    matrixMultiply
  } from '../utils';

  // === STATE ===
  let compareMatrix = $state<number[][]>([[6, 5, -5], [2, 6, -2], [2, 5, -1]]);
  let compareMaxIter = $state(15);
  let compareResults = $state<{
    power: number[];
    inverse: number[];
    qr: number[][];
  }>({ power: [], inverse: [], qr: [] });

  // === CHART STATE ===
  let compareChartData = $state<any>({});
  let compareChartOptions = $state<any>({
    scales: {
      y: {
        title: { display: true, text: 'Eigenvalue Estimate', color: '#a1a1aa' }
      },
      x: {
        title: { display: true, text: 'Iteration', color: '#a1a1aa' }
      }
    }
  });

  // === LOGIC ===
  function runComparison() {
    // Power method
    const powerData: number[] = [];
    let v = [1, 1, 1];
    for (let i = 0; i < compareMaxIter; i++) {
      const Av = matrixVectorMultiply(compareMatrix, v);
      v = normalize(Av);
      powerData.push(rayleighQuotient(compareMatrix, v));
    }

    // Inverse power method
    const inverseData: number[] = [];
    const AInv = matrixInverse(compareMatrix);
    if (AInv) {
      v = [1, 1, 1];
      for (let i = 0; i < compareMaxIter; i++) {
        const Av = matrixVectorMultiply(AInv, v);
        v = normalize(Av);
        inverseData.push(rayleighQuotient(compareMatrix, v));
      }
    }

    // QR algorithm
    const qrData: number[][] = [];
    let A = compareMatrix.map(row => [...row]);
    for (let i = 0; i < compareMaxIter; i++) {
      const { Q, R } = qrFactorization(A);
      A = matrixMultiply(R, Q);
      qrData.push(A.map((row, i) => row[i]));
    }

    compareResults = { power: powerData, inverse: inverseData, qr: qrData };
    updateCompareChart();
  }

  function updateCompareChart() {
    const labels = Array.from({ length: compareMaxIter }, (_, i) => (i + 1).toString());
    compareChartData = {
      labels,
      datasets: [
        {
          label: 'Power (-> max)',
          data: compareResults.power,
          borderColor: '#818cf8',
          backgroundColor: '#818cf8',
          tension: 0.1
        },
        {
          label: 'Inverse (-> min)',
          data: compareResults.inverse,
          borderColor: '#f59e0b',
          backgroundColor: '#f59e0b',
          tension: 0.1
        },
        ...(compareResults.qr[0] || []).map((_, i) => ({
          label: `QR lambda${i + 1}`,
          data: compareResults.qr.map(eigs => eigs[i]),
          borderColor: ['#a855f7', '#ec4899', '#8b5cf6'][i],
          backgroundColor: ['#a855f7', '#ec4899', '#8b5cf6'][i],
          tension: 0.1,
          borderDash: [5, 5]
        }))
      ]
    };
  }
</script>

<section>
  <h2 class="text-xl font-semibold text-accent mb-4">Method Comparison</h2>
  <p class="text-muted mb-6">
    Compare convergence speed and behavior of all three methods on the same matrix.
  </p>

  <!-- Interactive Demo -->
  <Card class="mb-6">
    <h3 class="text-lg font-semibold text-primary mb-4">Run All Methods</h3>

    <div class="grid grid-cols-2 gap-6 mb-6">
      <div>
        <p class="text-sm text-muted mb-2">Matrix A (3x3)</p>
        <div class="grid grid-cols-3 gap-2">
          {#each compareMatrix as row, i}
            {#each row as val, j}
              <Input
                type="number"
                value={val.toString()}
                mono={true}
                class="text-center"
                oninput={(e) => compareMatrix[i][j] = parseFloat((e.target as HTMLInputElement).value) || 0}
              />
            {/each}
          {/each}
        </div>
      </div>

      <div>
        <p class="text-sm text-muted mb-2">Max Iterations</p>
        <Input
          type="number"
          bind:value={compareMaxIter}
          mono={true}
          min={1}
          max={50}
        />
      </div>
    </div>

    <Button onclick={runComparison}>Run Comparison</Button>
  </Card>

  {#if compareResults.power.length > 0}
    <!-- Comparison Chart -->
    <Card class="mb-6">
      <h3 class="text-lg font-semibold text-primary mb-4">Convergence Comparison</h3>
      <Chart type="line" data={compareChartData} options={compareChartOptions} height="400px" />
    </Card>

    <!-- Summary Table -->
    <Card>
      <h3 class="text-lg font-semibold text-primary mb-4">Summary</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="border-b border-border">
            <tr class="text-left text-muted">
              <th class="p-2">Method</th>
              <th class="p-2">Target</th>
              <th class="p-2">Final Estimate</th>
              <th class="p-2">Iterations</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-border">
              <td class="p-2 text-primary">Power Method</td>
              <td class="p-2 text-muted">Largest eigenvalue</td>
              <td class="p-2 font-mono text-accent">{compareResults.power[compareResults.power.length - 1].toFixed(6)}</td>
              <td class="p-2 text-tertiary">{compareResults.power.length}</td>
            </tr>
            <tr class="border-b border-border">
              <td class="p-2 text-primary">Inverse Power</td>
              <td class="p-2 text-muted">Smallest eigenvalue</td>
              <td class="p-2 font-mono text-accent">{compareResults.inverse[compareResults.inverse.length - 1].toFixed(6)}</td>
              <td class="p-2 text-tertiary">{compareResults.inverse.length}</td>
            </tr>
            <tr class="border-b border-border">
              <td class="p-2 text-primary">QR Algorithm</td>
              <td class="p-2 text-muted">All eigenvalues</td>
              <td class="p-2 font-mono text-accent">[{compareResults.qr[compareResults.qr.length - 1].map(v => v.toFixed(4)).join(', ')}]</td>
              <td class="p-2 text-tertiary">{compareResults.qr.length}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 p-4 bg-bg-3 border border-border">
        <p class="text-sm font-semibold text-primary mb-2">Key Observations</p>
        <ul class="text-sm text-muted space-y-1 list-disc list-inside">
          <li>Power method converges to largest eigenvalue (dominant)</li>
          <li>Inverse power method converges to smallest eigenvalue</li>
          <li>QR algorithm finds all eigenvalues simultaneously</li>
          <li>Convergence rate depends on eigenvalue separation</li>
          <li>QR is most efficient for finding all eigenvalues</li>
        </ul>
      </div>
    </Card>
  {/if}
</section>
