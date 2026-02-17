<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card } from '$lib/components/ui';

  // Toggle states
  let showVectorTheory = $state(true);
  let showMatrixTheory = $state(true);
  let showWorkedExamples = $state(false);

  // Vector norm calculator state
  let v1 = $state('1.25');
  let v2 = $state('0.02');
  let v3 = $state('-5.15');
  let v4 = $state('0');

  // Matrix norm calculator state (2x2: [a,b; c,d])
  let ma = $state('5');
  let mb = $state('9');
  let mc = $state('-2');
  let md = $state('1');

  // Derived: vector norms
  const vecComponents = $derived([
    parseFloat(v1) || 0,
    parseFloat(v2) || 0,
    parseFloat(v3) || 0,
    parseFloat(v4) || 0
  ]);

  const norm1 = $derived(
    vecComponents.reduce((sum, x) => sum + Math.abs(x), 0)
  );

  const norm2 = $derived(
    Math.sqrt(vecComponents.reduce((sum, x) => sum + x * x, 0))
  );

  const normInf = $derived(
    Math.max(...vecComponents.map(Math.abs))
  );

  // Derived: matrix norms (2x2)
  const matVals = $derived([
    parseFloat(ma) || 0,
    parseFloat(mb) || 0,
    parseFloat(mc) || 0,
    parseFloat(md) || 0
  ]);

  // ||A||_1 = max column sum
  const matNorm1 = $derived(
    Math.max(
      Math.abs(matVals[0]) + Math.abs(matVals[2]), // col 1
      Math.abs(matVals[1]) + Math.abs(matVals[3])  // col 2
    )
  );

  // ||A||_inf = max row sum
  const matNormInf = $derived(
    Math.max(
      Math.abs(matVals[0]) + Math.abs(matVals[1]), // row 1
      Math.abs(matVals[2]) + Math.abs(matVals[3])  // row 2
    )
  );

  // ||A||_F = sqrt(sum of squares)
  const matNormF = $derived(
    Math.sqrt(matVals.reduce((sum, x) => sum + x * x, 0))
  );
</script>

<section id="matrix-norms">
  <div class="space-y-6">

    <!-- Section 1: Vector Norms Theory -->
    <Card>
      <button
        class="w-full flex items-center justify-between p-0"
        onclick={() => showVectorTheory = !showVectorTheory}
      >
        <h3 class="text-xl font-semibold text-primary">Vector Norms</h3>
        <span class="text-muted">{showVectorTheory ? '▼' : '▶'}</span>
      </button>
      {#if showVectorTheory}
        <div class="mt-4 space-y-4 text-tertiary">
          <p>
            A <strong class="text-primary">vector norm</strong> is a function that assigns a non-negative length or size to a vector.
            For a vector <KaTeX math={'\\mathbf{x} = (x_1, x_2, \\ldots, x_n)'} />, the three most common norms are:
          </p>

          <div class="space-y-4">
            <!-- 1-norm -->
            <div class="bg-bg-3 border border-border p-4 space-y-2">
              <p class="font-semibold text-primary">1-norm (Manhattan / Taxicab)</p>
              <KaTeX math={'\\|\\mathbf{x}\\|_1 = \\sum_{i=1}^{n} |x_i|'} displayMode={true} />
              <p class="text-sm">Sum of absolute values of all components.</p>
            </div>

            <!-- 2-norm -->
            <div class="bg-bg-3 border border-border p-4 space-y-2">
              <p class="font-semibold text-primary">2-norm (Euclidean)</p>
              <KaTeX math={'\\|\\mathbf{x}\\|_2 = \\sqrt{\\sum_{i=1}^{n} x_i^2}'} displayMode={true} />
              <p class="text-sm">The familiar straight-line distance from the origin.</p>
            </div>

            <!-- inf-norm -->
            <div class="bg-bg-3 border border-border p-4 space-y-2">
              <p class="font-semibold text-primary">∞-norm (Maximum / Chebyshev)</p>
              <KaTeX math={'\\|\\mathbf{x}\\|_\\infty = \\max_i |x_i|'} displayMode={true} />
              <p class="text-sm">The largest absolute value among all components.</p>
            </div>
          </div>

          <div class="space-y-2">
            <p class="font-semibold text-primary">Norm Properties (for any valid norm <KaTeX math={'\\|\\cdot\\|'} />)</p>
            <ul class="list-disc list-inside space-y-1 ml-4 text-sm">
              <li><strong>Non-negativity:</strong> <KaTeX math={'\\|\\mathbf{x}\\| \\geq 0'} />, and <KaTeX math={'\\|\\mathbf{x}\\| = 0 \\iff \\mathbf{x} = \\mathbf{0}'} /></li>
              <li><strong>Homogeneity:</strong> <KaTeX math={'\\|\\alpha \\mathbf{x}\\| = |\\alpha|\\, \\|\\mathbf{x}\\|'} /> for any scalar <KaTeX math={'\\alpha'} /></li>
              <li><strong>Triangle inequality:</strong> <KaTeX math={'\\|\\mathbf{x} + \\mathbf{y}\\| \\leq \\|\\mathbf{x}\\| + \\|\\mathbf{y}\\|'} /></li>
            </ul>
          </div>
        </div>
      {/if}
    </Card>

    <!-- Section 2: Matrix Norms Theory -->
    <Card>
      <button
        class="w-full flex items-center justify-between p-0"
        onclick={() => showMatrixTheory = !showMatrixTheory}
      >
        <h3 class="text-xl font-semibold text-primary">Matrix Norms</h3>
        <span class="text-muted">{showMatrixTheory ? '▼' : '▶'}</span>
      </button>
      {#if showMatrixTheory}
        <div class="mt-4 space-y-4 text-tertiary">
          <p>
            Matrix norms extend the concept of vector norms to matrices. The most common induced norms are derived from vector norms via
            <KaTeX math={'\\|A\\| = \\max_{\\mathbf{x} \\neq \\mathbf{0}} \\frac{\\|A\\mathbf{x}\\|}{\\|\\mathbf{x}\\|}'} displayMode={true} />
          </p>

          <div class="space-y-4">
            <!-- 1-norm -->
            <div class="bg-bg-3 border border-border p-4 space-y-2">
              <p class="font-semibold text-primary">1-norm (Maximum Column Sum)</p>
              <KaTeX math={'\\|A\\|_1 = \\max_j \\sum_i |a_{ij}|'} displayMode={true} />
              <p class="text-sm">Take the absolute column sums; the largest one is the 1-norm.</p>
            </div>

            <!-- inf-norm -->
            <div class="bg-bg-3 border border-border p-4 space-y-2">
              <p class="font-semibold text-primary">∞-norm (Maximum Row Sum)</p>
              <KaTeX math={'\\|A\\|_\\infty = \\max_i \\sum_j |a_{ij}|'} displayMode={true} />
              <p class="text-sm">Take the absolute row sums; the largest one is the ∞-norm.</p>
            </div>

            <!-- Frobenius -->
            <div class="bg-bg-3 border border-border p-4 space-y-2">
              <p class="font-semibold text-primary">Frobenius Norm</p>
              <KaTeX math={'\\|A\\|_F = \\sqrt{\\sum_i \\sum_j a_{ij}^2}'} displayMode={true} />
              <p class="text-sm">
                The Frobenius norm is the square root of the sum of all squared entries. It is not an induced norm but satisfies all norm axioms and is submultiplicative.
              </p>
            </div>
          </div>
        </div>
      {/if}
    </Card>

    <!-- Section 3: Vector Norm Calculator -->
    <Card>
      <div class="space-y-4">
        <h3 class="text-xl font-semibold text-primary">Interactive Vector Norm Calculator</h3>
        <p class="text-tertiary text-sm">Enter vector components to compute all three norms in real time.</p>

        <div class="space-y-3">
          <p class="text-muted text-sm font-mono">
            <KaTeX math={'\\mathbf{x} = (x_1,\\, x_2,\\, x_3,\\, x_4)'} />
          </p>
          <div class="flex flex-wrap gap-3 items-center">
            <div class="flex items-center gap-2">
              <span class="text-tertiary text-sm font-mono">x₁ =</span>
              <input
                type="text"
                bind:value={v1}
                class="bg-bg text-primary border border-border-strong px-2 py-1 text-sm font-mono w-20 text-center"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-tertiary text-sm font-mono">x₂ =</span>
              <input
                type="text"
                bind:value={v2}
                class="bg-bg text-primary border border-border-strong px-2 py-1 text-sm font-mono w-20 text-center"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-tertiary text-sm font-mono">x₃ =</span>
              <input
                type="text"
                bind:value={v3}
                class="bg-bg text-primary border border-border-strong px-2 py-1 text-sm font-mono w-20 text-center"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-tertiary text-sm font-mono">x₄ =</span>
              <input
                type="text"
                bind:value={v4}
                class="bg-bg text-primary border border-border-strong px-2 py-1 text-sm font-mono w-20 text-center"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-bg-3 border border-border p-4 space-y-2">
            <p class="text-muted text-xs font-semibold uppercase tracking-wide">1-norm</p>
            <KaTeX math={'\\|\\mathbf{x}\\|_1 = ' + norm1.toFixed(4)} displayMode={true} />
          </div>
          <div class="bg-bg-3 border border-border p-4 space-y-2">
            <p class="text-muted text-xs font-semibold uppercase tracking-wide">2-norm</p>
            <KaTeX math={'\\|\\mathbf{x}\\|_2 = ' + norm2.toFixed(4)} displayMode={true} />
          </div>
          <div class="bg-bg-3 border border-border p-4 space-y-2">
            <p class="text-muted text-xs font-semibold uppercase tracking-wide">∞-norm</p>
            <KaTeX math={'\\|\\mathbf{x}\\|_\\infty = ' + normInf.toFixed(4)} displayMode={true} />
          </div>
        </div>
      </div>
    </Card>

    <!-- Section 4: Matrix Norm Calculator -->
    <Card>
      <div class="space-y-4">
        <h3 class="text-xl font-semibold text-primary">Interactive Matrix Norm Calculator</h3>
        <p class="text-tertiary text-sm">Enter a 2×2 matrix to compute all three matrix norms.</p>

        <div class="space-y-3">
          <p class="text-muted text-sm">
            <KaTeX math={'A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}'} />
          </p>
          <div class="grid grid-cols-2 gap-2 w-fit">
            <div class="flex items-center gap-2">
              <span class="text-tertiary text-sm font-mono">a =</span>
              <input
                type="text"
                bind:value={ma}
                class="bg-bg text-primary border border-border-strong px-2 py-1 text-sm font-mono w-20 text-center"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-tertiary text-sm font-mono">b =</span>
              <input
                type="text"
                bind:value={mb}
                class="bg-bg text-primary border border-border-strong px-2 py-1 text-sm font-mono w-20 text-center"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-tertiary text-sm font-mono">c =</span>
              <input
                type="text"
                bind:value={mc}
                class="bg-bg text-primary border border-border-strong px-2 py-1 text-sm font-mono w-20 text-center"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-tertiary text-sm font-mono">d =</span>
              <input
                type="text"
                bind:value={md}
                class="bg-bg text-primary border border-border-strong px-2 py-1 text-sm font-mono w-20 text-center"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-bg-3 border border-border p-4 space-y-2">
            <p class="text-muted text-xs font-semibold uppercase tracking-wide">1-norm (max col sum)</p>
            <KaTeX math={'\\|A\\|_1 = ' + matNorm1.toFixed(4)} displayMode={true} />
          </div>
          <div class="bg-bg-3 border border-border p-4 space-y-2">
            <p class="text-muted text-xs font-semibold uppercase tracking-wide">∞-norm (max row sum)</p>
            <KaTeX math={'\\|A\\|_\\infty = ' + matNormInf.toFixed(4)} displayMode={true} />
          </div>
          <div class="bg-bg-3 border border-border p-4 space-y-2">
            <p class="text-muted text-xs font-semibold uppercase tracking-wide">Frobenius norm</p>
            <KaTeX math={'\\|A\\|_F = ' + matNormF.toFixed(4)} displayMode={true} />
          </div>
        </div>
      </div>
    </Card>

    <!-- Section 5: Worked Examples -->
    <Card>
      <button
        class="w-full flex items-center justify-between p-0"
        onclick={() => showWorkedExamples = !showWorkedExamples}
      >
        <h3 class="text-xl font-semibold text-primary">Worked Examples</h3>
        <span class="text-muted">{showWorkedExamples ? '▼' : '▶'}</span>
      </button>
      {#if showWorkedExamples}
        <div class="mt-4 space-y-8 text-tertiary">

          <!-- Example 1: Vector -->
          <div class="space-y-4">
            <p class="font-semibold text-primary text-lg">Example 1: Vector Norms</p>
            <p>
              Let <KaTeX math={'\\mathbf{x} = (1.25,\\; 0.02,\\; -5.15,\\; 0)'} />.
              Compute <KaTeX math={'\\|\\mathbf{x}\\|_1'} />, <KaTeX math={'\\|\\mathbf{x}\\|_2'} />, and <KaTeX math={'\\|\\mathbf{x}\\|_\\infty'} />.
            </p>

            <div class="bg-bg-2 border border-border p-4 space-y-4">
              <div>
                <p class="font-semibold text-primary mb-1">1-norm:</p>
                <KaTeX math={'\\|\\mathbf{x}\\|_1 = |1.25| + |0.02| + |-5.15| + |0| = 1.25 + 0.02 + 5.15 + 0 = 6.42'} displayMode={true} />
              </div>
              <div>
                <p class="font-semibold text-primary mb-1">2-norm:</p>
                <KaTeX math={'\\|\\mathbf{x}\\|_2 = \\sqrt{1.25^2 + 0.02^2 + (-5.15)^2 + 0^2} = \\sqrt{1.5625 + 0.0004 + 26.5225} \\approx \\sqrt{28.0854} \\approx 5.2997'} displayMode={true} />
              </div>
              <div>
                <p class="font-semibold text-primary mb-1">∞-norm:</p>
                <KaTeX math={'\\|\\mathbf{x}\\|_\\infty = \\max(1.25,\\; 0.02,\\; 5.15,\\; 0) = 5.15'} displayMode={true} />
              </div>
            </div>

            <div class="p-4 bg-green-500/10 border border-green-500">
              <KaTeX math={'\\|\\mathbf{x}\\|_1 = 6.42, \\quad \\|\\mathbf{x}\\|_2 \\approx 5.30, \\quad \\|\\mathbf{x}\\|_\\infty = 5.15'} displayMode={true} />
            </div>
          </div>

          <!-- Example 2: Matrix A -->
          <div class="space-y-4">
            <p class="font-semibold text-primary text-lg">Example 2: Matrix A = [5, 9; −2, 1]</p>
            <p>
              Let
              <KaTeX math={'A = \\begin{bmatrix} 5 & 9 \\\\ -2 & 1 \\end{bmatrix}'} />.
              Compute <KaTeX math={'\\|A\\|_1'} />, <KaTeX math={'\\|A\\|_\\infty'} />, and <KaTeX math={'\\|A\\|_F'} />.
            </p>

            <div class="bg-bg-2 border border-border p-4 space-y-4">
              <div>
                <p class="font-semibold text-primary mb-1">Frobenius norm:</p>
                <KaTeX math={'\\|A\\|_F = \\sqrt{5^2 + 9^2 + (-2)^2 + 1^2} = \\sqrt{25 + 81 + 4 + 1} = \\sqrt{111} \\approx 10.54'} displayMode={true} />
              </div>
              <div>
                <p class="font-semibold text-primary mb-1">∞-norm (max row sum):</p>
                <KaTeX math={'\\text{Row 1}: |5| + |9| = 14, \\quad \\text{Row 2}: |-2| + |1| = 3'} displayMode={true} />
                <KaTeX math={'\\|A\\|_\\infty = \\max(14,\\; 3) = 14'} displayMode={true} />
              </div>
              <div>
                <p class="font-semibold text-primary mb-1">1-norm (max column sum):</p>
                <KaTeX math={'\\text{Col 1}: |5| + |-2| = 7, \\quad \\text{Col 2}: |9| + |1| = 10'} displayMode={true} />
                <KaTeX math={'\\|A\\|_1 = \\max(7,\\; 10) = 10'} displayMode={true} />
              </div>
            </div>

            <div class="p-4 bg-green-500/10 border border-green-500">
              <KaTeX math={'\\|A\\|_F \\approx 10.54, \\quad \\|A\\|_\\infty = 14, \\quad \\|A\\|_1 = 10'} displayMode={true} />
            </div>
          </div>

          <!-- Example 3: Matrix B -->
          <div class="space-y-4">
            <p class="font-semibold text-primary text-lg">Example 3: Matrix B = [0.1, 0; 0.2, 0.1]</p>
            <p>
              Let
              <KaTeX math={'B = \\begin{bmatrix} 0.1 & 0 \\\\ 0.2 & 0.1 \\end{bmatrix}'} />.
              Compute <KaTeX math={'\\|B\\|_F'} />, <KaTeX math={'\\|B\\|_\\infty'} />, and <KaTeX math={'\\|B\\|_1'} />.
            </p>

            <div class="bg-bg-2 border border-border p-4 space-y-4">
              <div>
                <p class="font-semibold text-primary mb-1">Frobenius norm:</p>
                <KaTeX math={'\\|B\\|_F = \\sqrt{0.1^2 + 0^2 + 0.2^2 + 0.1^2} = \\sqrt{0.01 + 0 + 0.04 + 0.01} = \\sqrt{0.06} \\approx 0.245'} displayMode={true} />
              </div>
              <div>
                <p class="font-semibold text-primary mb-1">∞-norm (max row sum):</p>
                <KaTeX math={'\\text{Row 1}: 0.1 + 0 = 0.1, \\quad \\text{Row 2}: 0.2 + 0.1 = 0.3'} displayMode={true} />
                <KaTeX math={'\\|B\\|_\\infty = \\max(0.1,\\; 0.3) = 0.3'} displayMode={true} />
              </div>
              <div>
                <p class="font-semibold text-primary mb-1">1-norm (max column sum):</p>
                <KaTeX math={'\\text{Col 1}: 0.1 + 0.2 = 0.3, \\quad \\text{Col 2}: 0 + 0.1 = 0.1'} displayMode={true} />
                <KaTeX math={'\\|B\\|_1 = \\max(0.3,\\; 0.1) = 0.3'} displayMode={true} />
              </div>
            </div>

            <div class="p-4 bg-green-500/10 border border-green-500">
              <KaTeX math={'\\|B\\|_F \\approx 0.245, \\quad \\|B\\|_\\infty = 0.3, \\quad \\|B\\|_1 = 0.3'} displayMode={true} />
            </div>
          </div>

        </div>
      {/if}
    </Card>

  </div>
</section>
