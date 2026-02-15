<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Input } from '$lib/components/ui';
  import { onMount } from 'svelte';
  import { evaluateFunc } from '../utils';

  // State
  let compareFunc = $state('sin(x)');
  let compareA = $state(0);
  let compareB = $state(Math.PI);
  let compareExact = $state(2);
  let compareChartData = $state<any>({});
  let compareChartOptions = $state<any>({});

  function generateComparisonData() {
    const nValues = [2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 48, 64];
    const trapErrors: number[] = [];
    const simpErrors: number[] = [];

    for (const n of nValues) {
      // Trapezoidal
      const h = (compareB - compareA) / n;
      let trapSum = evaluateFunc(compareFunc, compareA) + evaluateFunc(compareFunc, compareB);
      for (let i = 1; i < n; i++) {
        trapSum += 2 * evaluateFunc(compareFunc, compareA + i * h);
      }
      const trapResult = (h / 2) * trapSum;
      trapErrors.push(Math.abs(compareExact - trapResult));

      // Simpson's
      const nEven = n % 2 === 0 ? n : n + 1;
      const hSimp = (compareB - compareA) / nEven;
      let simpSum = evaluateFunc(compareFunc, compareA) + evaluateFunc(compareFunc, compareB);
      for (let i = 1; i < nEven; i++) {
        const x = compareA + i * hSimp;
        simpSum += (i % 2 === 0 ? 2 : 4) * evaluateFunc(compareFunc, x);
      }
      const simpResult = (hSimp / 3) * simpSum;
      simpErrors.push(Math.abs(compareExact - simpResult));
    }

    compareChartData = {
      labels: nValues.map(n => n.toString()),
      datasets: [
        {
          label: 'Trapezoidal Error',
          data: trapErrors,
          borderColor: '#818cf8',
          backgroundColor: '#818cf8',
          tension: 0.1
        },
        {
          label: "Simpson's Error",
          data: simpErrors,
          borderColor: '#8b5cf6',
          backgroundColor: '#8b5cf6',
          tension: 0.1
        }
      ]
    };

    compareChartOptions = {
      scales: {
        y: {
          type: 'logarithmic',
          title: { display: true, text: 'Error (log scale)', color: '#a1a1aa' }
        },
        x: {
          title: { display: true, text: 'Number of panels (n)', color: '#a1a1aa' }
        }
      },
      plugins: {
        legend: {
          position: 'top'
        }
      }
    };
  }

  $effect(() => {
    compareFunc;
    compareA;
    compareB;
    compareExact;
    generateComparisonData();
  });

  onMount(() => {
    generateComparisonData();
  });
</script>

<div class="space-y-6">
  <Card>
    <h2 class="text-xl font-bold text-primary mb-4">Method Comparison</h2>
    <p class="text-muted mb-4">
      Compare the convergence rates of trapezoidal vs Simpson's rule. Simpson's rule converges much faster!
    </p>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-muted mb-1">Function <KaTeX math="f(x)" /></label>
        <Input
          type="text"
          bind:value={compareFunc}
          placeholder="e.g., sin(x), x^2"
          class="w-full font-mono"
        />
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-muted mb-1">Lower bound a</label>
          <Input
            type="number"
            bind:value={compareA}
            step="0.1"
            class="w-full font-mono"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-muted mb-1">Upper bound b</label>
          <Input
            type="number"
            bind:value={compareB}
            step="0.1"
            class="w-full font-mono"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-muted mb-1">Exact integral</label>
          <Input
            type="number"
            bind:value={compareExact}
            step="0.01"
            class="w-full font-mono"
          />
        </div>
      </div>

      <!-- Chart -->
      <div class="mt-6">
        <Chart
          type="line"
          data={compareChartData}
          options={compareChartOptions}
          height="400px"
        />
      </div>

      <div class="p-4 bg-bg-3 border border-border text-sm text-muted space-y-2">
        <p>
          <strong class="text-primary">Observation:</strong> On a log-scale plot, Simpson's error line
          has a steeper slope, indicating faster convergence (<KaTeX math="O(h^4)" />) compared to
          trapezoidal (<KaTeX math="O(h^2)" />).
        </p>
        <p>
          This means to achieve the same accuracy, Simpson's rule requires far fewer panels than trapezoidal.
        </p>
      </div>
    </div>
  </Card>

  <Card>
    <h3 class="text-lg font-bold text-primary mb-4">Key Takeaways</h3>
    <div class="space-y-3 text-sm text-muted">
      <div class="p-3 bg-bg-3 border-l-4 border-accent">
        <strong class="text-primary">Trapezoidal Rule:</strong> Simple, linear approximation. Error <KaTeX math="O(h^2)" />.
        Good for quick estimates.
      </div>
      <div class="p-3 bg-bg-3 border-l-4 border-accent">
        <strong class="text-primary">Simpson's Rule:</strong> Uses parabolas. Error <KaTeX math="O(h^4)" />.
        Much more accurate for smooth functions. Requires even n.
      </div>
      <div class="p-3 bg-bg-3 border-l-4 border-accent">
        <strong class="text-primary">Central Difference:</strong> For derivatives, central difference has error <KaTeX math="O(h^2)" />,
        better than forward/backward <KaTeX math="O(h)" />.
      </div>
    </div>
  </Card>
</div>
