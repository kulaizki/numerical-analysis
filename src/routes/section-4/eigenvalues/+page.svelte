<script lang="ts">
  import { PowerMethod, InversePowerMethod, QRAlgorithm, CompareTab } from '$lib/features/eigenvalues';

  type Tab = 'power' | 'inverse' | 'qr' | 'compare';
  let activeTab = $state<Tab>('power');
</script>

<svelte:head>
  <title>Eigenvalues | numerilab</title>
</svelte:head>

<h1 class="text-2xl font-bold text-primary mb-2">Eigenvalues and Eigenvectors</h1>
<p class="text-muted mb-8">
  Numerical methods for computing eigenvalues and eigenvectors of matrices.
</p>

<!-- TABS -->
<div class="flex gap-2 mb-8 border-b border-border">
  <button
    class="px-4 py-2 font-semibold transition-colors border-b-2 {activeTab === 'power' ? 'text-primary border-primary' : 'text-muted border-transparent hover:text-primary'}"
    onclick={() => activeTab = 'power'}
  >
    Power Method
  </button>
  <button
    class="px-4 py-2 font-semibold transition-colors border-b-2 {activeTab === 'inverse' ? 'text-primary border-primary' : 'text-muted border-transparent hover:text-primary'}"
    onclick={() => activeTab = 'inverse'}
  >
    Inverse Power
  </button>
  <button
    class="px-4 py-2 font-semibold transition-colors border-b-2 {activeTab === 'qr' ? 'text-primary border-primary' : 'text-muted border-transparent hover:text-primary'}"
    onclick={() => activeTab = 'qr'}
  >
    QR Algorithm
  </button>
  <button
    class="px-4 py-2 font-semibold transition-colors border-b-2 {activeTab === 'compare' ? 'text-primary border-primary' : 'text-muted border-transparent hover:text-primary'}"
    onclick={() => activeTab = 'compare'}
  >
    Compare
  </button>
</div>

{#if activeTab === 'power'}
  <PowerMethod />
{:else if activeTab === 'inverse'}
  <InversePowerMethod />
{:else if activeTab === 'qr'}
  <QRAlgorithm />
{:else if activeTab === 'compare'}
  <CompareTab />
{/if}
