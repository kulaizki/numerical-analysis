<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Button, Input } from '$lib/components/ui';

  let show = $state(true);

  // ---- Interactive calculator state ----
  // Default: the Gauss-Seidel example from the lecture
  const DEFAULT_CALC_A: number[][] = [
    [6, -2, 1],
    [-2, 7, 2],
    [1, 2, -5]
  ];
  const DEFAULT_CALC_B: number[] = [11, 5, -1];
  const DEFAULT_CALC_X: number[] = [2.000119, 1.000068, 1.000051];

  // Store matrix A entries as strings for input binding
  let aEntries = $state(DEFAULT_CALC_A.map(row => row.map(v => String(v))));
  let bEntries = $state(DEFAULT_CALC_B.map(v => String(v)));
  let xBarEntries = $state(DEFAULT_CALC_X.map(v => String(v)));

  // Parse helpers
  function parseNum(s: string): number {
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }

  // $derived: parse inputs into numbers
  let A = $derived(aEntries.map(row => row.map(parseNum)));
  let b = $derived(bEntries.map(parseNum));
  let xBar = $derived(xBarEntries.map(parseNum));

  // $derived: residual r = b - A·x̄
  let residual = $derived(
    b.map((bi, i) => {
      const axRow = A[i].reduce((sum, aij, j) => sum + aij * xBar[j], 0);
      return bi - axRow;
    })
  );

  // $derived: infinity norm of r
  let rInfNorm = $derived(Math.max(...residual.map(Math.abs)));

  function resetCalculator() {
    aEntries = DEFAULT_CALC_A.map(row => row.map(v => String(v)));
    bEntries = DEFAULT_CALC_B.map(v => String(v));
    xBarEntries = DEFAULT_CALC_X.map(v => String(v));
  }
</script>

<section id="linear-system-error">
  <div class="space-y-6">

    <!-- Section 1: Theory -->
    <Card>
      <button
        class="w-full flex items-center justify-between p-4 -m-6 mb-0"
        onclick={() => show = !show}
      >
        <h3 class="text-xl font-semibold text-primary">Error Analysis &amp; Iterative Refinement</h3>
        <span class="text-muted">{show ? '▼' : '▶'}</span>
      </button>

      {#if show}
        <div class="mt-6 space-y-4 text-tertiary">
          <p>
            Given the linear system <KaTeX math={"A\\mathbf{x} = \\mathbf{b}"} />, let
            <KaTeX math={"\\bar{\\mathbf{x}}"} /> be an approximate solution. We can quantify and
            correct the error using the <strong class="text-primary">residual vector</strong>.
          </p>

          <div class="space-y-3">
            <p class="font-semibold text-primary">Residual</p>
            <KaTeX
              math={"\\mathbf{r} = \\mathbf{b} - A\\bar{\\mathbf{x}}"}
              displayMode
            />
            <p>
              The residual measures how far <KaTeX math={"A\\bar{\\mathbf{x}}"} /> is from
              <KaTeX math={"\\mathbf{b}"} />. A small residual suggests a good approximation, but
              a small residual does not always imply a small error — the condition number of
              <KaTeX math={"A"} /> matters.
            </p>
          </div>

          <div class="space-y-3">
            <p class="font-semibold text-primary">Error</p>
            <KaTeX
              math={"\\mathbf{e} = \\mathbf{x} - \\bar{\\mathbf{x}} = A^{-1}\\mathbf{r}"}
              displayMode
            />
            <p>
              The true error satisfies <KaTeX math={"A\\mathbf{e} = \\mathbf{r}"} /> because
              <KaTeX math={"A(\\mathbf{x} - \\bar{\\mathbf{x}}) = A\\mathbf{x} - A\\bar{\\mathbf{x}} = \\mathbf{b} - A\\bar{\\mathbf{x}} = \\mathbf{r}"} />.
            </p>
          </div>

          <div class="space-y-3">
            <p class="font-semibold text-primary">Norm Bound</p>
            <KaTeX
              math={"\\|\\mathbf{e}\\| \\leq \\|A^{-1}\\| \\cdot \\|\\mathbf{r}\\|"}
              displayMode
            />
            <p>
              This gives an upper bound on the error in terms of the residual and the norm of
              <KaTeX math={"A^{-1}"} />. When <KaTeX math={"A"} /> is ill-conditioned,
              <KaTeX math={"\\|A^{-1}\\|"} /> is large, so even a small residual can correspond to
              a large error.
            </p>
          </div>

          <div class="space-y-3">
            <p class="font-semibold text-primary">Iterative Refinement</p>
            <p>
              Once we have the residual, we can solve for the error correction
              <KaTeX math={"\\bar{\\mathbf{e}}"} /> and improve our solution:
            </p>
            <KaTeX
              math={"A\\bar{\\mathbf{e}} = \\mathbf{r} \\quad \\Longrightarrow \\quad \\bar{\\mathbf{x}}_{\\text{corrected}} = \\bar{\\mathbf{x}} + \\bar{\\mathbf{e}}"}
              displayMode
            />
            <p>
              Solving <KaTeX math={"A\\bar{\\mathbf{e}} = \\mathbf{r}"} /> for the correction
              <KaTeX math={"\\bar{\\mathbf{e}}"} /> and adding it to <KaTeX math={"\\bar{\\mathbf{x}}"} />
              yields a refined approximate solution. This process can be repeated.
            </p>
          </div>
        </div>
      {/if}
    </Card>

    <!-- Section 2: Worked Example -->
    <Card>
      <div class="space-y-5">
        <h3 class="text-xl font-semibold text-primary">Worked Example</h3>

        <div class="space-y-2">
          <p class="font-semibold text-primary">System</p>
          <KaTeX
            math={"A = \\begin{pmatrix}6 & -2 & 1\\\\-2 & 7 & 2\\\\1 & 2 & -5\\end{pmatrix}, \\quad \\mathbf{b} = \\begin{pmatrix}11\\\\5\\\\-1\\end{pmatrix}"}
            displayMode
          />
          <p class="text-tertiary">
            True solution: <KaTeX math={"\\mathbf{x} = (2,\\,1,\\,1)^T"} />.
            Gauss-Seidel approximate solution after several iterations:
          </p>
          <KaTeX
            math={"\\bar{\\mathbf{x}} = (2.000119,\\;1.000068,\\;1.000051)^T"}
            displayMode
          />
        </div>

        <div class="space-y-2">
          <p class="font-semibold text-primary">
            Step 1: Compute <KaTeX math={"\\mathbf{r} = \\mathbf{b} - A\\bar{\\mathbf{x}}"} />
          </p>
          <KaTeX
            math={"\\mathbf{r} = \\mathbf{b} - A\\bar{\\mathbf{x}} \\approx (-0.000629,\\;-0.000340,\\;0.000000)^T"}
            displayMode
          />
        </div>

        <div class="space-y-2">
          <p class="font-semibold text-primary">
            Step 2: Solve <KaTeX math={"A\\bar{\\mathbf{e}} = \\mathbf{r}"} />
          </p>
          <KaTeX
            math={"\\bar{\\mathbf{e}} = (-0.000119,\\;-0.000068,\\;-0.000051)^T"}
            displayMode
          />
        </div>

        <div class="space-y-2">
          <p class="font-semibold text-primary">Step 3: Correct</p>
          <KaTeX
            math={"\\bar{\\mathbf{x}}_{\\text{corrected}} = \\bar{\\mathbf{x}} + \\bar{\\mathbf{e}} = (2.000119 - 0.000119,\\;1.000068 - 0.000068,\\;1.000051 - 0.000051)^T"}
            displayMode
          />
          <div class="p-4 bg-green-500/10 border border-green-500">
            <p class="text-green-400 font-semibold">
              Result: <KaTeX math={"\\bar{\\mathbf{x}}_{\\text{corrected}} = (2,\\,1,\\,1)^T"} /> — the true solution. &#9632;
            </p>
          </div>
        </div>
      </div>
    </Card>

    <!-- Section 3: Interactive Calculator -->
    <Card>
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold text-primary">Interactive Residual Calculator</h3>
          <Button onclick={resetCalculator}>Reset to Example</Button>
        </div>

        <p class="text-tertiary text-sm">
          Enter a 3×3 matrix <KaTeX math={"A"} />, vector <KaTeX math={"\\mathbf{b}"} />, and
          approximate solution <KaTeX math={"\\bar{\\mathbf{x}}"} />. The residual
          <KaTeX math={"\\mathbf{r} = \\mathbf{b} - A\\bar{\\mathbf{x}}"} /> is computed live.
        </p>

        <!-- Inputs grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

          <!-- Matrix A -->
          <div class="space-y-2">
            <p class="text-sm font-semibold text-primary">Matrix A</p>
            <div class="grid grid-cols-3 gap-1.5">
              {#each aEntries as row, i}
                {#each row as _, j}
                  <Input
                    type="number"
                    step="any"
                    mono
                    bind:value={aEntries[i][j]}
                    class="text-center"
                  />
                {/each}
              {/each}
            </div>
          </div>

          <!-- Vector b -->
          <div class="space-y-2">
            <p class="text-sm font-semibold text-primary">Vector b</p>
            <div class="flex flex-col gap-1.5">
              {#each bEntries as _, i}
                <Input
                  type="number"
                  step="any"
                  mono
                  bind:value={bEntries[i]}
                  class="text-center"
                />
              {/each}
            </div>
          </div>

          <!-- Approximate x-bar -->
          <div class="space-y-2">
            <p class="text-sm font-semibold text-primary">
              Approximate <KaTeX math={"\\bar{x}"} />
            </p>
            <div class="flex flex-col gap-1.5">
              {#each xBarEntries as _, i}
                <Input
                  type="number"
                  step="any"
                  mono
                  bind:value={xBarEntries[i]}
                  class="text-center"
                />
              {/each}
            </div>
          </div>
        </div>

        <!-- Results -->
        <div class="space-y-4">
          <p class="font-semibold text-primary">Results</p>

          <div class="overflow-x-auto">
            <table class="w-full font-mono text-sm border border-border">
              <thead>
                <tr class="border-b border-border bg-bg">
                  <th class="py-2 px-4 text-left text-tertiary">Component</th>
                  <th class="py-2 px-4 text-right text-tertiary"><KaTeX math={"b_i"} /></th>
                  <th class="py-2 px-4 text-right text-tertiary"><KaTeX math={"(A\\bar{x})_i"} /></th>
                  <th class="py-2 px-4 text-right text-tertiary"><KaTeX math={"r_i"} /></th>
                </tr>
              </thead>
              <tbody>
                {#each residual as ri, i}
                  {@const axRow = A[i].reduce((sum, aij, j) => sum + aij * xBar[j], 0)}
                  <tr class="border-b border-border/50">
                    <td class="py-2 px-4 text-muted">r<sub>{i + 1}</sub></td>
                    <td class="py-2 px-4 text-right text-tertiary">{b[i].toFixed(6)}</td>
                    <td class="py-2 px-4 text-right text-tertiary">{axRow.toFixed(6)}</td>
                    <td class="py-2 px-4 text-right {Math.abs(ri) < 1e-6 ? 'text-green-400' : Math.abs(ri) < 1e-3 ? 'text-yellow-400' : 'text-red-400'}">
                      {ri.toExponential(4)}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <div class="p-4 bg-bg border border-border space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-tertiary">Residual vector <KaTeX math={"\\mathbf{r}"} /></span>
              <span class="font-mono text-primary">
                ({residual.map(v => v.toExponential(4)).join(', ')})
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-tertiary">Infinity norm <KaTeX math={"\\|\\mathbf{r}\\|_\\infty"} /></span>
              <span class="font-mono {rInfNorm < 1e-6 ? 'text-green-400' : rInfNorm < 1e-3 ? 'text-yellow-400' : 'text-red-400'}">
                {rInfNorm.toExponential(4)}
              </span>
            </div>
          </div>

          {#if rInfNorm < 1e-6}
            <div class="p-4 bg-green-500/10 border border-green-500">
              <p class="text-green-400 font-semibold">Excellent approximation — residual is below 10⁻⁶.</p>
            </div>
          {:else if rInfNorm < 1e-3}
            <div class="p-4 bg-yellow-500/10 border border-yellow-500">
              <p class="text-yellow-400 font-semibold">Moderate residual. Iterative refinement may improve accuracy.</p>
            </div>
          {:else}
            <div class="p-4 bg-red-500/10 border border-red-500">
              <p class="text-red-400 font-semibold">Large residual. The approximate solution is far from the true solution.</p>
            </div>
          {/if}
        </div>
      </div>
    </Card>

  </div>
</section>
