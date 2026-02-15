<script lang="ts">
  import { RootFindingComparison, IntegrationComparison, ODEComparison } from '$lib/features/compare';

  type Category = 'root-finding' | 'integration' | 'odes';
  let activeCategory = $state<Category>('root-finding');

  let rootFindingRef: RootFindingComparison | undefined = $state();
  let integrationRef: IntegrationComparison | undefined = $state();
  let odeRef: ODEComparison | undefined = $state();

  function copyResultsToClipboard() {
    let text = '';

    if (activeCategory === 'root-finding' && rootFindingRef) {
      text = rootFindingRef.copyResults();
    } else if (activeCategory === 'integration' && integrationRef) {
      text = integrationRef.copyResults();
    } else if (activeCategory === 'odes' && odeRef) {
      text = odeRef.copyResults();
    }

    if (text) {
      navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    }
  }
</script>

<svelte:head>
  <title>Compare Methods | numerilab</title>
</svelte:head>

<div class="container mx-auto px-4 py-12 max-w-7xl">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-4xl font-bold text-accent font-mono mb-2">Method Comparison Sandbox</h1>
    <p class="text-muted">Compare numerical methods side-by-side with interactive visualizations</p>
  </div>

  <!-- Category Tabs -->
  <div class="flex gap-2 mb-8 border-b border-border">
    <button
      onclick={() => activeCategory = 'root-finding'}
      class="px-4 py-2 text-sm font-medium transition-colors duration-150 border-b-2 {activeCategory === 'root-finding' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-primary'}"
    >
      Root Finding
    </button>
    <button
      onclick={() => activeCategory = 'integration'}
      class="px-4 py-2 text-sm font-medium transition-colors duration-150 border-b-2 {activeCategory === 'integration' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-primary'}"
    >
      Integration
    </button>
    <button
      onclick={() => activeCategory = 'odes'}
      class="px-4 py-2 text-sm font-medium transition-colors duration-150 border-b-2 {activeCategory === 'odes' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-primary'}"
    >
      ODEs
    </button>
  </div>

  <!-- Component Views -->
  {#if activeCategory === 'root-finding'}
    <RootFindingComparison bind:this={rootFindingRef} />
  {/if}

  {#if activeCategory === 'integration'}
    <IntegrationComparison bind:this={integrationRef} />
  {/if}

  {#if activeCategory === 'odes'}
    <ODEComparison bind:this={odeRef} />
  {/if}
</div>
