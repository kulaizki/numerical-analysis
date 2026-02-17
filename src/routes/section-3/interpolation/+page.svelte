<script lang="ts">
  import {
    LagrangeInterpolation,
    NewtonDividedDiff,
    CubicSplines,
    CompareInterpolation
  } from '$lib/features/interpolation';

  let activeTab = $state<'lagrange' | 'newton' | 'cubic-splines' | 'compare'>('lagrange');
</script>

<svelte:head>
  <title>Interpolation | Numerical Analysis</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-primary mb-2">Interpolation</h1>
    <p class="text-muted">
      Methods for constructing functions that pass through given data points.
    </p>
  </div>

  <!-- Tabs -->
  <div class="border-b border-border">
    <div class="flex gap-6">
      <button
        class="px-4 py-2 font-medium transition-colors {activeTab === 'lagrange' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
        onclick={() => activeTab = 'lagrange'}
      >
        Lagrange
      </button>
      <button
        class="px-4 py-2 font-medium transition-colors {activeTab === 'newton' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
        onclick={() => activeTab = 'newton'}
      >
        Newton Divided Diff
      </button>
      <button
        class="px-4 py-2 font-medium transition-colors {activeTab === 'cubic-splines' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
        onclick={() => activeTab = 'cubic-splines'}
      >
        Cubic Splines
      </button>
      <button
        class="px-4 py-2 font-medium transition-colors {activeTab === 'compare' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
        onclick={() => activeTab = 'compare'}
      >
        Compare
      </button>
    </div>
  </div>

  {#if activeTab === 'lagrange'}
    <LagrangeInterpolation />
  {:else if activeTab === 'newton'}
    <NewtonDividedDiff />
  {:else if activeTab === 'cubic-splines'}
    <CubicSplines />
  {:else if activeTab === 'compare'}
    <CompareInterpolation />
  {/if}
</div>
