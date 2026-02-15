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
  <title>Differentiation & Integration | numerilab</title>
</svelte:head>

<h1 class="text-2xl font-bold text-primary mb-2">Numerical Differentiation & Integration</h1>
<p class="text-muted mb-6">
  Approximate derivatives using difference quotients and integrals using trapezoidal and Simpson's rules.
</p>

<!-- Tabs -->
<div class="flex gap-2 mb-6 border-b border-border">
  <button
    class="px-4 py-2 font-medium transition-all duration-150 border-b-2 {activeTab === 'differentiation' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-primary'}"
    onclick={() => (activeTab = 'differentiation')}
  >
    Differentiation
  </button>
  <button
    class="px-4 py-2 font-medium transition-all duration-150 border-b-2 {activeTab === 'trapezoidal' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-primary'}"
    onclick={() => (activeTab = 'trapezoidal')}
  >
    Trapezoidal
  </button>
  <button
    class="px-4 py-2 font-medium transition-all duration-150 border-b-2 {activeTab === 'simpson' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-primary'}"
    onclick={() => (activeTab = 'simpson')}
  >
    Simpson's
  </button>
  <button
    class="px-4 py-2 font-medium transition-all duration-150 border-b-2 {activeTab === 'compare' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-primary'}"
    onclick={() => (activeTab = 'compare')}
  >
    Compare
  </button>
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
