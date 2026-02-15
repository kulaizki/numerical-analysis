<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  let {
    variant = 'primary',
    size = 'md',
    children,
    class: className = '',
    ...rest
  }: HTMLButtonAttributes & {
    variant?: 'primary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children?: Snippet;
    class?: string;
  } = $props();

  const base = 'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer border';

  const variants: Record<string, string> = {
    primary: 'bg-accent text-bg border-accent hover:bg-accent-hover hover:border-accent-hover',
    outline: 'bg-transparent text-accent border-border-strong hover:border-accent',
    ghost: 'bg-transparent text-muted border-transparent hover:text-accent hover:bg-bg-3'
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
</script>

<button class="{base} {variants[variant]} {sizes[size]} {className}" {...rest}>
  {#if children}{@render children()}{/if}
</button>
