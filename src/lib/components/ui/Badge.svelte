<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    color = '#818cf8',
    children,
    class: className = ''
  }: {
    color?: string;
    children?: Snippet;
    class?: string;
  } = $props();
</script>

<span
  class="inline-flex items-center px-2 py-0.5 text-xs font-medium {className}"
  style="background: {color}18; color: {color}; border: 1px solid {color}40;"
>
  {#if children}{@render children()}{/if}
</span>
