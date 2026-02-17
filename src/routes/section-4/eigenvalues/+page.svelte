<script lang="ts">
  import { PowerMethod, InversePowerMethod, QRAlgorithm, CompareTab } from '$lib/features/eigenvalues';

  type Tab = 'power' | 'inverse' | 'qr' | 'compare';
  let activeTab = $state<Tab>('power');
</script>

<svelte:head>
  <title>eigenvalues | numerical analysis</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-primary mb-2">Eigenvalues and Eigenvectors</h1>
    <p class="text-muted">
      Numerical methods for computing eigenvalues and eigenvectors of matrices.
    </p>
  </div>

  <!-- Tabs -->
  <div class="border-b border-border">
    <div class="flex gap-6 overflow-x-auto">
      <button
        class="px-4 py-2 font-medium transition-colors {activeTab === 'power' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
        onclick={() => activeTab = 'power'}
      >
        Power Method
      </button>
      <button
        class="px-4 py-2 font-medium transition-colors {activeTab === 'inverse' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
        onclick={() => activeTab = 'inverse'}
      >
        Inverse Power
      </button>
      <button
        class="px-4 py-2 font-medium transition-colors {activeTab === 'qr' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
        onclick={() => activeTab = 'qr'}
      >
        QR Algorithm
      </button>
      <button
        class="px-4 py-2 font-medium transition-colors {activeTab === 'compare' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
        onclick={() => activeTab = 'compare'}
      >
        Compare
      </button>
    </div>
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
</div>
