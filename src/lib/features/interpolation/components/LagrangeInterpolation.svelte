<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { Card, Button, Input } from '$lib/components/ui';
  import {
    type Point,
    defaultPoints,
    lagrangeBasis,
    lagrangeInterpolate,
    getLagrangePolynomialLatex
  } from '../utils';

  let lagrangePoints = $state<Point[]>([...defaultPoints]);
  let lagrangeShowBasis = $state(false);
  let lagrangeSelectedBasis = $state(0);
  let lagrangeCanvas: HTMLCanvasElement | undefined = $state();

  function addLagrangePoint() {
    const newX = lagrangePoints.length > 0
      ? Math.max(...lagrangePoints.map(p => p.x)) + 1
      : 0;
    lagrangePoints = [...lagrangePoints, { x: newX, y: 0 }];
  }

  function removeLagrangePoint(index: number) {
    lagrangePoints = lagrangePoints.filter((_, i) => i !== index);
  }

  function resetLagrangePoints() {
    lagrangePoints = [...defaultPoints];
  }

  function getLagrangeChartData() {
    if (lagrangePoints.length === 0) return null;

    const sorted = [...lagrangePoints].sort((a, b) => a.x - b.x);
    const xMin = sorted[0].x - 1;
    const xMax = sorted[sorted.length - 1].x + 1;
    const step = (xMax - xMin) / 200;

    const interpolationData: Point[] = [];
    const basisData: Point[][] = Array(sorted.length).fill(0).map(() => []);

    for (let x = xMin; x <= xMax; x += step) {
      interpolationData.push({ x, y: lagrangeInterpolate(x, sorted) });

      if (lagrangeShowBasis) {
        for (let i = 0; i < sorted.length; i++) {
          basisData[i].push({ x, y: lagrangeBasis(i, x, sorted) });
        }
      }
    }

    const datasets: any[] = [
      {
        label: 'Lagrange Polynomial',
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
    ];

    if (lagrangeShowBasis) {
      const colors = ['#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
      for (let i = 0; i < sorted.length; i++) {
        datasets.push({
          label: `L_${i}(x)`,
          data: basisData[i],
          borderColor: colors[i % colors.length],
          backgroundColor: colors[i % colors.length],
          pointRadius: 0,
          borderWidth: 1,
          borderDash: [5, 5],
          parsing: { xAxisKey: 'x', yAxisKey: 'y' }
        });
      }
    }

    return { datasets };
  }

  function drawLagrangeCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;
    const padding = 50;

    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, width, height);

    if (lagrangePoints.length === 0) return;

    const sorted = [...lagrangePoints].sort((a, b) => a.x - b.x);
    const xMin = Math.min(...sorted.map(p => p.x)) - 1;
    const xMax = Math.max(...sorted.map(p => p.x)) + 1;
    const yMin = Math.min(...sorted.map(p => p.y), 0) - 5;
    const yMax = Math.max(...sorted.map(p => p.y)) + 5;

    const mapX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
    const mapY = (y: number) => height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);

    // Axes
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const xStep = (xMax - xMin) / 10;
    const yStep = (yMax - yMin) / 10;

    for (let x = xMin; x <= xMax; x += xStep) {
      ctx.beginPath();
      ctx.moveTo(mapX(x), padding);
      ctx.lineTo(mapX(x), height - padding);
      ctx.stroke();
    }

    for (let y = yMin; y <= yMax; y += yStep) {
      ctx.beginPath();
      ctx.moveTo(padding, mapY(y));
      ctx.lineTo(width - padding, mapY(y));
      ctx.stroke();
    }

    // Lagrange polynomial
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    let first = true;
    for (let x = xMin; x <= xMax; x += (xMax - xMin) / 300) {
      const y = lagrangeInterpolate(x, sorted);
      const px = mapX(x);
      const py = mapY(y);
      if (first) {
        ctx.moveTo(px, py);
        first = false;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Data points
    sorted.forEach(point => {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(mapX(point.x), mapY(point.y), 6, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '12px monospace';
      ctx.fillText(`(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`, mapX(point.x) + 10, mapY(point.y) - 10);
    });

    // Basis polynomial highlight
    if (lagrangeShowBasis) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      first = true;
      for (let x = xMin; x <= xMax; x += (xMax - xMin) / 300) {
        const y = lagrangeBasis(lagrangeSelectedBasis, x, sorted);
        const px = mapX(x);
        const py = mapY(y);
        if (first) {
          ctx.moveTo(px, py);
          first = false;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Labels
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '14px monospace';
    ctx.fillText('x', width - padding + 10, height - padding + 5);
    ctx.fillText('y', padding - 5, padding - 15);
  }

  $effect(() => {
    if (lagrangeCanvas) {
      drawLagrangeCanvas(lagrangeCanvas);
    }
  });
</script>

<div class="space-y-6">
  <Card>
    <h2 class="text-xl font-semibold text-accent mb-4">Lagrange Interpolation</h2>

    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-medium text-primary mb-2">Theory</h3>
        <p class="text-muted mb-3">
          The Lagrange interpolating polynomial passes through all n+1 data points using basis polynomials.
        </p>
        <div class="bg-background/50 p-4 space-y-2">
          <KaTeX math={'P(x) = \\sum_{i=0}^{n} y_i L_i(x)'} displayMode />
          <KaTeX math={'L_i(x) = \\prod_{j=0, j \\neq i}^{n} \\frac{x - x_j}{x_i - x_j}'} displayMode />
        </div>
        <p class="text-muted mt-3">
          Each basis polynomial <KaTeX math="L_i(x)" /> equals 1 at <KaTeX math="x_i" /> and 0 at all other data points.
        </p>
      </div>

      <div>
        <h3 class="text-lg font-medium text-primary mb-3">Data Points</h3>
        <div class="space-y-2 mb-4">
          {#each lagrangePoints as point, i}
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
              <Button variant="outline" size="sm" onclick={() => removeLagrangePoint(i)}>
                Remove
              </Button>
            </div>
          {/each}
        </div>
        <div class="flex gap-2">
          <Button onclick={addLagrangePoint}>Add Point</Button>
          <Button onclick={resetLagrangePoints} variant="outline">Reset to Default</Button>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-medium text-primary mb-3">Visualization</h3>

        <div class="w-full overflow-x-auto">
          <canvas
            bind:this={lagrangeCanvas}
            style="width: 100%; height: 500px;"
            class="border border-border mb-4"
          ></canvas>
        </div>

        <div class="mb-4">
          <label class="flex items-center gap-2 text-muted">
            <input type="checkbox" bind:checked={lagrangeShowBasis} class="w-4 h-4" />
            Show Basis Polynomial L_{lagrangeSelectedBasis}(x)
          </label>
          {#if lagrangeShowBasis}
            <div class="mt-2">
              <Input
                type="range"
                min="0"
                max={lagrangePoints.length - 1}
                bind:value={lagrangeSelectedBasis}
                class="w-full"
              />
              <p class="text-sm text-muted mt-1">Basis index: {lagrangeSelectedBasis}</p>
            </div>
          {/if}
        </div>

        {#if lagrangePoints.length > 0}
          <div class="h-80">
            <Chart
              type="scatter"
              data={getLagrangeChartData()}
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

      {#if lagrangePoints.length > 0}
        <div>
          <h3 class="text-lg font-medium text-primary mb-2">Polynomial Formula</h3>
          <div class="bg-background/50 p-4 overflow-x-auto">
            <KaTeX math={getLagrangePolynomialLatex(lagrangePoints)} displayMode />
          </div>
        </div>
      {/if}

      <div class="bg-background/50 p-4">
        <h3 class="text-lg font-medium text-primary mb-2">Practice Problems</h3>
        <ol class="list-decimal list-inside space-y-2 text-muted">
          <li>Find the Lagrange polynomial through points (0, 1), (2, 5), (3, 4). Evaluate P(1).</li>
          <li>Construct L₁(x) for points (-1, 2), (0, 1), (1, 4), (2, 3).</li>
          <li>Show that Lagrange interpolation is exact for polynomials of degree ≤ n with n+1 points.</li>
        </ol>
      </div>
    </div>
  </Card>
</div>
