<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import {
    BisectionSolver,
    FixedPointSolver,
    NewtonSolver,
    SecantSolver,
    MethodComparison
  } from '$lib/features/nonlinear-equations';

  let activeTab = $state<'bisection' | 'fixed-point' | 'newton' | 'secant' | 'compare'>('bisection');

  const tabs = [
    { id: 'bisection' as const, label: 'Bisection' },
    { id: 'fixed-point' as const, label: 'Fixed-Point' },
    { id: 'newton' as const, label: 'Newton' },
    { id: 'secant' as const, label: 'Secant' },
    { id: 'compare' as const, label: 'Compare' },
  ];
</script>

<svelte:head>
  <title>Nonlinear Equations | Numerical Analysis</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-primary mb-2">Nonlinear Equations</h1>
    <p class="text-muted">
      Methods for finding roots of equations f(x) = 0. Default function: <KaTeX math="f(x) = x^3 - x - 2" />
    </p>
  </div>

  <!-- Tabs -->
  <div class="border-b border-border">
    <div class="flex gap-6">
      {#each tabs as tab}
        <button
          class="px-4 py-2 font-medium transition-colors {activeTab === tab.id ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
          onclick={() => activeTab = tab.id}
        >
          {tab.label}
        </button>
      {/each}
    </div>
  </div>

  {#if activeTab === 'bisection'}
    <BisectionSolver />
  {:else if activeTab === 'fixed-point'}
    <FixedPointSolver />
  {:else if activeTab === 'newton'}
    <NewtonSolver />
  {:else if activeTab === 'secant'}
    <SecantSolver />
  {:else if activeTab === 'compare'}
    <MethodComparison />
  {/if}
</div>
