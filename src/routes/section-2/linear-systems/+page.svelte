<script lang="ts">
  import {
    GaussElimination,
    LUDecomposition,
    JacobiSolver,
    GaussSeidelSolver,
    CompareMethods
  } from '$lib/features/linear-systems';

  let activeTab = $state<'gauss' | 'lu' | 'jacobi' | 'seidel' | 'compare'>('gauss');

  const tabs = [
    { id: 'gauss' as const, label: 'Gauss Elimination' },
    { id: 'lu' as const, label: 'LU Decomposition' },
    { id: 'jacobi' as const, label: 'Gauss-Jacobi' },
    { id: 'seidel' as const, label: 'Gauss-Seidel' },
    { id: 'compare' as const, label: 'Compare' }
  ];
</script>

<svelte:head>
  <title>Linear Systems | numerilab</title>
</svelte:head>

<div class="min-h-screen bg-bg p-8">
  <div class="max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-primary mb-2">Linear Systems</h1>
      <p class="text-muted text-lg">
        Direct and iterative methods for solving systems of linear equations Ax = b
      </p>
    </div>

    <div class="flex gap-2 mb-6 border-b border-border pb-2">
      {#each tabs as tab}
        <button
          class="px-4 py-2 font-medium transition-colors {activeTab === tab.id ? 'text-primary border-b-2 border-accent' : 'text-muted hover:text-tertiary'}"
          onclick={() => activeTab = tab.id}
        >
          {tab.label}
        </button>
      {/each}
    </div>

    {#if activeTab === 'gauss'}
      <GaussElimination />
    {:else if activeTab === 'lu'}
      <LUDecomposition />
    {:else if activeTab === 'jacobi'}
      <JacobiSolver />
    {:else if activeTab === 'seidel'}
      <GaussSeidelSolver />
    {:else if activeTab === 'compare'}
      <CompareMethods />
    {/if}
  </div>
</div>
