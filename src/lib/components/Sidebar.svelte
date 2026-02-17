<script lang="ts">
  import { page } from '$app/stores';

  let sidebarOpen = $state(false);

  const sections = [
    {
      title: 'Foundations',
      color: '#64748b',
      items: [
        { label: 'Math Preliminaries', href: '/section-1/math-preliminaries' },
        { label: 'Error Analysis', href: '/section-1/error-analysis' }
      ]
    },
    {
      title: 'Equations & Systems',
      color: '#22c55e',
      items: [
        { label: 'Nonlinear Equations', href: '/section-2/nonlinear-equations' },
        { label: 'Linear Systems', href: '/section-2/linear-systems' }
      ]
    },
    {
      title: 'Interpolation & Calculus',
      color: '#818cf8',
      items: [
        { label: 'Interpolation', href: '/section-3/interpolation' },
        { label: 'Differentiation & Integration', href: '/section-3/diff-integration' }
      ]
    },
    {
      title: 'ODEs & Eigenvalues',
      color: '#f59e0b',
      items: [
        { label: 'ODEs', href: '/section-4/odes' },
        { label: 'Eigenvalues', href: '/section-4/eigenvalues' }
      ]
    }
  ];

  let expandedSections = $state<Record<number, boolean>>({ 0: true, 1: true, 2: true, 3: true });

  function toggleSection(index: number) {
    expandedSections[index] = !expandedSections[index];
  }

  function closeSidebar() {
    sidebarOpen = false;
  }

  function isActive(href: string): boolean {
    return $page.url.pathname.startsWith(href);
  }
</script>

<!-- Mobile top bar -->
<div class="fixed top-0 left-0 right-0 h-12 bg-bg-2 border-b border-border flex items-center px-4 z-40 md:hidden">
  <button onclick={() => sidebarOpen = !sidebarOpen} class="text-muted hover:text-accent transition-colors">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {#if sidebarOpen}
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      {:else}
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      {/if}
    </svg>
  </button>
  <a href="/" class="ml-3 font-mono font-bold text-accent text-sm">Numerical Analysis</a>
</div>

<!-- Backdrop -->
{#if sidebarOpen}
  <button
    class="fixed inset-0 bg-black/60 z-40 md:hidden"
    onclick={closeSidebar}
    aria-label="Close sidebar"
  ></button>
{/if}

<!-- Sidebar -->
<aside
  class="fixed top-0 left-0 bottom-0 w-60 bg-bg-2 border-r border-border z-50
    flex flex-col overflow-y-auto transition-transform duration-200
    {sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0"
>
  <!-- Brand -->
  <div class="p-5 border-b border-border">
    <a href="/" class="font-bold text-accent text-lg hover:text-accent-hover transition-colors">
      Numerical Analysis
    </a>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 py-3">
    {#each sections as section, i}
      <div class="mb-1">
        <button
          onclick={() => toggleSection(i)}
          class="w-full flex items-center gap-2 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-tertiary hover:text-muted transition-colors"
        >
          <span class="w-2 h-2 shrink-0" style="background: {section.color};"></span>
          <span class="flex-1 text-left">{section.title}</span>
          <svg
            class="w-3 h-3 transition-transform duration-150 {expandedSections[i] ? 'rotate-90' : ''}"
            fill="currentColor" viewBox="0 0 20 20"
          >
            <path d="M6 4l8 6-8 6V4z" />
          </svg>
        </button>

        {#if expandedSections[i]}
          <div class="ml-7 border-l border-border">
            {#each section.items as item}
              <a
                href={item.href}
                onclick={closeSidebar}
                class="block px-4 py-1.5 text-sm transition-colors
                  {isActive(item.href) ? 'border-l-2 border-accent text-accent -ml-px' : 'text-muted hover:text-primary'}"
              >
                {item.label}
              </a>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </nav>

  <!-- Bottom links -->
  <div class="border-t border-border p-3">
    <a
      href="/practice"
      onclick={closeSidebar}
      class="block px-4 py-2 text-sm transition-colors
        {isActive('/practice') ? 'text-accent' : 'text-muted hover:text-primary'}"
    >
      Practice
    </a>
    <a
      href="/compare"
      onclick={closeSidebar}
      class="block px-4 py-2 text-sm transition-colors
        {isActive('/compare') ? 'text-accent' : 'text-muted hover:text-primary'}"
    >
      Compare Methods
    </a>
  </div>
</aside>
