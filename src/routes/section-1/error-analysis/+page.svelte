<script lang="ts">
  import {
    IEEE754Converter,
    ErrorCalculator,
    ErrorPractice,
    ConvergenceChart,
    SequenceAnalyzer,
    ConditionNumber,
    SeriesAnalyzer,
    FloatingPointProof,
    LossOfSignificance,
    PropagatedError
  } from '$lib/features/error-analysis';
</script>

<svelte:head>
  <title>Error Analysis | Numerical Analysis</title>
</svelte:head>

<h1 class="text-2xl font-bold text-primary mb-2">Error Analysis</h1>
<p class="text-muted mb-8">
  Understanding numerical errors, floating-point representation, and convergence analysis.
</p>

<IEEE754Converter />

<section class="mb-12 border-b border-border pb-12">
  <h2 class="text-xl font-bold text-primary mb-4">2. Error Types</h2>
  <ErrorCalculator />
  <ErrorPractice />
</section>

<section class="mb-12 border-b border-border pb-12">
  <h2 class="text-xl font-bold text-primary mb-4">3. Convergence Rates</h2>
  <ConvergenceChart />
  <SequenceAnalyzer />
</section>

<section class="mb-12 border-b border-border pb-12">
  <h2 class="text-xl font-bold text-primary mb-4">4. Condition Numbers</h2>
  <ConditionNumber />
</section>

<section class="mb-12 border-b border-border pb-12">
  <h2 class="text-xl font-bold text-primary mb-4">5. Series Convergence</h2>
  <SeriesAnalyzer />
</section>

<section class="mb-12 border-b border-border pb-12">
  <h2 class="text-xl font-bold text-primary mb-4">6. Floating-Point Arithmetic</h2>
  <FloatingPointProof />
</section>

<section class="mb-12 border-b border-border pb-12">
  <h2 class="text-xl font-bold text-primary mb-4">7. Loss of Significance</h2>
  <LossOfSignificance />
</section>

<section class="mb-12">
  <h2 class="text-xl font-bold text-primary mb-4">8. Propagated Error & Stability</h2>
  <PropagatedError />
</section>
