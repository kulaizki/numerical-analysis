<script lang="ts">
  import {
    GaussElimination,
    LUDecomposition,
    JacobiSolver,
    GaussSeidelSolver,
    CompareMethods,
    MatrixNorms,
    LinearSystemError
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
  <title>linear systems | numerical analysis</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-primary mb-2">Linear Systems</h1>
    <p class="text-muted">
      Direct and iterative methods for solving systems of linear equations Ax = b
    </p>
  </div>

  <div class="border-b border-border">
    <div class="flex gap-6 overflow-x-auto">
      {#each tabs as tab}
        <button
          class="px-4 py-2 font-medium transition-colors whitespace-nowrap {activeTab === tab.id ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
          onclick={() => activeTab = tab.id}
        >
          {tab.label}
        </button>
      {/each}
    </div>
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

  <section class="border-t border-border pt-8">
    <h2 class="text-xl font-bold text-primary mb-4">Matrix & Vector Norms</h2>
    <MatrixNorms />
  </section>

  <section class="border-t border-border pt-8">
    <h2 class="text-xl font-bold text-primary mb-4">Error in Linear Systems</h2>
    <LinearSystemError />
  </section>
</div>
