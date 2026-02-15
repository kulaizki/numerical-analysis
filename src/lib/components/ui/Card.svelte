<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    hover = true,
    children,
    class: className = ''
  }: {
    hover?: boolean;
    children?: Snippet;
    class?: string;
  } = $props();
</script>

<div
  class="bg-bg-2 border border-border p-6 transition-all duration-150
    {hover ? 'hover:shadow-[0_0_16px_rgba(129,140,248,0.1)]' : ''}
    {className}"
>
  {#if children}{@render children()}{/if}
</div>
