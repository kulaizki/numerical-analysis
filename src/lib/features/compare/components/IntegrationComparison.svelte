<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Button, Input } from '$lib/components/ui';

  const integrationFunctions = [
    { label: 'sin(x)', f: (x: number) => Math.sin(x), antiderivative: (x: number) => -Math.cos(x), latex: '\\sin(x)' },
    { label: 'x²', f: (x: number) => Math.pow(x, 2), antiderivative: (x: number) => Math.pow(x, 3) / 3, latex: 'x^2' },
    { label: 'eˣ', f: (x: number) => Math.exp(x), antiderivative: (x: number) => Math.exp(x), latex: 'e^x' },
    { label: '1/(1+x²)', f: (x: number) => 1/(1+Math.pow(x, 2)), antiderivative: (x: number) => Math.atan(x), latex: '\\frac{1}{1+x^2}' }
  ];

  let integFuncIndex = $state(0);
  let integA = $state(0);
  let integB = $state(Math.PI);
  let integN = $state(10);

  interface IntegrationResult {
    method: string;
    value: number;
    error: number;
  }

  let integResults = $state<IntegrationResult[]>([]);
  let integRunning = $state(false);

  function trapezoidalRule(f: (x: number) => number, a: number, b: number, n: number): number {
    const h = (b - a) / n;
    let sum = (f(a) + f(b)) / 2;

    for (let i = 1; i < n; i++) {
      sum += f(a + i * h);
    }

    return sum * h;
  }

  function simpsonsRule(f: (x: number) => number, a: number, b: number, n: number): number {
    if (n % 2 !== 0) n++; // Simpson's requires even n
    const h = (b - a) / n;
    let sum = f(a) + f(b);

    for (let i = 1; i < n; i++) {
      const coefficient = i % 2 === 0 ? 2 : 4;
      sum += coefficient * f(a + i * h);
    }

    return (sum * h) / 3;
  }

  function runIntegrationComparison() {
    integRunning = true;
    const currentFunc = integrationFunctions[integFuncIndex];
    const exact = currentFunc.antiderivative(integB) - currentFunc.antiderivative(integA);

    const trapValue = trapezoidalRule(currentFunc.f, integA, integB, integN);
    const simpValue = simpsonsRule(currentFunc.f, integA, integB, integN);

    integResults = [
      { method: 'Trapezoidal', value: trapValue, error: Math.abs(trapValue - exact) },
      { method: 'Simpson\'s', value: simpValue, error: Math.abs(simpValue - exact) }
    ];

    integRunning = false;
  }

  let integErrorData = $derived.by(() => {
    if (integResults.length === 0) return { labels: [], datasets: [] };

    const currentFunc = integrationFunctions[integFuncIndex];
    const exact = currentFunc.antiderivative(integB) - currentFunc.antiderivative(integA);

    const nValues = [2, 4, 8, 16, 32, 64];
    const trapErrors = nValues.map(n => Math.abs(trapezoidalRule(currentFunc.f, integA, integB, n) - exact));
    const simpErrors = nValues.map(n => Math.abs(simpsonsRule(currentFunc.f, integA, integB, n) - exact));

    return {
      labels: nValues,
      datasets: [
        {
          label: 'Trapezoidal',
          data: trapErrors.map(e => Math.log10(e + 1e-16)),
          borderColor: '#818cf8',
          backgroundColor: '#818cf840',
          tension: 0.1,
          borderWidth: 2
        },
        {
          label: 'Simpson\'s',
          data: simpErrors.map(e => Math.log10(e + 1e-16)),
          borderColor: '#22c55e',
          backgroundColor: '#22c55e40',
          tension: 0.1,
          borderWidth: 2
        }
      ]
    };
  });

  export function copyResults() {
    let text = 'Method Comparison - Integration\n\n';
    text += `Function: ${integrationFunctions[integFuncIndex].label}\n`;
    text += `Interval: [${integA}, ${integB}], Panels: ${integN}\n\n`;
    text += 'Method\t\tValue\t\tError\n';
    integResults.forEach(r => {
      text += `${r.method}\t\t${r.value.toFixed(8)}\t${r.error.toExponential(2)}\n`;
    });
    return text;
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <!-- Controls -->
  <Card class="lg:col-span-1 p-6">
    <h3 class="text-lg font-semibold text-primary mb-4">Configuration</h3>

    <div class="mb-4">
      <span class="block text-sm text-muted mb-2">Function</span>
      <select
        bind:value={integFuncIndex}
        class="w-full bg-bg-3 text-primary border border-border px-3 py-2 text-sm focus:outline-none focus:border-accent"
      >
        {#each integrationFunctions as func, i}
          <option value={i}>{func.label}</option>
        {/each}
      </select>
      <div class="mt-2 text-center">
        <KaTeX math="\\int {integrationFunctions[integFuncIndex].latex} \\, dx" displayMode={true} />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 mb-4">
      <Input type="number" label="a (lower)" bind:value={integA} step="0.1" />
      <Input type="number" label="b (upper)" bind:value={integB} step="0.1" />
    </div>

    <Input type="number" label="Number of panels (n)" bind:value={integN} step="2" min="2" class="mb-4" />

    <Button onclick={runIntegrationComparison} disabled={integRunning} class="w-full mb-3">
      {integRunning ? 'Running...' : 'Run Comparison'}
    </Button>

    {#if integResults.length > 0}
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
    {#if integResults.length > 0}
      <!-- Error vs n Chart -->
      <Card class="p-6">
        <h3 class="text-lg font-semibold text-primary mb-4">Error vs Number of Panels (log₁₀)</h3>
        <Chart type="line" data={integErrorData} options={{
          plugins: {
            legend: { display: true, position: 'top' }
          },
          scales: {
            y: { title: { display: true, text: 'log₁₀(error)', color: '#a1a1aa' } },
            x: { title: { display: true, text: 'Number of panels (n)', color: '#a1a1aa' } }
          }
        }} height="350px" />
      </Card>

      <!-- Results Table -->
      <Card class="p-6">
        <h3 class="text-lg font-semibold text-primary mb-4">Results</h3>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left py-2 px-3 text-muted font-medium">Method</th>
                <th class="text-right py-2 px-3 text-muted font-medium">Value</th>
                <th class="text-right py-2 px-3 text-muted font-medium">Error</th>
              </tr>
            </thead>
            <tbody>
              {#each integResults as result}
                <tr class="border-b border-border hover:bg-bg-3 transition-colors">
                  <td class="py-2 px-3 text-primary font-medium">{result.method}</td>
                  <td class="py-2 px-3 text-right font-mono text-primary">{result.value.toFixed(8)}</td>
                  <td class="py-2 px-3 text-right font-mono text-primary">{result.error.toExponential(2)}</td>
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
