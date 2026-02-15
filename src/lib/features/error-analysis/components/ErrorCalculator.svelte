<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Input } from '$lib/components/ui';

  let exactValue = $state('3.14159265359');
  let approxValue = $state('3.14159');
  let absError = $state(0);
  let relError = $state(0);
  let sigDigits = $state(0);

  function calculateErrors() {
    const p = parseFloat(exactValue);
    const pStar = parseFloat(approxValue);
    if (isNaN(p) || isNaN(pStar)) return;

    absError = Math.abs(p - pStar);
    relError = absError / Math.abs(p);

    // Calculate significant digits
    let digits = 0;
    let threshold = 0.5;
    for (let i = 0; i <= 16; i++) {
      if (relError < threshold * Math.pow(10, -i)) {
        digits = i;
      }
      threshold = 5;
    }
    sigDigits = digits;
  }

  $effect(() => {
    calculateErrors();
  });
</script>

<Card class="mb-6">
  <h3 class="text-lg font-semibold text-primary mb-3">Theory</h3>
  <div class="space-y-4">
    <div>
      <p class="text-sm text-muted mb-2">Absolute Error</p>
      <KaTeX math={'E_{abs} = |p - p^*|'} displayMode={true} />
    </div>
    <div>
      <p class="text-sm text-muted mb-2">Relative Error</p>
      <KaTeX math={'E_{rel} = \\frac{|p - p^*|}{|p|}'} displayMode={true} />
    </div>
    <div>
      <p class="text-sm text-muted mb-2">Significant Digits</p>
      <p class="text-xs text-muted">
        The approximation <KaTeX math={'p^*'} /> has <KaTeX math={'n'} /> significant digits with
        respect to <KaTeX math={'p'} /> if <KaTeX math={'E_{rel} < 5 \\times 10^{-n}'} />
      </p>
    </div>
  </div>
</Card>

<Card class="mb-6">
  <h3 class="text-lg font-semibold text-primary mb-4">Error Calculator</h3>
  <div class="grid grid-cols-2 gap-4 mb-4">
    <Input
      bind:value={exactValue}
      label="Exact value (p)"
      type="text"
      placeholder="3.14159265359"
      mono={true}
    />
    <Input
      bind:value={approxValue}
      label="Approximate value (p*)"
      type="text"
      placeholder="3.14159"
      mono={true}
    />
  </div>

  <div class="mb-4">
    <div class="h-4 bg-bg-3 border border-border overflow-hidden">
      <div
        class="h-full bg-accent transition-all duration-300"
        style="width: {Math.min(relError * 10000, 100)}%"
      ></div>
    </div>
    <p class="text-xs text-muted mt-1">Visual Error Bar (relative error scaled)</p>
  </div>

  <div class="grid grid-cols-3 gap-4 text-sm">
    <div>
      <p class="text-muted mb-1">Absolute Error</p>
      <p class="font-mono text-primary">{absError.toExponential(6)}</p>
    </div>
    <div>
      <p class="text-muted mb-1">Relative Error</p>
      <p class="font-mono text-primary">{relError.toExponential(6)}</p>
    </div>
    <div>
      <p class="text-muted mb-1">Significant Digits</p>
      <p class="font-mono text-primary">{sigDigits}</p>
    </div>
  </div>
</Card>
