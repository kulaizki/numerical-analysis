<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Chart, registerables } from 'chart.js';

  Chart.register(...registerables);

  let {
    type = 'line' as const,
    data = {} as any,
    options = {} as any,
    width = '100%',
    height = '300px'
  }: {
    type?: string;
    data?: any;
    options?: any;
    width?: string;
    height?: string;
  } = $props();

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  onMount(() => {
    chart = new Chart(canvas, {
      type: type as any,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...options,
        plugins: {
          ...options.plugins,
          legend: {
            labels: { color: '#fafafa' },
            ...options.plugins?.legend
          }
        },
        scales: {
          x: {
            ticks: { color: '#a1a1aa' },
            grid: { color: '#27272a' },
            ...options.scales?.x
          },
          y: {
            ticks: { color: '#a1a1aa' },
            grid: { color: '#27272a' },
            ...options.scales?.y
          }
        }
      }
    });
  });

  $effect(() => {
    if (chart) {
      chart.data = data;
      chart.options = {
        responsive: true,
        maintainAspectRatio: false,
        ...options,
        plugins: {
          ...options.plugins,
          legend: {
            labels: { color: '#fafafa' },
            ...options.plugins?.legend
          }
        },
        scales: {
          x: {
            ticks: { color: '#a1a1aa' },
            grid: { color: '#27272a' },
            ...options.scales?.x
          },
          y: {
            ticks: { color: '#a1a1aa' },
            grid: { color: '#27272a' },
            ...options.scales?.y
          }
        }
      };
      chart.update();
    }
  });

  onDestroy(() => {
    chart?.destroy();
  });
</script>

<div style="width: {width}; height: {height};">
  <canvas bind:this={canvas}></canvas>
</div>
