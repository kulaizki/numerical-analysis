<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Badge, Button, Input } from '$lib/components/ui';
  import CodeTabs from '$lib/components/CodeTabs.svelte';
  import {
    type Point,
    defaultPoints,
    computeDividedDifferences,
    newtonInterpolate,
    getNewtonPolynomialLatex
  } from '../utils';

  let newtonPoints = $state<Point[]>([...defaultPoints]);
  let newtonShowTable = $state(false);
  let newtonStepByStep = $state(false);
  let newtonCurrentStep = $state(0);

  function addNewtonPoint() {
    const newX = newtonPoints.length > 0
      ? Math.max(...newtonPoints.map(p => p.x)) + 1
      : 0;
    newtonPoints = [...newtonPoints, { x: newX, y: 0 }];
  }

  function removeNewtonPoint(index: number) {
    newtonPoints = newtonPoints.filter((_, i) => i !== index);
  }

  function resetNewtonPoints() {
    newtonPoints = [...defaultPoints];
  }

  function stepNewtonForward() {
    if (newtonCurrentStep < newtonPoints.length - 1) {
      newtonCurrentStep++;
    }
  }

  function stepNewtonBackward() {
    if (newtonCurrentStep > 0) {
      newtonCurrentStep--;
    }
  }

  function resetNewtonStep() {
    newtonCurrentStep = 0;
    newtonStepByStep = false;
  }

  function getNewtonChartData() {
    if (newtonPoints.length === 0) return null;

    const sorted = [...newtonPoints].sort((a, b) => a.x - b.x);
    const xMin = sorted[0].x - 1;
    const xMax = sorted[sorted.length - 1].x + 1;
    const step = (xMax - xMin) / 200;

    const interpolationData: Point[] = [];

    for (let x = xMin; x <= xMax; x += step) {
      interpolationData.push({ x, y: newtonInterpolate(x, sorted) });
    }

    return {
      datasets: [
        {
          label: 'Newton Polynomial',
          data: interpolationData,
          borderColor: '#818cf8',
          backgroundColor: '#818cf8',
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
    <h2 class="text-xl font-semibold text-accent mb-4">Newton's Divided Differences</h2>

    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-medium text-primary mb-2">Theory</h3>
        <p class="text-muted mb-3">
          Newton's form builds the interpolating polynomial incrementally using divided differences.
        </p>
        <div class="bg-background/50 p-4 space-y-2">
          <KaTeX math="P(x) = f[x_0] + f[x_0,x_1](x-x_0) + f[x_0,x_1,x_2](x-x_0)(x-x_1) + \cdots" displayMode />
          <KaTeX math={'f[x_i, x_{i+1}, \\ldots, x_{i+k}] = \\frac{f[x_{i+1}, \\ldots, x_{i+k}] - f[x_i, \\ldots, x_{i+k-1}]}{x_{i+k} - x_i}'} displayMode />
        </div>
        <p class="text-muted mt-3">
          Advantage: Easy to add new points without recomputing everything.
        </p>
      </div>

      <div>
        <h3 class="text-lg font-medium text-primary mb-3">Data Points</h3>
        <div class="space-y-2 mb-4">
          {#each newtonPoints as point, i}
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
              <Button variant="outline" size="sm" onclick={() => removeNewtonPoint(i)}>
                Remove
              </Button>
            </div>
          {/each}
        </div>
        <div class="flex gap-2">
          <Button onclick={addNewtonPoint}>Add Point</Button>
          <Button onclick={resetNewtonPoints} variant="outline">Reset to Default</Button>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-medium text-primary mb-3">Divided Difference Table</h3>

        <div class="mb-4">
          <label class="flex items-center gap-2 text-muted">
            <input type="checkbox" bind:checked={newtonStepByStep} class="w-4 h-4" />
            Step-by-step mode
          </label>
        </div>

        {#if newtonStepByStep}
          <div class="flex gap-2 mb-4">
            <Button onclick={stepNewtonBackward} disabled={newtonCurrentStep === 0}>
              Previous
            </Button>
            <Button onclick={stepNewtonForward} disabled={newtonCurrentStep >= newtonPoints.length - 1}>
              Next
            </Button>
            <Button onclick={resetNewtonStep} variant="outline">
              Reset
            </Button>
            <Badge>Step {newtonCurrentStep + 1} / {newtonPoints.length}</Badge>
          </div>
        {/if}

        {#if newtonPoints.length > 0}
          {@const table = computeDividedDifferences(newtonPoints)}
          {@const displayCols = newtonStepByStep ? newtonCurrentStep + 1 : newtonPoints.length}

          <div class="overflow-x-auto mb-4">
            <table class="w-full text-sm border-collapse">
              <thead class="border-b border-border">
                <tr class="text-muted">
                  <th class="text-left p-2">i</th>
                  <th class="text-right p-2">x_i</th>
                  <th class="text-right p-2">f[x_i]</th>
                  {#each Array(Math.min(displayCols - 1, newtonPoints.length - 1)) as _, order}
                    <th class="text-right p-2">f[...x_{'{'}i+{order + 1}{'}'}]</th>
                  {/each}
                </tr>
              </thead>
              <tbody>
                {#each newtonPoints as point, i}
                  <tr class="border-b border-border/50">
                    <td class="p-2 text-primary">{i}</td>
                    <td class="p-2 text-right text-muted font-mono">{point.x.toFixed(1)}</td>
                    {#each Array(displayCols) as _, j}
                      {#if i + j < newtonPoints.length}
                        <td class="p-2 text-right font-mono {j === displayCols - 1 && newtonStepByStep ? 'bg-accent/20 text-accent' : 'text-muted'}">
                          {table[i][j].toFixed(4)}
                        </td>
                      {:else}
                        <td class="p-2"></td>
                      {/if}
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>

      <div>
        <h3 class="text-lg font-medium text-primary mb-3">Polynomial Visualization</h3>
        {#if newtonPoints.length > 0}
          <div class="h-80">
            <Chart
              type="scatter"
              data={getNewtonChartData()}
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

      {#if newtonPoints.length > 0}
        <div>
          <h3 class="text-lg font-medium text-primary mb-2">Newton Polynomial</h3>
          <div class="bg-background/50 p-4 overflow-x-auto">
            <KaTeX math={getNewtonPolynomialLatex(newtonPoints)} displayMode />
          </div>
        </div>
      {/if}

      <div class="bg-background/50 p-4">
        <h3 class="text-lg font-medium text-primary mb-2">Practice Problems</h3>
        <ol class="list-decimal list-inside space-y-2 text-muted">
          <li>Compute the divided difference table for points (1, 0), (2, 1), (4, 3), (5, 6).</li>
          <li>Add point (3, 2) to the table above. Show that only one column needs updating.</li>
          <li>Prove that f[x₀, x₁, ..., xₙ] is symmetric in its arguments.</li>
        </ol>
      </div>
    </div>
  </Card>

  <CodeTabs codes={{
    pseudocode: `INPUT: points (x0,y0), ..., (xn,yn), target x
OUTPUT: P(x)

// Build divided difference table
F[i][0] = y[i] for all i
for j = 1 to n:
    for i = j to n:
        F[i][j] = (F[i][j-1] - F[i-1][j-1]) / (x[i] - x[i-j])

// Evaluate polynomial
P = F[0][0]
product = 1
for j = 1 to n:
    product = product * (x - x[j-1])
    P = P + F[j][j] * product

RETURN P`,
    python: `import numpy as np

def newton_divided_diff(x_pts, y_pts, x):
    n = len(x_pts)
    F = np.zeros((n, n))
    F[:, 0] = y_pts

    for j in range(1, n):
        for i in range(j, n):
            F[i][j] = (F[i][j-1] - F[i-1][j-1]) / (x_pts[i] - x_pts[i-j])

    result = F[0][0]
    product = 1.0
    for j in range(1, n):
        product *= (x - x_pts[j - 1])
        result += F[j][j] * product
    return result`,
    r: `newton_divided_diff <- function(x_pts, y_pts, x) {
  n <- length(x_pts)
  F <- matrix(0, n, n)
  F[, 1] <- y_pts

  for (j in 2:n) {
    for (i in j:n) {
      F[i, j] <- (F[i, j-1] - F[i-1, j-1]) / (x_pts[i] - x_pts[i-j+1])
    }
  }

  result <- F[1, 1]
  product <- 1
  for (j in 2:n) {
    product <- product * (x - x_pts[j - 1])
    result <- result + F[j, j] * product
  }
  return(result)
}`
  }} />
</div>
