<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Button, Input } from '$lib/components/ui';
  import { DEFAULT_A, DEFAULT_B, type LUStep } from '../types.ts';
  import { deepCopyMatrix } from '../utils.ts';

  let luA = $state(deepCopyMatrix(DEFAULT_A));
  let luB = $state([...DEFAULT_B]);
  let luSteps = $state<LUStep[]>([]);
  let luCurrentStep = $state(0);
  let luY = $state<number[]>([]);
  let luX = $state<number[]>([]);
  let luShowTheory = $state(false);

  function resetLU() {
    luA = deepCopyMatrix(DEFAULT_A);
    luB = [...DEFAULT_B];
    luSteps = [];
    luCurrentStep = 0;
    luY = [];
    luX = [];
  }

  function runLUDecomposition() {
    resetLU();
    const n = luA.length;
    const L: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
    const U: number[][] = luA.map(row => [...row]);

    // Initialize L diagonal to 1
    for (let i = 0; i < n; i++) {
      L[i][i] = 1;
    }

    luSteps.push({
      L: L.map(row => [...row]),
      U: U.map(row => [...row]),
      desc: 'Initial: L = I, U = A',
      step: 0
    });

    let stepNum = 1;
    for (let k = 0; k < n - 1; k++) {
      for (let i = k + 1; i < n; i++) {
        const multiplier = U[i][k] / U[k][k];
        L[i][k] = multiplier;

        luSteps.push({
          L: L.map(row => [...row]),
          U: U.map(row => [...row]),
          desc: `L[${i + 1}][${k + 1}] = ${multiplier.toFixed(3)}`,
          step: stepNum++
        });

        for (let j = k; j < n; j++) {
          U[i][j] -= multiplier * U[k][j];
        }

        luSteps.push({
          L: L.map(row => [...row]),
          U: U.map(row => [...row]),
          desc: `U: Row ${i + 1} -= ${multiplier.toFixed(3)} * Row ${k + 1}`,
          step: stepNum++
        });
      }
    }

    // Forward substitution: Ly = b
    const y = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < i; j++) {
        sum += L[i][j] * y[j];
      }
      y[i] = luB[i] - sum;
    }
    luY = y;

    luSteps.push({
      L: L.map(row => [...row]),
      U: U.map(row => [...row]),
      desc: `Forward substitution: y = [${y.map(v => v.toFixed(2)).join(', ')}]`,
      step: stepNum++
    });

    // Back substitution: Ux = y
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) {
        sum += U[i][j] * x[j];
      }
      x[i] = (y[i] - sum) / U[i][i];
    }
    luX = x;

    luSteps.push({
      L: L.map(row => [...row]),
      U: U.map(row => [...row]),
      desc: `Back substitution: x = [${x.map(v => v.toFixed(2)).join(', ')}]`,
      step: stepNum++
    });

    luCurrentStep = luSteps.length;
  }

  function nextLUStep() {
    if (luCurrentStep < luSteps.length) {
      luCurrentStep++;
    }
  }

  function prevLUStep() {
    if (luCurrentStep > 0) {
      luCurrentStep--;
    }
  }

  let showExample = $state(false);

  // Practice problem
  let luPracticeUserSol = $state<string[]>(['', '', '']);
  let luPracticeCorrect = $state<boolean | null>(null);

  function checkLUPractice() {
    const userSol = luPracticeUserSol.map(x => parseFloat(x));
    const correctSol = [1, 2, 3];
    const tolerance = 0.01;
    luPracticeCorrect = userSol.every((val, i) =>
      Math.abs(val - correctSol[i]) < tolerance
    );
  }
</script>

<div class="space-y-6">
  <!-- Theory -->
  <Card>
    <button
      class="w-full flex items-center justify-between p-4"
      onclick={() => luShowTheory = !luShowTheory}
    >
      <h3 class="text-xl font-semibold text-primary">Theory</h3>
      <span class="text-muted">{luShowTheory ? '▼' : '▶'}</span>
    </button>
    {#if luShowTheory}
      <div class="px-4 pb-4 space-y-4 text-tertiary">
        <p>
          LU decomposition factors a matrix A into the product of a lower triangular matrix L and an upper triangular matrix U: A = LU
        </p>
        <div class="space-y-2">
          <p class="font-semibold text-primary">Algorithm:</p>
          <ol class="list-decimal list-inside space-y-2 ml-4">
            <li>
              <strong>Decomposition:</strong> Use Gaussian elimination to find L and U
              <div class="mt-2">
                <KaTeX math={'L_{ij} = \\frac{a_{ij}^{(j-1)}}{a_{jj}^{(j-1)}}'} displayMode />
                <KaTeX math={'U = \\text{upper triangular result}'} displayMode />
              </div>
            </li>
            <li>
              <strong>Forward Substitution:</strong> Solve Ly = b for y
              <KaTeX math={'y_i = b_i - \\sum_{j=1}^{i-1} L_{ij}y_j'} />
            </li>
            <li>
              <strong>Back Substitution:</strong> Solve Ux = y for x
              <KaTeX math={'x_i = \\frac{y_i - \\sum_{j=i+1}^n U_{ij}x_j}{U_{ii}}'} />
            </li>
          </ol>
        </div>
        <p class="text-sm">
          <strong>Advantage:</strong> Once decomposed, solving for different b vectors is O(n^2) instead of O(n^3)
        </p>
      </div>
    {/if}
  </Card>

  <!-- Visualizer -->
  <Card>
    <div class="p-6">
      <h3 class="text-xl font-semibold text-primary mb-4">Interactive Visualizer</h3>

      <div class="mb-4">
        <p class="text-muted mb-2">System: Same as Gaussian elimination</p>
      </div>

      <div class="flex gap-4 mb-6">
        <Button onclick={runLUDecomposition}>Run Decomposition</Button>
        <Button onclick={resetLU} disabled={luSteps.length === 0}>Reset</Button>
      </div>

      {#if luSteps.length > 0}
        <div class="space-y-4">
          <!-- Step controls -->
          <div class="flex items-center gap-4">
            <Button onclick={prevLUStep} disabled={luCurrentStep === 0}>Previous</Button>
            <span class="text-tertiary">Step {luCurrentStep} of {luSteps.length}</span>
            <Button onclick={nextLUStep} disabled={luCurrentStep === luSteps.length}>Next</Button>
          </div>

          {#if luCurrentStep > 0}
            {@const step = luSteps[luCurrentStep - 1]}

            <div class="bg-bg-2 p-4 border border-border">
              <p class="text-primary font-semibold mb-4">{step.desc}</p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- L Matrix -->
                <div>
                  <h4 class="text-tertiary font-semibold mb-2">L (Lower Triangular)</h4>
                  <div class="font-mono text-sm">
                    {#each step.L as row}
                      <div class="flex gap-2 mb-1">
                        {#each row as cell}
                          <div class="w-20 text-center py-2 px-1 bg-bg-3 border border-border">
                            {cell.toFixed(3)}
                          </div>
                        {/each}
                      </div>
                    {/each}
                  </div>
                </div>

                <!-- U Matrix -->
                <div>
                  <h4 class="text-tertiary font-semibold mb-2">U (Upper Triangular)</h4>
                  <div class="font-mono text-sm">
                    {#each step.U as row}
                      <div class="flex gap-2 mb-1">
                        {#each row as cell}
                          <div class="w-20 text-center py-2 px-1 bg-bg-3 border border-border">
                            {cell.toFixed(3)}
                          </div>
                        {/each}
                      </div>
                    {/each}
                  </div>
                </div>
              </div>

              {#if luX.length > 0 && luCurrentStep === luSteps.length}
                <div class="mt-6 space-y-4">
                  <div class="p-4 bg-blue-500/10 border border-blue-500">
                    <p class="text-primary font-semibold mb-2">Forward Substitution (Ly = b):</p>
                    <div class="font-mono">
                      y = [{luY.map(v => v.toFixed(4)).join(', ')}]
                    </div>
                  </div>

                  <div class="p-4 bg-green-500/10 border border-green-500">
                    <p class="text-primary font-semibold mb-2">Back Substitution (Ux = y):</p>
                    <div class="font-mono">
                      x = [{luX.map(v => v.toFixed(4)).join(', ')}]
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </Card>

  <!-- Worked Example -->
  <Card>
    <button
      class="w-full flex items-center justify-between p-4"
      onclick={() => showExample = !showExample}
    >
      <h3 class="text-xl font-semibold text-primary">Worked Example</h3>
      <span class="text-muted">{showExample ? '▼' : '▶'}</span>
    </button>
    {#if showExample}
      <div class="px-4 pb-4 space-y-6 text-tertiary">
        <p class="text-sm">
          Solve the system <KaTeX math={'A\\mathbf{x} = \\mathbf{b}'} /> where
        </p>

        <div class="space-y-2">
          <KaTeX math={'A = \\begin{bmatrix} 1 & 1 & 1 \\\\ 4 & 3 & 2 \\\\ 0 & -2 & 1 \\end{bmatrix}, \\quad \\mathbf{b} = \\begin{bmatrix} 900000 \\\\ 2700000 \\\\ 0 \\end{bmatrix}'} displayMode />
        </div>

        <!-- Step 1 -->
        <div class="space-y-3">
          <p class="font-semibold text-primary">Step 1: Find L and U via Gaussian Elimination</p>
          <p>Compute multipliers and eliminate column 1:</p>
          <KaTeX math={'m_{21} = \\frac{4}{1} = 4, \\quad m_{31} = \\frac{0}{1} = 0'} displayMode />
          <p>After eliminating column 1, the working matrix becomes:</p>
          <KaTeX math={'\\begin{bmatrix} 1 & 1 & 1 \\\\ 0 & -1 & -2 \\\\ 0 & -2 & 1 \\end{bmatrix}'} displayMode />
          <p>Compute multiplier for column 2:</p>
          <KaTeX math={'m_{32} = \\frac{-2}{-1} = 2'} displayMode />
          <p>The resulting factorization is:</p>
          <KaTeX math={'L = \\begin{bmatrix} 1 & 0 & 0 \\\\ 4 & -1 & 0 \\\\ 0 & -2 & 5 \\end{bmatrix}, \\quad U = \\begin{bmatrix} 1 & 1 & 1 \\\\ 0 & 1 & 2 \\\\ 0 & 0 & 1 \\end{bmatrix}'} displayMode />
          <div class="p-3 bg-blue-500/10 border border-blue-500 text-sm">
            Verify: <KaTeX math={'L \\times U = A'} /> ✓
          </div>
        </div>

        <!-- Step 2 -->
        <div class="space-y-3">
          <p class="font-semibold text-primary">Step 2: Solve <KaTeX math={'L\\mathbf{y} = \\mathbf{b}'} /> (Forward Substitution)</p>
          <KaTeX math={'\\begin{bmatrix} 1 & 0 & 0 \\\\ 4 & -1 & 0 \\\\ 0 & -2 & 5 \\end{bmatrix} \\begin{bmatrix} y_1 \\\\ y_2 \\\\ y_3 \\end{bmatrix} = \\begin{bmatrix} 900000 \\\\ 2700000 \\\\ 0 \\end{bmatrix}'} displayMode />
          <ul class="list-disc list-inside space-y-2 ml-2 text-sm">
            <li><KaTeX math={'y_1 = 900000'} /></li>
            <li><KaTeX math={'4y_1 - y_2 = 2700000 \\Rightarrow y_2 = 4(900000) - 2700000 = 900000'} /></li>
            <li><KaTeX math={'-2y_2 + 5y_3 = 0 \\Rightarrow y_3 = \\frac{2(900000)}{5} = 360000'} /></li>
          </ul>
          <KaTeX math={'\\mathbf{y} = \\begin{bmatrix} 900000 \\\\ 900000 \\\\ 360000 \\end{bmatrix}'} displayMode />
        </div>

        <!-- Step 3 -->
        <div class="space-y-3">
          <p class="font-semibold text-primary">Step 3: Solve <KaTeX math={'U\\mathbf{x} = \\mathbf{y}'} /> (Back Substitution)</p>
          <KaTeX math={'\\begin{bmatrix} 1 & 1 & 1 \\\\ 0 & 1 & 2 \\\\ 0 & 0 & 1 \\end{bmatrix} \\begin{bmatrix} x_1 \\\\ x_2 \\\\ x_3 \\end{bmatrix} = \\begin{bmatrix} 900000 \\\\ 900000 \\\\ 360000 \\end{bmatrix}'} displayMode />
          <ul class="list-disc list-inside space-y-2 ml-2 text-sm">
            <li><KaTeX math={'x_3 = 360000'} /></li>
            <li><KaTeX math={'x_2 + 2(360000) = 900000 \\Rightarrow x_2 = 180000'} /></li>
            <li><KaTeX math={'x_1 + 180000 + 360000 = 900000 \\Rightarrow x_1 = 360000'} /></li>
          </ul>
        </div>

        <!-- Result -->
        <div class="p-4 bg-green-500/10 border border-green-500 space-y-2">
          <p class="font-semibold text-primary">Solution</p>
          <KaTeX math={'\\mathbf{x} = \\begin{bmatrix} 360000 \\\\ 180000 \\\\ 360000 \\end{bmatrix} \\blacksquare'} displayMode />
        </div>
      </div>
    {/if}
  </Card>

  <!-- Practice Problem -->
  <Card>
    <div class="p-6">
      <h3 class="text-xl font-semibold text-primary mb-4">Practice Problem</h3>

      <div class="mb-4">
        <p class="text-tertiary mb-2">Solve using LU decomposition:</p>
        <div class="bg-bg-2 p-4 border border-border font-mono text-sm">
          <div>x₁ + 2x₂ + 3x₃ = 14</div>
          <div>2x₁ + 5x₂ + 2x₃ = 18</div>
          <div>3x₁ + x₂ + 5x₃ = 20</div>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex items-center gap-4">
          <span class="w-20 text-tertiary">x₁ =</span>
          <Input
            type="number"
            step="0.01"
            bind:value={luPracticeUserSol[0]}
            class="w-32"
          />
        </div>
        <div class="flex items-center gap-4">
          <span class="w-20 text-tertiary">x₂ =</span>
          <Input
            type="number"
            step="0.01"
            bind:value={luPracticeUserSol[1]}
            class="w-32"
          />
        </div>
        <div class="flex items-center gap-4">
          <span class="w-20 text-tertiary">x₃ =</span>
          <Input
            type="number"
            step="0.01"
            bind:value={luPracticeUserSol[2]}
            class="w-32"
          />
        </div>

        <Button onclick={checkLUPractice}>Check Answer</Button>

        {#if luPracticeCorrect !== null}
          <div class="p-4 border {luPracticeCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}">
            {luPracticeCorrect ? '✓ Correct! Solution: x = [1, 2, 3]' : '✗ Incorrect. Try again!'}
          </div>
        {/if}
      </div>
    </div>
  </Card>
</div>
