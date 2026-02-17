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
  <title>compare methods | numerical analysis</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-bold text-primary mb-2">Method Comparison Sandbox</h1>
    <p class="text-muted">Compare numerical methods side-by-side with interactive visualizations</p>
  </div>

  <!-- Category Tabs -->
  <div class="border-b border-border">
    <div class="flex gap-6 overflow-x-auto">
      <button
        onclick={() => activeCategory = 'root-finding'}
        class="px-4 py-2 font-medium transition-colors {activeCategory === 'root-finding' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
      >
        Root Finding
      </button>
      <button
        onclick={() => activeCategory = 'integration'}
        class="px-4 py-2 font-medium transition-colors {activeCategory === 'integration' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
      >
        Integration
      </button>
      <button
        onclick={() => activeCategory = 'odes'}
        class="px-4 py-2 font-medium transition-colors {activeCategory === 'odes' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
      >
        ODEs
      </button>
    </div>
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
