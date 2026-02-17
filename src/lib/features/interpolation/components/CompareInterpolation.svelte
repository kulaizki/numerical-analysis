<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Button, Input } from '$lib/components/ui';
  import {
    type Point,
    defaultPoints,
    lagrangeInterpolate,
    newtonInterpolate,
    computeCubicSplines,
    evaluateSpline
  } from '../utils';

  let comparePoints = $state<Point[]>([...defaultPoints]);

  function addComparePoint() {
    const newX = comparePoints.length > 0
      ? Math.max(...comparePoints.map(p => p.x)) + 1
      : 0;
    comparePoints = [...comparePoints, { x: newX, y: 0 }];
  }

  function removeComparePoint(index: number) {
    comparePoints = comparePoints.filter((_, i) => i !== index);
  }

  function resetComparePoints() {
    comparePoints = [...defaultPoints];
  }

  function getComparisonChartData() {
    if (comparePoints.length < 2) return null;

    const sorted = [...comparePoints].sort((a, b) => a.x - b.x);
    const xMin = sorted[0].x - 1;
    const xMax = sorted[sorted.length - 1].x + 1;
    const step = (xMax - xMin) / 200;

    const lagrangeData: Point[] = [];
    const newtonData: Point[] = [];
    const splineData: Point[] = [];
    const splines = computeCubicSplines(sorted);

    for (let x = xMin; x <= xMax; x += step) {
      lagrangeData.push({ x, y: lagrangeInterpolate(x, sorted) });
      newtonData.push({ x, y: newtonInterpolate(x, sorted) });

      if (x >= sorted[0].x && x <= sorted[sorted.length - 1].x) {
        splineData.push({ x, y: evaluateSpline(x, splines) });
      }
    }

    return {
      datasets: [
        {
          label: 'Lagrange',
          data: lagrangeData,
          borderColor: '#818cf8',
          backgroundColor: '#818cf8',
          pointRadius: 0,
          borderWidth: 2,
          parsing: { xAxisKey: 'x', yAxisKey: 'y' }
        },
        {
          label: 'Newton',
          data: newtonData,
          borderColor: '#10b981',
          backgroundColor: '#10b981',
          pointRadius: 0,
          borderWidth: 2,
          borderDash: [10, 5],
          parsing: { xAxisKey: 'x', yAxisKey: 'y' }
        },
        {
          label: 'Cubic Spline',
          data: splineData,
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f6',
          pointRadius: 0,
          borderWidth: 2,
          parsing: { xAxisKey: 'x', yAxisKey: 'y' }
        },
        {
          label: 'Data Points',
          data: sorted,
          borderColor: '#f59e0b',
          backgroundColor: '#f59e0b',
          pointRadius: 6,
          showLine: false,
          parsing: { xAxisKey: 'x', yAxisKey: 'y' }
        }
      ]
    };
  }
</script>

<div class="space-y-6">
  <Card>
    <h2 class="text-xl font-semibold text-accent mb-4">Method Comparison</h2>

    <div class="space-y-4">
      <p class="text-muted mb-4">
        Compare all three interpolation methods on the same data set.
      </p>

      <div>
        <h3 class="text-lg font-medium text-primary mb-3">Data Points</h3>
        <div class="space-y-2 mb-4">
          {#each comparePoints as point, i}
            <div class="flex gap-2 items-center">
              <span class="text-muted w-8">P{i}:</span>
              <Input
                type="number"
                bind:value={point.x}
                placeholder="x"
                class="w-24"
                step="0.1"
              />
              <span class="text-muted">,</span>
              <Input
                type="number"
                bind:value={point.y}
                placeholder="y"
                class="w-24"
                step="0.1"
              />
              <Button variant="outline" size="sm" onclick={() => removeComparePoint(i)}>
                Remove
              </Button>
            </div>
          {/each}
        </div>
        <div class="flex gap-2">
          <Button onclick={addComparePoint}>Add Point</Button>
          <Button onclick={resetComparePoints} variant="outline">Reset to Default</Button>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-medium text-primary mb-3">Overlay Comparison</h3>
        {#if comparePoints.length >= 2}
          <div class="h-96">
            <Chart
              type="scatter"
              data={getComparisonChartData()}
              options={{
                plugins: {
                  legend: { display: true, position: 'top' }
                },
                scales: {
                  x: { type: 'linear', title: { display: true, text: 'x' } },
                  y: { type: 'linear', title: { display: true, text: 'y' } }
                }
              }}
            />
          </div>
        {/if}
      </div>

      <div class="bg-background/50 p-4">
        <h3 class="text-lg font-medium text-primary mb-2">Key Differences</h3>
        <div class="space-y-3">
          <div>
            <h4 class="text-primary font-medium">Lagrange & Newton</h4>
            <p class="text-muted text-sm">
              Both produce the same unique polynomial of degree ≤ n passing through n+1 points.
              They differ only in form and computational efficiency.
            </p>
          </div>
          <div>
            <h4 class="text-primary font-medium">Cubic Splines</h4>
            <p class="text-muted text-sm">
              Piecewise polynomials (degree 3 per segment). Avoids oscillation for large datasets.
              Better for smooth curves but different polynomial than Lagrange/Newton.
            </p>
          </div>
          <div>
            <h4 class="text-primary font-medium">Runge's Phenomenon</h4>
            <p class="text-muted text-sm">
              High-degree Lagrange/Newton polynomials can oscillate wildly between points, especially
              with equally-spaced data. Splines avoid this by keeping degree low.
            </p>
          </div>
        </div>
      </div>

      <div class="bg-background/50 p-4">
        <h3 class="text-lg font-medium text-primary mb-2">When to Use Each</h3>
        <ul class="space-y-2 text-muted text-sm">
          <li><strong>Lagrange:</strong> Simple formula, good for theoretical work, easy hand calculation</li>
          <li><strong>Newton:</strong> Best when adding points incrementally, efficient computation</li>
          <li><strong>Cubic Splines:</strong> Large datasets, smooth curves needed, avoid oscillation</li>
        </ul>
      </div>

      <div class="bg-background/50 p-4">
        <h3 class="text-lg font-medium text-primary mb-2">Challenge Problem</h3>
        <p class="text-muted">
          Try interpolating the function <KaTeX math={'f(x) = \\frac{1}{1 + 25x^2}'} /> on <KaTeX math="[-1, 1]" /> with equally-spaced points.
          Start with 5 points, then 7, then 9. What happens to the Lagrange polynomial? What about the spline?
          This is the classic demonstration of Runge's phenomenon.
        </p>
      </div>
    </div>
  </Card>
</div>
