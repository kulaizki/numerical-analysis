<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  let {
    label = '',
    mono = false,
    value = $bindable(''),
    class: className = '',
    ...rest
  }: HTMLInputAttributes & {
    label?: string;
    mono?: boolean;
    value?: string;
    class?: string;
  } = $props();
</script>

{#if label}
  <label class="block text-sm text-muted mb-1.5">{label}
  <input
    class="w-full bg-bg text-primary border border-border-strong px-3 py-2 text-sm
      placeholder:text-tertiary focus:outline-none focus:border-accent
      transition-colors duration-150
      {mono ? 'font-mono' : ''}
      {className}"
    bind:value
    {...rest}
  />
  </label>
{:else}
  <input
    class="w-full bg-bg text-primary border border-border-strong px-3 py-2 text-sm
      placeholder:text-tertiary focus:outline-none focus:border-accent
      transition-colors duration-150
      {mono ? 'font-mono' : ''}
      {className}"
    bind:value
    {...rest}
  />
{/if}
