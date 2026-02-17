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

<div class="space-y-8">
  <div>
    <h1 class="text-2xl font-bold text-primary mb-2">Error Analysis</h1>
    <p class="text-muted">
      Understanding numerical errors, floating-point representation, and convergence analysis.
    </p>
  </div>

  <IEEE754Converter />

  <section>
    <h2 class="text-xl font-semibold text-accent mb-4">2. Error Types</h2>
    <ErrorCalculator />
    <ErrorPractice />
  </section>

  <section>
    <h2 class="text-xl font-semibold text-accent mb-4">3. Convergence Rates</h2>
    <ConvergenceChart />
    <SequenceAnalyzer />
  </section>

  <ConditionNumber />
  <SeriesAnalyzer />
  <FloatingPointProof />
  <LossOfSignificance />
  <PropagatedError />
</div>
