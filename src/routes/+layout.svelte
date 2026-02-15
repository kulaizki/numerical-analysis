<script lang="ts">
  import '../app.css';
  import Sidebar from '$lib/components/Sidebar.svelte';
  let { children } = $props();
</script>

<Sidebar />

<!-- Main content -->
<main class="md:ml-60 pt-12 md:pt-0 min-h-screen">
  <div class="max-w-5xl mx-auto px-4 md:px-6 py-8">
    {@render children()}
  </div>
</main>
