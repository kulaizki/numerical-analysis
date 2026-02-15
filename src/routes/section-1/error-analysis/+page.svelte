<script lang="ts">
  import {
    IEEE754Converter,
    ErrorCalculator,
    ErrorPractice,
    ConvergenceChart,
    SequenceAnalyzer
  } from '$lib/features/error-analysis';
</script>

<svelte:head>
  <title>Error Analysis | numerilab</title>
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

<section class="mb-12">
  <h2 class="text-xl font-bold text-primary mb-4">3. Convergence Rates</h2>
  <ConvergenceChart />
  <SequenceAnalyzer />
</section>
