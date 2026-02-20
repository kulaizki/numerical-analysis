<script lang="ts">
  import { Card } from '$lib/components/ui';
  import hljs from 'highlight.js/lib/core';
  import python from 'highlight.js/lib/languages/python';
  import r from 'highlight.js/lib/languages/r';

  hljs.registerLanguage('python', python);
  hljs.registerLanguage('r', r);

  let {
    codes
  }: {
    codes: { pseudocode: string; python: string; r: string };
  } = $props();

  let active = $state<'pseudocode' | 'python' | 'r'>('pseudocode');

  const tabs = [
    { key: 'pseudocode' as const, label: 'Pseudocode' },
    { key: 'python' as const, label: 'Python' },
    { key: 'r' as const, label: 'R' }
  ];

  function highlightPseudocode(code: string): string {
    let html = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Comments (// ...)
    html = html.replace(/(\/\/.*)/g, '<span class="hljs-comment">$1</span>');

    // Strings
    html = html.replace(/(".*?")/g, '<span class="hljs-string">$1</span>');

    // Keywords
    const keywords = ['INPUT', 'OUTPUT', 'RETURN', 'for', 'if', 'else', 'while', 'to', 'down to', 'do', 'end', 'then', 'Solve', 'Set up', 'with'];
    for (const kw of keywords) {
      html = html.replace(
        new RegExp(`\\b(${kw})\\b`, 'g'),
        '<span class="hljs-keyword">$1</span>'
      );
    }

    // Numbers
    html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="hljs-number">$1</span>');

    return html;
  }

  function getHighlighted(key: 'pseudocode' | 'python' | 'r'): string {
    const code = codes[key];
    if (key === 'pseudocode') {
      return highlightPseudocode(code);
    }
    const lang = key === 'r' ? 'r' : 'python';
    return hljs.highlight(code, { language: lang }).value;
  }
</script>

<Card>
  <h3 class="text-lg font-medium text-primary mb-3">Implementation</h3>
  <div class="flex gap-1 mb-3 border-b border-border">
    {#each tabs as tab}
      <button
        class="px-3 py-1.5 text-sm font-medium transition-colors -mb-px
          {active === tab.key
            ? 'text-accent border-b-2 border-accent'
            : 'text-muted hover:text-primary'}"
        onclick={() => active = tab.key}
      >
        {tab.label}
      </button>
    {/each}
  </div>
  <pre class="code-block bg-background/50 border border-border p-4 overflow-x-auto text-sm font-mono leading-relaxed"><code>{@html getHighlighted(active)}</code></pre>
</Card>

<style>
  .code-block {
    font-variant-ligatures: none;
  }

  .code-block :global(.hljs-keyword) {
    color: #c792ea;
  }

  .code-block :global(.hljs-built_in) {
    color: #82aaff;
  }

  .code-block :global(.hljs-string) {
    color: #c3e88d;
  }

  .code-block :global(.hljs-number) {
    color: #f78c6c;
  }

  .code-block :global(.hljs-comment) {
    color: #636d83;
    font-style: italic;
  }

  .code-block :global(.hljs-function) {
    color: #82aaff;
  }

  .code-block :global(.hljs-title),
  .code-block :global(.hljs-title.function_) {
    color: #82aaff;
  }

  .code-block :global(.hljs-params) {
    color: #d4d4d8;
  }

  .code-block :global(.hljs-literal) {
    color: #f78c6c;
  }

  .code-block :global(.hljs-operator) {
    color: #89ddff;
  }

  .code-block :global(.hljs-punctuation) {
    color: #89ddff;
  }

  .code-block :global(.hljs-meta) {
    color: #ffcb6b;
  }

  .code-block :global(.hljs-variable),
  .code-block :global(.hljs-attr) {
    color: #d4d4d8;
  }
</style>
