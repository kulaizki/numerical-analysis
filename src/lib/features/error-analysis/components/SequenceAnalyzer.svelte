<script lang="ts">
  import { Card, Button, Input } from '$lib/components/ui';

  let userSequence = $state('0.5, 0.25, 0.125, 0.0625');
  let convergenceRate = $state('');

  function analyzeSequence() {
    const values = userSequence
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((v) => !isNaN(v));

    if (values.length < 3) {
      convergenceRate = 'Need at least 3 values';
      return;
    }

    const errors = values.map(Math.abs);
    const ratios: number[] = [];

    for (let i = 1; i < errors.length; i++) {
      if (errors[i - 1] !== 0) {
        ratios.push(errors[i] / errors[i - 1]);
      }
    }

    if (ratios.length === 0) {
      convergenceRate = 'Cannot determine rate';
      return;
    }

    const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;

    if (avgRatio >= 0.9) {
      convergenceRate = 'Sublinear or not converging';
    } else if (avgRatio >= 0.4 && avgRatio < 0.9) {
      convergenceRate = 'Linear (r ≈ 1)';
    } else if (avgRatio < 0.1) {
      convergenceRate = 'Quadratic or faster (r ≥ 2)';
    } else {
      convergenceRate = 'Superlinear (1 < r < 2)';
    }
  }
</script>

<Card>
  <h3 class="text-lg font-semibold text-primary mb-4">Sequence Rate Analyzer</h3>
  <p class="text-sm text-muted mb-4">
    Enter a sequence of error values (comma-separated) to classify its convergence rate.
  </p>
  <Input
    bind:value={userSequence}
    label="Error sequence"
    type="text"
    placeholder="0.5, 0.25, 0.125, 0.0625"
    mono={true}
    class="mb-4"
  />
  <Button onclick={analyzeSequence} size="sm" class="mb-4">Analyze</Button>

  {#if convergenceRate}
    <div class="p-4 bg-bg-3 border border-border">
      <p class="text-sm text-muted mb-1">Classification</p>
      <p class="text-primary font-medium">{convergenceRate}</p>
    </div>
  {/if}
</Card>
