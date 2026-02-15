<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Badge, Input } from '$lib/components/ui';

  let floatInput = $state('3.14159');
  let sign = $state(0);
  let exponent = $state(0);
  let mantissa = $state(0);
  let signBit = $state('0');
  let exponentBits = $state('');
  let mantissaBits = $state('');

  function decimalToIEEE754(value: string) {
    const num = parseFloat(value);
    if (isNaN(num)) return;

    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setFloat64(0, num, false);

    const bits = Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(2).padStart(8, '0'))
      .join('');

    signBit = bits[0];
    exponentBits = bits.slice(1, 12);
    mantissaBits = bits.slice(12);

    sign = parseInt(signBit, 2);
    exponent = parseInt(exponentBits, 2);
    mantissa = parseInt(mantissaBits, 2);
  }

  $effect(() => {
    decimalToIEEE754(floatInput);
  });
</script>

<section class="mb-12 border-b border-border pb-12">
  <h2 class="text-xl font-bold text-primary mb-4">1. Floating-Point Arithmetic</h2>

  <Card class="mb-6">
    <h3 class="text-lg font-semibold text-primary mb-3">IEEE 754 Double-Precision Format</h3>
    <p class="text-muted mb-4">
      A 64-bit floating-point number is represented as:
    </p>
    <KaTeX math={'(-1)^s \\times 2^{(e-1023)} \\times (1 + f)'} displayMode={true} />
    <div class="mt-4 space-y-2 text-sm text-muted">
      <div class="flex gap-4">
        <Badge color="#ef4444">Sign (s)</Badge>
        <span>1 bit: 0 for positive, 1 for negative</span>
      </div>
      <div class="flex gap-4">
        <Badge color="#f59e0b">Exponent (e)</Badge>
        <span>11 bits: biased by 1023</span>
      </div>
      <div class="flex gap-4">
        <Badge color="#a5b4fc">Mantissa (f)</Badge>
        <span>52 bits: fractional part</span>
      </div>
    </div>
    <div class="mt-4 p-3 bg-bg-3 border border-border">
      <p class="text-xs text-muted mb-1">Machine Epsilon</p>
      <KaTeX math={'\\varepsilon \\approx 2.22 \\times 10^{-16}'} />
    </div>
  </Card>

  <Card>
    <h3 class="text-lg font-semibold text-primary mb-4">Interactive IEEE 754 Converter</h3>
    <Input
      bind:value={floatInput}
      label="Enter a decimal number"
      type="text"
      placeholder="3.14159"
      mono={true}
      class="mb-4"
    />

    <div class="mb-4">
      <p class="text-sm text-muted mb-2">Binary Representation (64 bits)</p>
      <div class="flex gap-1 flex-wrap font-mono text-xs">
        <!-- Sign bit -->
        <div
          class="px-2 py-1 border"
          style="background: #ef444418; color: #ef4444; border-color: #ef444440;"
        >
          {signBit}
        </div>

        <!-- Exponent bits -->
        {#each exponentBits.split('') as bit}
          <div
            class="px-2 py-1 border"
            style="background: #f59e0b18; color: #f59e0b; border-color: #f59e0b40;"
          >
            {bit}
          </div>
        {/each}

        <!-- Mantissa bits -->
        {#each mantissaBits.split('') as bit}
          <div
            class="px-2 py-1 border"
            style="background: rgba(129, 140, 248, 0.1); color: #818cf8; border-color: rgba(129, 140, 248, 0.25);"
          >
            {bit}
          </div>
        {/each}
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4 text-sm">
      <div>
        <p class="text-muted mb-1">Sign</p>
        <p class="font-mono text-primary">{sign}</p>
      </div>
      <div>
        <p class="text-muted mb-1">Exponent (decimal)</p>
        <p class="font-mono text-primary">{exponent} (biased: {exponent - 1023})</p>
      </div>
      <div>
        <p class="text-muted mb-1">Mantissa (decimal)</p>
        <p class="font-mono text-primary">{mantissa}</p>
      </div>
    </div>
  </Card>
</section>
