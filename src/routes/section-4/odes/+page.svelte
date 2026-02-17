<script lang="ts">
	import KaTeX from '$lib/components/KaTeX.svelte';
	import { Card, Badge, Button, Input } from '$lib/components/ui';
	import { EulerMethod, HeunMethod, RK4Method, CompareMethod } from '$lib/features/odes';
	import { computeEuler } from '$lib/features/odes';

	let activeTab = $state<'euler' | 'heun' | 'rk4' | 'compare'>('euler');

	// Shared parameters
	let h = $state(0.2);
	let t0 = $state(0);
	let tf = $state(2);
	let y0 = $state(1);

	let stepCount = $derived(computeEuler(h, t0, tf, y0).length);
</script>

<svelte:head>
	<title>ODEs | Numerical Analysis</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-primary mb-2">Ordinary Differential Equations (ODEs)</h1>
		<p class="text-muted">
			Numerical methods for solving initial value problems: Euler, Heun's, and Runge-Kutta
		</p>
	</div>

	<!-- IVP Setup -->
	<Card class="bg-2 p-6">
		<h2 class="mb-4 text-xl font-semibold text-primary">Initial Value Problem</h2>
		<div class="mb-4">
			<KaTeX
				math="y' = -2ty, \quad y(0) = 1, \quad t \in [0, 2]"
				displayMode={true}
			/>
			<p class="mt-2 text-sm text-muted">
				Exact solution: <KaTeX math={'y(t) = e^{-t^2}'} />
			</p>
		</div>
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-2">
				<label for="stepSize" class="text-sm text-muted">Step size (h):</label>
				<Input
					id="stepSize"
					type="number"
					bind:value={h}
					step="0.05"
					min="0.05"
					max="0.5"
					class="w-24 bg-3"
				/>
			</div>
			<Badge variant="secondary">{stepCount} steps</Badge>
		</div>
	</Card>

	<div class="border-b border-border">
		<div class="flex gap-6">
			<button
				class="px-4 py-2 font-medium transition-colors {activeTab === 'euler' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
				onclick={() => (activeTab = 'euler')}
			>
				Euler's Method
			</button>
			<button
				class="px-4 py-2 font-medium transition-colors {activeTab === 'heun' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
				onclick={() => (activeTab = 'heun')}
			>
				Heun's Method
			</button>
			<button
				class="px-4 py-2 font-medium transition-colors {activeTab === 'rk4' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
				onclick={() => (activeTab = 'rk4')}
			>
				RK4
			</button>
			<button
				class="px-4 py-2 font-medium transition-colors {activeTab === 'compare' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-primary'}"
				onclick={() => (activeTab = 'compare')}
			>
				Compare Methods
			</button>
		</div>
	</div>

	{#if activeTab === 'euler'}
		<EulerMethod {h} {t0} {tf} {y0} />
	{:else if activeTab === 'heun'}
		<HeunMethod {h} {t0} {tf} {y0} />
	{:else if activeTab === 'rk4'}
		<RK4Method {h} {t0} {tf} {y0} />
	{:else if activeTab === 'compare'}
		<CompareMethod {h} {t0} {tf} {y0} />
	{/if}
</div>
