<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Badge } from '$lib/components/ui';

  let iterations = $state(15);
  let chartData = $state<any>({});
  let chartOptions = $state<any>({});

  function generateConvergenceData(n: number) {
    const labels = Array.from({ length: n }, (_, i) => i.toString());
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio

    const linear = Array.from({ length: n }, (_, i) => Math.pow(0.5, i));
    const quadratic = Array.from({ length: n }, (_, i) => Math.pow(0.5, Math.pow(2, i)));
    const superlinear = Array.from({ length: n }, (_, i) => Math.pow(0.5, Math.pow(phi, i)));

    chartData = {
      labels,
      datasets: [
        {
          label: 'Linear (r=1)',
          data: linear,
          borderColor: '#a5b4fc',
          backgroundColor: '#a5b4fc',
          tension: 0.1
        },
        {
          label: 'Quadratic (r=2)',
          data: quadratic,
          borderColor: '#f59e0b',
          backgroundColor: '#f59e0b',
          tension: 0.1
        },
        {
          label: 'Superlinear (r≈1.618)',
          data: superlinear,
          borderColor: '#a855f7',
          backgroundColor: '#a855f7',
          tension: 0.1
        }
      ]
    };

    chartOptions = {
      scales: {
        y: {
          type: 'logarithmic',
          ticks: { color: '#a1a1aa' },
          grid: { color: '#27272a' }
        },
        x: {
          ticks: { color: '#a1a1aa' },
          grid: { color: '#27272a' }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#fafafa' }
        }
      }
    };
  }

  $effect(() => {
    generateConvergenceData(iterations);
  });
</script>

<Card class="mb-6">
  <h3 class="text-lg font-semibold text-primary mb-3">Theory</h3>
  <p class="text-sm text-muted mb-4">
    A sequence {'{'}α<sub>n</sub>{'}'} converges to zero with rate <KaTeX math={'r'} /> if:
  </p>
  <KaTeX math={'|\\alpha_{n+1}| \\leq C|\\alpha_n|^r'} displayMode={true} />
  <div class="mt-4 space-y-2 text-sm text-muted">
    <div><Badge color="#a5b4fc">r = 1</Badge> Linear convergence (e.g., O(h))</div>
    <div><Badge color="#f59e0b">r = 2</Badge> Quadratic convergence (e.g., O(h²))</div>
    <div><Badge color="#a855f7">1 &lt; r &lt; 2</Badge> Superlinear convergence</div>
  </div>
</Card>

<Card class="mb-6">
  <h3 class="text-lg font-semibold text-primary mb-4">Convergence Visualization</h3>
  <div class="mb-4">
    <label class="block text-sm text-muted mb-2">
      Number of iterations: {iterations}
    </label>
    <input
      type="range"
      bind:value={iterations}
      min="1"
      max="20"
      class="w-full h-2 bg-bg-3 appearance-none cursor-pointer"
      style="accent-color: #818cf8;"
    />
  </div>

  <div class="mb-4">
    <Chart data={chartData} options={chartOptions} height="400px" />
  </div>

  <div class="grid grid-cols-3 gap-4 text-xs">
    <div class="p-3 bg-bg-3 border border-border">
      <p class="text-muted mb-1">Linear (r=1)</p>
      <p class="font-mono text-primary">αₙ = 0.5ⁿ</p>
    </div>
    <div class="p-3 bg-bg-3 border border-border">
      <p class="text-muted mb-1">Quadratic (r=2)</p>
      <p class="font-mono text-primary">αₙ = 0.5^(2ⁿ)</p>
    </div>
    <div class="p-3 bg-bg-3 border border-border">
      <p class="text-muted mb-1">Superlinear (r≈1.618)</p>
      <p class="font-mono text-primary">αₙ = 0.5^(φⁿ)</p>
    </div>
  </div>
</Card>
