<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Button, Input } from '$lib/components/ui';

  // Section visibility
  let show = $state(true);

  // Step-by-step walkthrough state
  let currentStep = $state(0);

  const steps = [
    {
      title: 'Step 1: Normalized Floating-Point Form',
      math: '\\pm 0.d_1 d_2 \\cdots d_k \\times \\beta^e, \\quad d_1 \\neq 0',
      explanation:
        'Any nonzero real number is written in normalized form with base β (typically 2 for binary), ' +
        'k significant digits d₁d₂…dₖ where d₁ ≠ 0, and exponent e. For IEEE 754 double precision: β = 2, k = 53 (1 implicit + 52 stored).'
    },
    {
      title: 'Step 2: Chopping — Truncate After k Digits',
      math: '\\text{fl}_{chop}(x) = 0.d_1 d_2 \\cdots d_k \\times \\beta^e',
      explanation:
        'Chopping simply discards all digits beyond position k without rounding. ' +
        'The relative error satisfies |fl(x) − x| / |x| < β^{1−k}. ' +
        'This is the simplest rounding mode but introduces a systematic bias.'
    },
    {
      title: 'Step 3: Rounding — Round the k-th Digit',
      math: '\\text{fl}_{round}(x) = \\text{round}\\!\\left(0.d_1 d_2 \\cdots d_k \\times \\beta^e\\right)',
      explanation:
        'Rounding examines digit d_{k+1}. If d_{k+1} ≥ β/2, increment dₖ by 1 (carry if needed); ' +
        'otherwise truncate. The relative error bound is halved: |fl(x) − x| / |x| ≤ ½ β^{1−k}. ' +
        'IEEE 754 default mode is round-to-nearest-even (ties go to even last bit).'
    },
    {
      title: 'Step 4: Relative Error Bound (Unit Roundoff)',
      math: '\\left|\\frac{\\text{fl}(x) - x}{x}\\right| \\leq u, \\quad u = \\tfrac{1}{2}\\beta^{1-k}',
      explanation:
        'The unit roundoff u (also called machine epsilon ε_mach) is the worst-case relative error ' +
        'from a single rounding operation. For IEEE 754 double: β = 2, k = 53, so u = 2^{−53} ≈ 1.11 × 10^{−16}. ' +
        'Equivalently, fl(x) = x(1 + δ) where |δ| ≤ u.'
    },
    {
      title: 'Step 5: Error Propagation for Addition / Subtraction',
      math: '\\text{fl}(x \\oplus y) = (x + y)(1 + \\varepsilon_1), \\quad |\\varepsilon_1| \\leq u',
      explanation:
        'After computing x + y exactly (conceptually), the result is rounded once, ' +
        'incurring a relative error ≤ u. The absolute error propagation is: ' +
        '|Δ(x+y)| ≤ |Δx| + |Δy|. For relative errors ρₓ, ρ_y: ' +
        'the output relative error ≤ (|x|ρₓ + |y|ρ_y) / |x+y| + u. ' +
        'This blows up when x ≈ −y (near-cancellation).'
    },
    {
      title: 'Step 6: Catastrophic Cancellation',
      math: '\\frac{|x|\\,\\rho_x + |y|\\,\\rho_y}{|x + y|} \\gg \\rho_x,\\, \\rho_y \\quad \\text{when } x \\approx -y',
      explanation:
        'When two nearly equal numbers are subtracted, leading significant digits cancel, ' +
        'amplifying the relative error drastically. Example: (1 + ε) − 1 should equal ε, ' +
        'but for ε ≤ u the computed result is 0 — a 100% relative error. ' +
        'Mitigation strategies include algebraic reformulation, extended precision, or ' +
        'using compensated summation (Kahan algorithm).'
    }
  ];

  const totalSteps = steps.length;

  function prevStep() {
    if (currentStep > 0) currentStep--;
  }

  function nextStep() {
    if (currentStep < totalSteps - 1) currentStep++;
  }

  // ---- Catastrophic Cancellation Demo ----
  const epsilonValues = [1e-13, 1e-14, 1e-15, 1e-16, 1e-17];

  type CancellationRow = {
    epsilon: number;
    exact: number;
    computed: number;
    relError: number | null;
  };

  const cancellationRows: CancellationRow[] = $derived(
    epsilonValues.map((eps) => {
      const computed = 1 + eps - 1;
      const exact = eps;
      const relError = exact !== 0 ? Math.abs(computed - exact) / Math.abs(exact) : null;
      return { epsilon: eps, exact, computed, relError };
    })
  );

  function formatSci(n: number): string {
    if (n === 0) return '0';
    return n.toExponential(4);
  }

  function relErrDisplay(row: CancellationRow): string {
    if (row.relError === null) return 'N/A';
    if (row.relError === 0) return '0';
    return row.relError.toExponential(2);
  }

  function relErrClass(row: CancellationRow): string {
    if (row.relError === null || row.relError === 0) return 'text-primary';
    if (row.relError > 0.5) return 'text-red-400';
    if (row.relError > 0.01) return 'text-yellow-400';
    return 'text-green-400';
  }

  // ---- Error Propagation Calculator ----
  type Operation = '+' | '-' | '*' | '/';

  let calcOp = $state<Operation>('+');
  let calcX = $state('1.5');
  let calcY = $state('2.3');
  let calcRhoX = $state('1e-10');
  let calcRhoY = $state('1e-10');

  type PropagationResult = {
    result: number;
    relErrorBound: number;
    formula: string;
    formulaLabel: string;
  };

  const propagationResult: PropagationResult | null = $derived.by(() => {
    const x = parseFloat(calcX);
    const y = parseFloat(calcY);
    const rhox = parseFloat(calcRhoX);
    const rhoy = parseFloat(calcRhoY);
    if ([x, y, rhox, rhoy].some(isNaN) || rhox < 0 || rhoy < 0) return null;

    let result: number;
    let relErrorBound: number;
    let formula: string;
    let formulaLabel: string;

    const u = Math.pow(2, -53);

    if (calcOp === '+' || calcOp === '-') {
      result = calcOp === '+' ? x + y : x - y;
      const absErrBound = Math.abs(x) * rhox + Math.abs(y) * rhoy;
      relErrorBound = result !== 0 ? absErrBound / Math.abs(result) + u : Infinity;
      formula =
        calcOp === '+'
          ? '\\rho_{x+y} \\leq \\dfrac{|x|\\,\\rho_x + |y|\\,\\rho_y}{|x+y|} + u'
          : '\\rho_{x-y} \\leq \\dfrac{|x|\\,\\rho_x + |y|\\,\\rho_y}{|x-y|} + u';
      formulaLabel = calcOp === '+' ? 'Addition error bound' : 'Subtraction error bound';
    } else if (calcOp === '*') {
      result = x * y;
      relErrorBound = rhox + rhoy + u;
      formula = '\\rho_{x \\cdot y} \\leq \\rho_x + \\rho_y + u';
      formulaLabel = 'Multiplication error bound';
    } else {
      if (y === 0) return null;
      result = x / y;
      relErrorBound = rhox + rhoy + u;
      formula = '\\rho_{x/y} \\leq \\rho_x + \\rho_y + u';
      formulaLabel = 'Division error bound';
    }

    return { result, relErrorBound, formula, formulaLabel };
  });
</script>

<section id="fp-proof" class="space-y-4">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold text-accent">6. Floating-Point Arithmetic Proof</h2>
    <Button variant="ghost" size="sm" onclick={() => (show = !show)}>
      {show ? 'Hide' : 'Show'}
    </Button>
  </div>

  {#if show}
    <Card class="space-y-8">

      <!-- ======== THEORY SECTION ======== -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-primary">Theory</h3>

        <div class="bg-bg-3 border border-border p-4 space-y-4">
          <div>
            <p class="text-sm text-muted mb-1">Floating-point representation model</p>
            <KaTeX math={'\\text{fl}(x) = x(1 + \\delta), \\quad |\\delta| \\leq u'} displayMode={true} />
          </div>

          <div>
            <p class="text-sm text-muted mb-1">Unit roundoff for IEEE 754 double precision</p>
            <KaTeX math={'u = 2^{-53} \\approx 1.11 \\times 10^{-16}'} displayMode={true} />
          </div>

          <div>
            <p class="text-sm text-muted mb-1">Arithmetic operations (each rounded once)</p>
            <KaTeX
              math={'\\text{fl}(x \\oplus y) = (x + y)(1 + \\varepsilon_1), \\quad |\\varepsilon_1| \\leq u'}
              displayMode={true}
            />
            <KaTeX
              math={'\\text{fl}(x \\otimes y) = (x \\cdot y)(1 + \\varepsilon_2), \\quad |\\varepsilon_2| \\leq u'}
              displayMode={true}
            />
          </div>

          <div>
            <p class="text-sm text-muted mb-1">Error accumulation after n operations</p>
            <KaTeX
              math={'\\left|\\frac{\\hat{f} - f}{f}\\right| \\lesssim n \\cdot u \\quad (\\text{first-order bound})'}
              displayMode={true}
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="bg-bg-3 border border-border p-3 space-y-1">
            <p class="text-muted font-medium">Chopping (truncation)</p>
            <p class="text-xs text-muted">Relative error bound: <KaTeX math={'\\beta^{1-k}'} /></p>
          </div>
          <div class="bg-bg-3 border border-border p-3 space-y-1">
            <p class="text-muted font-medium">Rounding (nearest)</p>
            <p class="text-xs text-muted">Relative error bound: <KaTeX math={'\\tfrac{1}{2}\\beta^{1-k}'} /></p>
          </div>
        </div>
      </div>

      <!-- ======== STEP-BY-STEP PROOF WALKTHROUGH ======== -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-primary">Step-by-Step Proof Walkthrough</h3>

        <!-- Step progress indicators -->
        <div class="flex gap-2">
          {#each steps as _, i}
            <button
              class="w-6 h-6 text-xs font-bold flex items-center justify-center transition-all duration-150
                {i === currentStep
                  ? 'bg-accent text-bg'
                  : i < currentStep
                    ? 'bg-bg-3 border border-accent text-accent'
                    : 'bg-bg-3 border border-border text-muted'}"
              onclick={() => (currentStep = i)}
              aria-label="Go to step {i + 1}"
            >
              {i + 1}
            </button>
          {/each}
        </div>

        <!-- Active step card -->
        <div class="bg-bg-3 border border-accent p-4 space-y-3">
          <div class="flex items-center gap-3">
            <span
              class="bg-accent text-bg text-xs font-bold w-6 h-6 flex items-center justify-center flex-shrink-0"
            >
              {currentStep + 1}
            </span>
            <h4 class="text-sm font-semibold text-primary">{steps[currentStep].title}</h4>
          </div>

          <KaTeX math={steps[currentStep].math} displayMode={true} />

          <p class="text-sm text-muted leading-relaxed">{steps[currentStep].explanation}</p>
        </div>

        <!-- Navigation buttons -->
        <div class="flex items-center justify-between">
          <Button variant="outline" size="sm" onclick={prevStep} disabled={currentStep === 0}>
            Previous
          </Button>
          <span class="text-xs text-muted">
            {currentStep + 1} / {totalSteps}
          </span>
          {#if currentStep < totalSteps - 1}
            <Button variant="primary" size="sm" onclick={nextStep}>
              Next Step
            </Button>
          {:else}
            <Button variant="outline" size="sm" disabled>
              Complete
            </Button>
          {/if}
        </div>

        <!-- All steps collapsed list (peek) -->
        <div class="space-y-1">
          {#each steps as step, i}
            {#if i !== currentStep}
              <button
                class="w-full text-left bg-bg-3 border border-border p-3 flex items-center gap-3
                  hover:border-accent transition-colors duration-150"
                onclick={() => (currentStep = i)}
              >
                <span
                  class="text-xs font-bold w-6 h-6 flex items-center justify-center flex-shrink-0
                    {i < currentStep ? 'bg-accent text-bg' : 'bg-bg border border-border text-muted'}"
                >
                  {i + 1}
                </span>
                <span class="text-xs text-muted">{step.title}</span>
              </button>
            {/if}
          {/each}
        </div>
      </div>

      <!-- ======== CATASTROPHIC CANCELLATION DEMO ======== -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-primary">Interactive: Catastrophic Cancellation</h3>
        <p class="text-sm text-muted">
          Computing <KaTeX math={'(1 + \\varepsilon) - 1'} /> should yield <KaTeX math={'\\varepsilon'} />.
          Watch the relative error grow as ε approaches the machine epsilon.
        </p>

        <div class="overflow-x-auto">
          <table class="w-full text-sm font-mono border-collapse">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left text-muted py-2 pr-4 font-medium">ε value</th>
                <th class="text-left text-muted py-2 pr-4 font-medium">Exact result</th>
                <th class="text-left text-muted py-2 pr-4 font-medium">Computed result</th>
                <th class="text-left text-muted py-2 font-medium">Relative error</th>
              </tr>
            </thead>
            <tbody>
              {#each cancellationRows as row}
                <tr class="border-b border-border">
                  <td class="text-primary py-2 pr-4">{formatSci(row.epsilon)}</td>
                  <td class="text-primary py-2 pr-4">{formatSci(row.exact)}</td>
                  <td class="text-primary py-2 pr-4">{formatSci(row.computed)}</td>
                  <td class="py-2 {relErrClass(row)}">{relErrDisplay(row)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <div class="bg-bg-3 border border-border p-3 text-xs text-muted space-y-1">
          <p>
            For ε = 10⁻¹⁶ ≈ u, JavaScript (IEEE 754) computes (1 + ε) = 1 exactly due to rounding,
            so (1 + ε) − 1 = 0. The relative error is 100%.
          </p>
          <p>
            For ε = 10⁻¹⁷ (below machine epsilon), the situation is the same — ε is rounded to 0 when added to 1.
          </p>
        </div>
      </div>

      <!-- ======== ERROR PROPAGATION CALCULATOR ======== -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-primary">Error Propagation Calculator</h3>
        <p class="text-sm text-muted">
          Given two values and their relative errors, compute the propagated relative error bound.
        </p>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-muted mb-1.5">
              x
              <input
                type="text"
                bind:value={calcX}
                class="w-full bg-bg text-primary border border-border-strong px-3 py-2 text-sm
                  font-mono placeholder:text-tertiary focus:outline-none focus:border-accent
                  transition-colors duration-150"
                placeholder="1.5"
              />
            </label>
          </div>
          <div>
            <label class="block text-sm text-muted mb-1.5">
              y
              <input
                type="text"
                bind:value={calcY}
                class="w-full bg-bg text-primary border border-border-strong px-3 py-2 text-sm
                  font-mono placeholder:text-tertiary focus:outline-none focus:border-accent
                  transition-colors duration-150"
                placeholder="2.3"
              />
            </label>
          </div>
          <div>
            <label class="block text-sm text-muted mb-1.5">
              Relative error of x (ρₓ)
              <input
                type="text"
                bind:value={calcRhoX}
                class="w-full bg-bg text-primary border border-border-strong px-3 py-2 text-sm
                  font-mono placeholder:text-tertiary focus:outline-none focus:border-accent
                  transition-colors duration-150"
                placeholder="1e-10"
              />
            </label>
          </div>
          <div>
            <label class="block text-sm text-muted mb-1.5">
              Relative error of y (ρ_y)
              <input
                type="text"
                bind:value={calcRhoY}
                class="w-full bg-bg text-primary border border-border-strong px-3 py-2 text-sm
                  font-mono placeholder:text-tertiary focus:outline-none focus:border-accent
                  transition-colors duration-150"
                placeholder="1e-10"
              />
            </label>
          </div>
        </div>

        <!-- Operation selector -->
        <div class="flex gap-2">
          {#each (['+', '-', '*', '/'] as const) as op}
            <button
              class="px-4 py-2 text-sm font-mono border transition-all duration-150
                {calcOp === op
                  ? 'bg-accent text-bg border-accent'
                  : 'bg-transparent text-muted border-border hover:border-accent hover:text-accent'}"
              onclick={() => (calcOp = op)}
            >
              {op}
            </button>
          {/each}
        </div>

        {#if propagationResult}
          <div class="bg-bg-3 border border-border p-4 space-y-3">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-muted mb-1">Result ({calcX} {calcOp} {calcY})</p>
                <p class="font-mono text-primary">{propagationResult.result.toPrecision(10)}</p>
              </div>
              <div>
                <p class="text-muted mb-1">Propagated rel. error bound</p>
                <p
                  class="font-mono {propagationResult.relErrorBound > 0.01
                    ? 'text-red-400'
                    : propagationResult.relErrorBound > 1e-8
                      ? 'text-yellow-400'
                      : 'text-green-400'}"
                >
                  {isFinite(propagationResult.relErrorBound)
                    ? propagationResult.relErrorBound.toExponential(4)
                    : '∞ (division by zero result)'}
                </p>
              </div>
            </div>

            <div>
              <p class="text-xs text-muted mb-2">{propagationResult.formulaLabel}</p>
              <KaTeX math={propagationResult.formula} displayMode={true} />
            </div>
          </div>
        {:else}
          <div class="bg-bg-3 border border-border p-4 text-sm text-muted text-center">
            Enter valid numeric values to see the propagated error bound.
          </div>
        {/if}
      </div>

    </Card>
  {/if}
</section>

<style>
  :global(.katex-display) {
    margin: 0.5rem 0;
  }
</style>
