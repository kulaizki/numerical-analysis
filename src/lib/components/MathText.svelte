<script lang="ts">
  import katex from 'katex';
  import 'katex/dist/katex.min.css';

  let { text = '' }: { text: string } = $props();

  let html = $derived(() => {
    const parts = text.split(/(\$[^$]+\$)/g);
    return parts
      .map((part) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          return katex.renderToString(math, { throwOnError: false });
        }
        return part
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      })
      .join('');
  });
</script>

<span>{@html html()}</span>
