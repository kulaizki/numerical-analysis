<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Button, Input } from '$lib/components/ui';
  import {
    type Point,
    defaultPoints,
    computeCubicSplines,
    evaluateSpline
  } from '../utils';

  let splinePoints = $state<Point[]>([...defaultPoints]);

  function addSplinePoint() {
    const newX = splinePoints.length > 0
      ? Math.max(...splinePoints.map(p => p.x)) + 1
      : 0;
    splinePoints = [...splinePoints, { x: newX, y: 0 }];
  }

  function removeSplinePoint(index: number) {
    splinePoints = splinePoints.filter((_, i) => i !== index);
  }

  function resetSplinePoints() {
    splinePoints = [...defaultPoints];
  }

  function getSplineChartData() {
    if (splinePoints.length < 2) return null;

    const sorted = [...splinePoints].sort((a, b) => a.x - b.x);
    const splines = computeCubicSplines(sorted);

    const datasets: any[] = [];
    const colors = ['#818cf8', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

    for (let i = 0; i < splines.length; i++) {
      const spline = splines[i];
      const segmentData: Point[] = [];
      const step = (spline.x1 - spline.x0) / 50;

      for (let x = spline.x0; x <= spline.x1; x += step) {
        segmentData.push({ x, y: evaluateSpline(x, [spline]) });
      }

      datasets.push({
        label: `Spline ${i}`,
        data: segmentData,
        borderColor: colors[i % colors.length],
        backgroundColor: colors[i % colors.length],
        pointRadius: 0,
        borderWidth: 2,
        parsing: { xAxisKey: 'x', yAxisKey: 'y' }
      });
    }

    datasets.push({
      label: 'Data Points',
      data: sorted,
      borderColor: '#f59e0b',
      backgroundColor: '#f59e0b',
      pointRadius: 6,
      showLine: false,
      parsing: { xAxisKey: 'x', yAxisKey: 'y' }
    });

    return { datasets };
  }
</script>

<div class="space-y-6">
  <Card>
    <h2 class="text-xl font-semibold text-accent mb-4">Cubic Splines</h2>

    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-medium text-primary mb-2">Theory</h3>
        <p class="text-muted mb-3">
          A cubic spline is a piecewise cubic polynomial that is smooth (C² continuous) at all data points.
        </p>
        <div class="bg-background/50 p-4 space-y-2">
          <KaTeX math={'S(x) = \\begin{cases} S_0(x) & x_0 \\le x \\le x_1 \\\\ S_1(x) & x_1 \\le x \\le x_2 \\\\ \\vdots \\\\ S_{n-1}(x) & x_{n-1} \\le x \\le x_n \\end{cases}'} displayMode />
          <KaTeX math={'S_i(x) = a_i + b_i(x - x_i) + c_i(x - x_i)^2 + d_i(x - x_i)^3'} displayMode />
        </div>
        <p class="text-muted mt-3">
          <strong>Natural spline:</strong> S''(x₀) = S''(xₙ) = 0 (zero curvature at endpoints)
        </p>
        <p class="text-muted">
          <strong>Advantage:</strong> No oscillation issues like high-degree polynomials (Runge's phenomenon)
        </p>
      </div>

      <div>
        <h3 class="text-lg font-medium text-primary mb-3">Data Points</h3>
        <div class="space-y-2 mb-4">
          {#each splinePoints as point, i}
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
              <Button variant="outline" size="sm" onclick={() => removeSplinePoint(i)}>
                Remove
              </Button>
            </div>
          {/each}
        </div>
        <div class="flex gap-2">
          <Button onclick={addSplinePoint}>Add Point</Button>
          <Button onclick={resetSplinePoints} variant="outline">Reset to Default</Button>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-medium text-primary mb-3">Spline Segments</h3>
        {#if splinePoints.length >= 2}
          {@const sorted = [...splinePoints].sort((a, b) => a.x - b.x)}
          {@const splines = computeCubicSplines(sorted)}

          <div class="overflow-x-auto mb-4">
            <table class="w-full text-sm">
              <thead class="border-b border-border">
                <tr class="text-muted">
                  <th class="text-left p-2">Segment</th>
                  <th class="text-right p-2">Interval</th>
                  <th class="text-right p-2">a</th>
                  <th class="text-right p-2">b</th>
                  <th class="text-right p-2">c</th>
                  <th class="text-right p-2">d</th>
                </tr>
              </thead>
              <tbody>
                {#each splines as spline, i}
                  <tr class="border-b border-border/50">
                    <td class="p-2 text-primary">S_{i}</td>
                    <td class="p-2 text-right text-muted font-mono">
                      [{spline.x0.toFixed(1)}, {spline.x1.toFixed(1)}]
                    </td>
                    <td class="p-2 text-right text-muted font-mono">{spline.a.toFixed(4)}</td>
                    <td class="p-2 text-right text-muted font-mono">{spline.b.toFixed(4)}</td>
                    <td class="p-2 text-right text-muted font-mono">{spline.c.toFixed(4)}</td>
                    <td class="p-2 text-right text-muted font-mono">{spline.d.toFixed(4)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>

      <div>
        <h3 class="text-lg font-medium text-primary mb-3">Visualization</h3>
        {#if splinePoints.length >= 2}
          <div class="h-80">
            <Chart
              type="scatter"
              data={getSplineChartData()}
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
        {:else}
          <p class="text-muted">Need at least 2 points to compute splines.</p>
        {/if}
      </div>

      <div class="bg-background/50 p-4">
        <h3 class="text-lg font-medium text-primary mb-2">Practice Problems</h3>
        <ol class="list-decimal list-inside space-y-2 text-muted">
          <li>Construct a natural cubic spline through (0, 0), (1, 1), (2, 0). Find S₀(x) and S₁(x).</li>
          <li>Verify that your spline has continuous first and second derivatives at x = 1.</li>
          <li>Compare the cubic spline to Lagrange interpolation for points at x = 0, 1, 2, 3, 4 with y = sin(x). Which behaves better?</li>
        </ol>
      </div>
    </div>
  </Card>
</div>
