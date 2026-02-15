<script lang="ts">
  import katex from 'katex';
  import 'katex/dist/katex.min.css';

  let { math = '', displayMode = false }: { math: string; displayMode?: boolean } = $props();

  let html = $derived(
    katex.renderToString(math, {
      displayMode,
      throwOnError: false
    })
  );
</script>

<span class={displayMode ? 'block my-4 text-center' : 'inline'}>
  {@html html}
</span>
