<script lang="ts">
  import {
    IVTVisualizer,
    EVTVisualizer,
    MVTVisualizer,
    TaylorVisualizer,
    MVTIntegralsVisualizer,
    EpsilonDelta
  } from '$lib/features/math-preliminaries';
</script>

<svelte:head>
  <title>Math Preliminaries | numerilab</title>
</svelte:head>

<div class="space-y-8">
  <div>
    <h1 class="text-2xl font-bold text-primary mb-2">Math Preliminaries</h1>
    <p class="text-muted">
      Essential theorems from calculus that underpin numerical analysis methods.
    </p>
  </div>

  <IVTVisualizer />
  <EVTVisualizer />
  <MVTVisualizer />
  <TaylorVisualizer />
  <MVTIntegralsVisualizer />
  <EpsilonDelta />
</div>
