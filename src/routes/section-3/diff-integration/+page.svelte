<script lang="ts">
  import {
    DifferentiationTool,
    TrapezoidalRule,
    SimpsonsRule,
    ComparisonView
  } from '$lib/features/diff-integration';

  let activeTab = $state<'differentiation' | 'trapezoidal' | 'simpson' | 'compare'>('differentiation');
</script>

<svelte:head>
  <title>Differentiation & Integration | Numerical Analysis</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-primary mb-2">Numerical Differentiation & Integration</h1>
    <p class="text-muted">
      Approximate derivatives using difference quotients and integrals using trapezoidal and Simpson's rules.
    </p>
  </div>

  <!-- Tabs -->
  <div class="border-b border-border">
    <div class="flex gap-6 overflow-x-auto">
      <button
        class="px-4 py-2 font-medium transition-colors {activeTab === 'differentiation' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
        onclick={() => (activeTab = 'differentiation')}
      >
        Differentiation
      </button>
      <button
        class="px-4 py-2 font-medium transition-colors {activeTab === 'trapezoidal' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
        onclick={() => (activeTab = 'trapezoidal')}
      >
        Trapezoidal
      </button>
      <button
        class="px-4 py-2 font-medium transition-colors {activeTab === 'simpson' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
        onclick={() => (activeTab = 'simpson')}
      >
        Simpson's
      </button>
      <button
        class="px-4 py-2 font-medium transition-colors {activeTab === 'compare' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
        onclick={() => (activeTab = 'compare')}
      >
        Compare
      </button>
    </div>
  </div>

  {#if activeTab === 'differentiation'}
    <DifferentiationTool />
  {:else if activeTab === 'trapezoidal'}
    <TrapezoidalRule />
  {:else if activeTab === 'simpson'}
    <SimpsonsRule />
  {:else if activeTab === 'compare'}
    <ComparisonView />
  {/if}
</div>
