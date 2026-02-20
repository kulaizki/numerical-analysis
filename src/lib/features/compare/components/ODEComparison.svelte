<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Button, Input } from '$lib/components/ui';

  const odeFunctions = [
    {
      label: 'y\' = -2ty',
      f: (t: number, y: number) => -2 * t * y,
      exact: (t: number, y0: number) => y0 * Math.exp(-Math.pow(t, 2)),
      latex: 'y\' = -2ty'
    },
    {
      label: 'y\' = y',
      f: (t: number, y: number) => y,
      exact: (t: number, y0: number) => y0 * Math.exp(t),
      latex: 'y\' = y'
    },
    {
      label: 'y\' = -y + t + 1',
      f: (t: number, y: number) => -y + t + 1,
      exact: (t: number, y0: number) => t + (y0 - 0) * Math.exp(-t),
      latex: 'y\' = -y + t + 1'
    }
  ];

  let odeFuncIndex = $state(0);
  let odeT0 = $state(0);
  let odeTf = $state(2);
  let odeY0 = $state(1);
  let odeH = $state(0.1);

  let selectedOdeMethods = $state({
    euler: true,
    heun: true,
    rk4: true
  });

  interface OdeResult {
    method: string;
    points: Array<{ t: number; y: number }>;
    finalError: number;
  }

  let odeResults = $state<OdeResult[]>([]);
  let odeRunning = $state(false);

  function eulerMethod(f: (t: number, y: number) => number, t0: number, tf: number, y0: number, h: number): Array<{ t: number; y: number }> {
    const points: Array<{ t: number; y: number }> = [{ t: t0, y: y0 }];
    let t = t0;
    let y = y0;

    while (t < tf) {
      y = y + h * f(t, y);
      t = t + h;
      points.push({ t, y });
    }

    return points;
  }

  function heunMethod(f: (t: number, y: number) => number, t0: number, tf: number, y0: number, h: number): Array<{ t: number; y: number }> {
    const points: Array<{ t: number; y: number }> = [{ t: t0, y: y0 }];
    let t = t0;
    let y = y0;

    while (t < tf) {
      const k1 = f(t, y);
      const k2 = f(t + h, y + h * k1);
      y = y + (h / 2) * (k1 + k2);
      t = t + h;
      points.push({ t, y });
    }

    return points;
  }

  function rk4Method(f: (t: number, y: number) => number, t0: number, tf: number, y0: number, h: number): Array<{ t: number; y: number }> {
    const points: Array<{ t: number; y: number }> = [{ t: t0, y: y0 }];
    let t = t0;
    let y = y0;

    while (t < tf) {
      const k1 = f(t, y);
      const k2 = f(t + h / 2, y + (h / 2) * k1);
      const k3 = f(t + h / 2, y + (h / 2) * k2);
      const k4 = f(t + h, y + h * k3);
      y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
      t = t + h;
      points.push({ t, y });
    }

    return points;
  }

  function runOdeComparison() {
    odeRunning = true;
    const results: OdeResult[] = [];
    const currentOde = odeFunctions[odeFuncIndex];

    if (selectedOdeMethods.euler) {
      const points = eulerMethod(currentOde.f, odeT0, odeTf, odeY0, odeH);
      const finalError = Math.abs(points[points.length - 1].y - currentOde.exact(odeTf, odeY0));
      results.push({ method: 'Euler', points, finalError });
    }

    if (selectedOdeMethods.heun) {
      const points = heunMethod(currentOde.f, odeT0, odeTf, odeY0, odeH);
      const finalError = Math.abs(points[points.length - 1].y - currentOde.exact(odeTf, odeY0));
      results.push({ method: 'Heun', points, finalError });
    }

    if (selectedOdeMethods.rk4) {
      const points = rk4Method(currentOde.f, odeT0, odeTf, odeY0, odeH);
      const finalError = Math.abs(points[points.length - 1].y - currentOde.exact(odeTf, odeY0));
      results.push({ method: 'RK4', points, finalError });
    }

    // Add exact solution
    const exactPoints: Array<{ t: number; y: number }> = [];
    for (let t = odeT0; t <= odeTf; t += odeH) {
      exactPoints.push({ t, y: currentOde.exact(t, odeY0) });
    }
    results.push({ method: 'Exact', points: exactPoints, finalError: 0 });

    odeResults = results;
    odeRunning = false;
  }

  let odeChartData = $derived({
    labels: odeResults[0]?.points.map(p => p.t.toFixed(2)) || [],
    datasets: odeResults.map((result, idx) => ({
      label: result.method,
      data: result.points.map(p => p.y),
      borderColor: ['#818cf8', '#22c55e', '#f59e0b', '#a5b4fc'][idx],
      backgroundColor: ['#818cf8', '#22c55e', '#f59e0b', '#a5b4fc'][idx] + '40',
      tension: 0.1,
      borderWidth: result.method === 'Exact' ? 3 : 2,
      borderDash: result.method === 'Exact' ? [5, 5] : []
    }))
  });

  export function copyResults() {
    let text = 'Method Comparison - ODEs\n\n';
    text += `ODE: ${odeFunctions[odeFuncIndex].label}\n`;
    text += `Interval: [${odeT0}, ${odeTf}], Step: ${odeH}, y0: ${odeY0}\n\n`;
    text += 'Method\t\tFinal Value\tFinal Error\n';
    odeResults.filter(r => r.method !== 'Exact').forEach(r => {
      const finalY = r.points[r.points.length - 1].y;
      text += `${r.method}\t\t${finalY.toFixed(8)}\t${r.finalError.toFixed(8)}\n`;
    });
    return text;
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <!-- Controls -->
  <Card class="lg:col-span-1 p-6">
    <h3 class="text-lg font-semibold text-primary mb-4">Configuration</h3>

    <div class="mb-4">
      <span class="block text-sm text-muted mb-2">ODE</span>
      <select
        bind:value={odeFuncIndex}
        class="w-full bg-bg-3 text-primary border border-border px-3 py-2 text-sm focus:outline-none focus:border-accent"
      >
        {#each odeFunctions as func, i}
          <option value={i}>{func.label}</option>
        {/each}
      </select>
      <div class="mt-2 text-center">
        <KaTeX math={odeFunctions[odeFuncIndex].latex} displayMode={true} />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 mb-4">
      <Input type="number" label="t₀ (start)" bind:value={odeT0} step="0.1" />
      <Input type="number" label="tf (end)" bind:value={odeTf} step="0.1" />
    </div>

    <Input type="number" label="Initial value y₀" bind:value={odeY0} step="0.1" class="mb-4" />
    <Input type="number" label="Step size h" bind:value={odeH} step="0.01" class="mb-4" mono />

    <div class="mb-4">
      <span class="block text-sm text-muted mb-2">Select Methods</span>
      <div class="space-y-2">
        <label class="flex items-center gap-2 text-sm text-primary cursor-pointer">
          <input type="checkbox" bind:checked={selectedOdeMethods.euler} class="accent-accent" />
          Euler
        </label>
        <label class="flex items-center gap-2 text-sm text-primary cursor-pointer">
          <input type="checkbox" bind:checked={selectedOdeMethods.heun} class="accent-accent" />
          Heun
        </label>
        <label class="flex items-center gap-2 text-sm text-primary cursor-pointer">
          <input type="checkbox" bind:checked={selectedOdeMethods.rk4} class="accent-accent" />
          RK4
        </label>
      </div>
    </div>

    <Button onclick={runOdeComparison} disabled={odeRunning} class="w-full mb-3">
      {odeRunning ? 'Running...' : 'Run Comparison'}
    </Button>

    {#if odeResults.length > 0}
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
    {#if odeResults.length > 0}
      <!-- Solution Chart -->
      <Card class="p-6">
        <h3 class="text-lg font-semibold text-primary mb-4">Solutions (with Exact)</h3>
        <Chart type="line" data={odeChartData} options={{
          plugins: {
            legend: { display: true, position: 'top' }
          },
          scales: {
            y: { title: { display: true, text: 'y(t)', color: '#a1a1aa' } },
            x: { title: { display: true, text: 't', color: '#a1a1aa' } }
          }
        }} height="400px" />
      </Card>

      <!-- Error Table -->
      <Card class="p-6">
        <h3 class="text-lg font-semibold text-primary mb-4">Final Errors</h3>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left py-2 px-3 text-muted font-medium">Method</th>
                <th class="text-right py-2 px-3 text-muted font-medium">Final y(tf)</th>
                <th class="text-right py-2 px-3 text-muted font-medium">Error</th>
              </tr>
            </thead>
            <tbody>
              {#each odeResults.filter(r => r.method !== 'Exact') as result}
                <tr class="border-b border-border hover:bg-bg-3 transition-colors">
                  <td class="py-2 px-3 text-primary font-medium">{result.method}</td>
                  <td class="py-2 px-3 text-right font-mono text-primary">{result.points[result.points.length - 1].y.toFixed(8)}</td>
                  <td class="py-2 px-3 text-right font-mono text-primary">{result.finalError.toFixed(8)}</td>
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
