<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Button, Input } from '$lib/components/ui';
  import CodeTabs from '$lib/components/CodeTabs.svelte';
  import { DEFAULT_A, DEFAULT_B, type GaussStep } from '../types.ts';
  import { deepCopyMatrix } from '../utils.ts';

  let gaussA = $state(deepCopyMatrix(DEFAULT_A));
  let gaussB = $state([...DEFAULT_B]);
  let gaussSteps = $state<GaussStep[]>([]);
  let gaussCurrentStep = $state(0);
  let gaussSolution = $state<number[]>([]);
  let gaussShowTheory = $state(false);

  function resetGauss() {
    gaussA = deepCopyMatrix(DEFAULT_A);
    gaussB = [...DEFAULT_B];
    gaussSteps = [];
    gaussCurrentStep = 0;
    gaussSolution = [];
  }

  function runGaussElimination() {
    resetGauss();
    const n = gaussA.length;
    const A = gaussA.map(row => [...row]);
    const b = [...gaussB];

    gaussSteps.push({
      matrix: A.map(row => [...row]),
      vector: [...b],
      desc: 'Initial augmented matrix'
    });

    // Forward elimination
    for (let k = 0; k < n - 1; k++) {
      for (let i = k + 1; i < n; i++) {
        const multiplier = A[i][k] / A[k][k];

        gaussSteps.push({
          matrix: A.map(row => [...row]),
          vector: [...b],
          desc: `Row ${i + 1}: Eliminate x${k + 1} using Row ${k + 1}`,
          pivotRow: k,
          targetRow: i,
          multiplier
        });

        for (let j = k; j < n; j++) {
          A[i][j] -= multiplier * A[k][j];
        }
        b[i] -= multiplier * b[k];

        gaussSteps.push({
          matrix: A.map(row => [...row]),
          vector: [...b],
          desc: `Row ${i + 1} = Row ${i + 1} - (${multiplier.toFixed(3)}) * Row ${k + 1}`
        });
      }
    }

    // Back substitution
    gaussSteps.push({
      matrix: A.map(row => [...row]),
      vector: [...b],
      desc: 'Upper triangular form achieved. Starting back substitution...'
    });

    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) {
        sum += A[i][j] * x[j];
      }
      x[i] = (b[i] - sum) / A[i][i];

      gaussSteps.push({
        matrix: A.map(row => [...row]),
        vector: [...b],
        desc: `x${i + 1} = ${x[i].toFixed(4)}`
      });
    }

    gaussSolution = x;
    gaussCurrentStep = gaussSteps.length;
  }

  function nextGaussStep() {
    if (gaussCurrentStep < gaussSteps.length) {
      gaussCurrentStep++;
    }
  }

  function prevGaussStep() {
    if (gaussCurrentStep > 0) {
      gaussCurrentStep--;
    }
  }

  // Practice problem
  let gaussPracticeUserSol = $state<string[]>(['', '', '']);
  let gaussPracticeCorrect = $state<boolean | null>(null);

  function checkGaussPractice() {
    const userSol = gaussPracticeUserSol.map(x => parseFloat(x));
    const correctSol = [2, 3, -1];
    const tolerance = 0.01;
    gaussPracticeCorrect = userSol.every((val, i) =>
      Math.abs(val - correctSol[i]) < tolerance
    );
  }

  let showExample = $state(false);
</script>

<div class="space-y-6">
  <!-- Theory -->
  <Card>
    <button
      class="w-full flex items-center justify-between p-4"
      onclick={() => gaussShowTheory = !gaussShowTheory}
    >
      <h3 class="text-xl font-semibold text-primary">Theory</h3>
      <span class="text-muted">{gaussShowTheory ? '▼' : '▶'}</span>
    </button>
    {#if gaussShowTheory}
      <div class="px-4 pb-4 space-y-4 text-tertiary">
        <p>
          Gaussian elimination transforms a system of linear equations into an upper triangular form through row operations, then solves via back substitution.
        </p>
        <div class="space-y-2">
          <p class="font-semibold text-primary">Algorithm:</p>
          <ol class="list-decimal list-inside space-y-2 ml-4">
            <li>
              <strong>Forward Elimination:</strong> For each pivot row k, eliminate all entries below the pivot
              <KaTeX math={'m_{ik} = \\frac{a_{ik}}{a_{kk}}'} />
              <KaTeX math={'R_i \\leftarrow R_i - m_{ik} \\cdot R_k'} />
            </li>
            <li>
              <strong>Back Substitution:</strong> Starting from the last row, solve for each variable
              <KaTeX math={'x_i = \\frac{b_i - \\sum_{j=i+1}^n a_{ij}x_j}{a_{ii}}'} />
            </li>
          </ol>
        </div>
        <p class="text-sm">
          <strong>Complexity:</strong> O(n^3) operations for an n x n system
        </p>
      </div>
    {/if}
  </Card>

  <!-- Visualizer -->
  <Card>
    <div class="p-6">
      <h3 class="text-xl font-semibold text-primary mb-4">Interactive Visualizer</h3>

      <div class="mb-4">
        <p class="text-muted mb-2">System: 4x₁ - x₂ + x₃ = 7, 4x₁ - 8x₂ + x₃ = -21, -2x₁ + x₂ + 5x₃ = 15</p>
        <p class="text-tertiary text-sm">Solution: x = [2, 4, 3]</p>
      </div>

      <div class="flex gap-4 mb-6">
        <Button onclick={runGaussElimination}>Run Full Algorithm</Button>
        <Button onclick={resetGauss} disabled={gaussSteps.length === 0}>Reset</Button>
      </div>

      {#if gaussSteps.length > 0}
        <div class="space-y-4">
          <!-- Step controls -->
          <div class="flex items-center gap-4">
            <Button onclick={prevGaussStep} disabled={gaussCurrentStep === 0}>Previous</Button>
            <span class="text-tertiary">Step {gaussCurrentStep} of {gaussSteps.length}</span>
            <Button onclick={nextGaussStep} disabled={gaussCurrentStep === gaussSteps.length}>Next</Button>
          </div>

          {#if gaussCurrentStep > 0}
            {@const step = gaussSteps[gaussCurrentStep - 1]}

            <div class="bg-bg-2 p-4 border border-border">
              <p class="text-primary font-semibold mb-4">{step.desc}</p>

              {#if step.multiplier !== undefined}
                <div class="mb-4 p-3 bg-bg-3 border border-accent">
                  <KaTeX math={'m = ' + step.multiplier.toFixed(4)} />
                </div>
              {/if}

              <!-- Augmented Matrix -->
              <div class="overflow-x-auto">
                <div class="font-mono text-sm inline-block">
                  {#each step.matrix as row, i}
                    <div class="flex gap-2 mb-1">
                      {#each row as cell, j}
                        <div
                          class="w-20 text-center py-2 px-1 border transition-colors {
                            step.pivotRow === i ? 'bg-blue-500/20 border-blue-500' :
                            step.targetRow === i ? 'bg-pink-500/20 border-pink-500' :
                            'bg-bg-3 border-border'
                          }"
                        >
                          {cell.toFixed(3)}
                        </div>
                      {/each}
                      <div class="w-4 text-center text-muted">|</div>
                      <div
                        class="w-20 text-center py-2 px-1 border transition-colors {
                          step.pivotRow === i ? 'bg-blue-500/20 border-blue-500' :
                          step.targetRow === i ? 'bg-pink-500/20 border-pink-500' :
                          'bg-bg-3 border-border'
                        }"
                      >
                        {step.vector[i].toFixed(3)}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>

              {#if gaussSolution.length > 0 && gaussCurrentStep === gaussSteps.length}
                <div class="mt-4 p-4 bg-green-500/10 border border-green-500">
                  <p class="text-primary font-semibold mb-2">Final Solution:</p>
                  <div class="font-mono">
                    {#each gaussSolution as x, i}
                      <div>x{i + 1} = {x.toFixed(4)}</div>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </Card>

  <!-- Practice Problem -->
  <Card>
    <div class="p-6">
      <h3 class="text-xl font-semibold text-primary mb-4">Practice Problem</h3>

      <div class="mb-4">
        <p class="text-tertiary mb-2">Solve the system using Gaussian elimination:</p>
        <div class="bg-bg-2 p-4 border border-border font-mono text-sm">
          <div>2x₁ + x₂ - x₃ = 8</div>
          <div>-3x₁ - x₂ + 2x₃ = -11</div>
          <div>-2x₁ + x₂ + 2x₃ = -3</div>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex items-center gap-4">
          <span class="w-20 text-tertiary">x₁ =</span>
          <Input
            type="number"
            step="0.01"
            bind:value={gaussPracticeUserSol[0]}
            class="w-32"
          />
        </div>
        <div class="flex items-center gap-4">
          <span class="w-20 text-tertiary">x₂ =</span>
          <Input
            type="number"
            step="0.01"
            bind:value={gaussPracticeUserSol[1]}
            class="w-32"
          />
        </div>
        <div class="flex items-center gap-4">
          <span class="w-20 text-tertiary">x₃ =</span>
          <Input
            type="number"
            step="0.01"
            bind:value={gaussPracticeUserSol[2]}
            class="w-32"
          />
        </div>

        <Button onclick={checkGaussPractice}>Check Answer</Button>

        {#if gaussPracticeCorrect !== null}
          <div class="p-4 border {gaussPracticeCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}">
            {gaussPracticeCorrect ? '✓ Correct! Solution: x = [2, 3, -1]' : '✗ Incorrect. Try again!'}
          </div>
        {/if}
      </div>
    </div>
  </Card>

  <!-- Worked Example -->
  <Card>
    <button
      class="w-full flex items-center justify-between p-4"
      onclick={() => showExample = !showExample}
    >
      <h3 class="text-xl font-semibold text-primary">Worked Example (Gauss-Jordan)</h3>
      <span class="text-muted">{showExample ? '▼' : '▶'}</span>
    </button>
    {#if showExample}
      <div class="px-4 pb-6 space-y-6 text-tertiary">
        <p>
          Solve the system using Gauss-Jordan elimination:
          <KaTeX math={'x_1 + x_2 + x_3 = 900{,}000,\\quad 4x_1 + 3x_2 + 2x_3 = 2{,}700{,}000,\\quad -2x_2 + x_3 = 0'} displayMode={true} />
        </p>

        <!-- Step 1 -->
        <div class="space-y-2">
          <p class="font-semibold text-primary">Step 1: Augmented Matrix</p>
          <KaTeX math={'\\left[\\begin{array}{ccc|c} 1 & 1 & 1 & 900000 \\\\ 4 & 3 & 2 & 2700000 \\\\ 0 & -2 & 1 & 0 \\end{array}\\right]'} displayMode={true} />
        </div>

        <!-- Step 2 -->
        <div class="space-y-2">
          <p class="font-semibold text-primary">Step 2: <KaTeX math={'-4r_1 + r_2 \\to r_2'} /> </p>
          <KaTeX math={'\\left[\\begin{array}{ccc|c} 1 & 1 & 1 & 900000 \\\\ 0 & -1 & -2 & -900000 \\\\ 0 & -2 & 1 & 0 \\end{array}\\right]'} displayMode={true} />
        </div>

        <!-- Step 3 -->
        <div class="space-y-2">
          <p class="font-semibold text-primary">Step 3: <KaTeX math={'-1 \\cdot r_2 \\to r_2'} /> </p>
          <KaTeX math={'\\left[\\begin{array}{ccc|c} 1 & 1 & 1 & 900000 \\\\ 0 & 1 & 2 & 900000 \\\\ 0 & -2 & 1 & 0 \\end{array}\\right]'} displayMode={true} />
        </div>

        <!-- Step 4 -->
        <div class="space-y-2">
          <p class="font-semibold text-primary">Step 4: <KaTeX math={'2r_2 + r_3 \\to r_3'} /> </p>
          <KaTeX math={'\\left[\\begin{array}{ccc|c} 1 & 1 & 1 & 900000 \\\\ 0 & 1 & 2 & 900000 \\\\ 0 & 0 & 5 & 1800000 \\end{array}\\right]'} displayMode={true} />
        </div>

        <!-- Step 5 -->
        <div class="space-y-2">
          <p class="font-semibold text-primary">Step 5: <KaTeX math={'r_3 / 5 \\to r_3'} /> </p>
          <KaTeX math={'\\left[\\begin{array}{ccc|c} 1 & 1 & 1 & 900000 \\\\ 0 & 1 & 2 & 900000 \\\\ 0 & 0 & 1 & 360000 \\end{array}\\right]'} displayMode={true} />
        </div>

        <!-- Step 6 -->
        <div class="space-y-2">
          <p class="font-semibold text-primary">Step 6: Back Substitution</p>
          <div class="space-y-1 ml-4">
            <KaTeX math={'x_3 = 360{,}000'} displayMode={true} />
            <KaTeX math={'x_2 + 2(360{,}000) = 900{,}000 \\implies x_2 = 180{,}000'} displayMode={true} />
            <KaTeX math={'x_1 + 180{,}000 + 360{,}000 = 900{,}000 \\implies x_1 = 360{,}000'} displayMode={true} />
          </div>
        </div>

        <div class="p-4 bg-green-500/10 border border-green-500">
          <p class="font-semibold text-primary">Solution:</p>
          <KaTeX math={'x_1 = 360{,}000,\\quad x_2 = 180{,}000,\\quad x_3 = 360{,}000 \\quad \\blacksquare'} displayMode={true} />
        </div>
      </div>
    {/if}
  </Card>

  <CodeTabs codes={{
    pseudocode: `INPUT: augmented matrix [A|b] of size n×(n+1)
OUTPUT: solution vector x

// Forward elimination
for k = 1 to n-1:
    for i = k+1 to n:
        m = A[i][k] / A[k][k]
        for j = k to n+1:
            A[i][j] = A[i][j] - m * A[k][j]

// Back substitution
for i = n down to 1:
    x[i] = A[i][n+1]
    for j = i+1 to n:
        x[i] = x[i] - A[i][j] * x[j]
    x[i] = x[i] / A[i][i]

RETURN x`,
    python: `import numpy as np

def gauss_elimination(A, b):
    n = len(b)
    Ab = np.column_stack([A.astype(float), b.astype(float)])

    # Forward elimination
    for k in range(n - 1):
        for i in range(k + 1, n):
            m = Ab[i, k] / Ab[k, k]
            Ab[i, k:] -= m * Ab[k, k:]

    # Back substitution
    x = np.zeros(n)
    for i in range(n - 1, -1, -1):
        x[i] = (Ab[i, -1] - Ab[i, i+1:n] @ x[i+1:]) / Ab[i, i]
    return x`,
    r: `gauss_elimination <- function(A, b) {
  n <- length(b)
  Ab <- cbind(A, b)

  # Forward elimination
  for (k in 1:(n - 1)) {
    for (i in (k + 1):n) {
      m <- Ab[i, k] / Ab[k, k]
      Ab[i, ] <- Ab[i, ] - m * Ab[k, ]
    }
  }

  # Back substitution
  x <- numeric(n)
  for (i in n:1) {
    x[i] <- (Ab[i, n + 1] - sum(Ab[i, (i+1):n] * x[(i+1):n])) / Ab[i, i]
  }
  return(x)
}`
  }} />
</div>
