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

  // Normalization
  let normInput = $state('6.238');

  let normResult = $derived(() => {
    const num = parseFloat(normInput);
    if (isNaN(num) || num === 0) return null;

    const isNegative = num < 0;
    const abs = Math.abs(num);
    const exp = Math.floor(Math.log10(abs)) + 1;
    const mant = abs / Math.pow(10, exp);

    return {
      signVal: isNegative ? -1 : 1,
      mantissa: mant.toPrecision(6).replace(/0+$/, '').replace(/\.$/, ''),
      exponent: exp,
      isNormalized: mant >= 0.1 && mant < 1
    };
  });

  // Overflow / Underflow
  let overflowInput = $state('1e308');

  let overflowResult = $derived(() => {
    const num = parseFloat(overflowInput);
    if (isNaN(num)) return { label: 'Invalid', color: '#6b7280', detail: 'Not a valid number.' };

    if (!Number.isFinite(num)) {
      return { label: 'Overflow', color: '#ef4444', detail: 'Value exceeds IEEE 754 range. Result: Infinity.' };
    }
    if (num === 0) {
      return { label: 'Underflow / Zero', color: '#f59e0b', detail: 'Value is too small to represent. Result: 0.' };
    }
    const abs = Math.abs(num);
    if (abs > 0 && abs < Number.MIN_VALUE) {
      return { label: 'Subnormal', color: '#a78bfa', detail: 'Value is in the subnormal (denormalized) range.' };
    }
    if (abs > Number.MAX_VALUE) {
      return { label: 'Overflow', color: '#ef4444', detail: 'Exceeds MAX_VALUE. Result: Infinity.' };
    }
    return { label: 'Normal', color: '#34d399', detail: `Representable as a normal IEEE 754 double. |x| ≈ ${abs.toExponential(4)}` };
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

  <!-- Section A: Normalization -->
  <Card class="mt-6">
    <h3 class="text-lg font-semibold text-primary mb-3">Normalization</h3>
    <p class="text-muted mb-4">
      A floating-point number in base 10 is <strong>normalized</strong> when the leading digit d₁ ≠ 0,
      i.e., the mantissa satisfies 0.1 ≤ |m| &lt; 1:
    </p>
    <KaTeX math={'x = (-1)^s \\times 0.d_1 d_2 d_3 \\ldots \\times 10^e, \\quad d_1 \\neq 0'} displayMode={true} />

    <div class="mt-4 mb-6 space-y-3 text-sm">
      <p class="text-muted font-medium">Static Examples</p>
      <div class="p-3 bg-bg-3 border border-border space-y-2 font-mono text-xs">
        <div>
          <span class="text-primary">6.238</span>
          <span class="text-muted ml-2">= (−1)⁰ × 0.6238 × 10¹</span>
          <Badge color="#34d399" class="ml-2">normalized ✓</Badge>
        </div>
        <div>
          <span class="text-primary">−0.0014</span>
          <span class="text-muted ml-2">= −0.0014 × 10⁰ → normalized: −0.14 × 10⁻²</span>
        </div>
        <div>
          <span class="text-primary">0.00345</span>
          <span class="text-muted ml-2">→ normalized: 0.345 × 10⁻²</span>
        </div>
      </div>
    </div>

    <h4 class="text-sm font-semibold text-primary mb-3">Interactive Normalizer</h4>
    <Input
      bind:value={normInput}
      label="Enter a decimal number"
      type="text"
      placeholder="6.238"
      mono={true}
      class="mb-4"
    />

    {#if normResult() !== null}
      {@const r = normResult()!}
      <div class="p-4 bg-bg-3 border border-border space-y-2 text-sm">
        <div class="flex items-center gap-3 flex-wrap">
          <span class="text-muted">Normalized form:</span>
          <span class="font-mono text-primary">
            ({r.signVal === -1 ? '−1' : '+1'}) × {r.mantissa} × 10^{r.exponent}
          </span>
          {#if r.isNormalized}
            <Badge color="#34d399">normalized ✓</Badge>
          {:else}
            <Badge color="#ef4444">not normalized ✗</Badge>
          {/if}
        </div>
        <KaTeX math={`(-1)^{${r.signVal === -1 ? 1 : 0}} \\times ${r.mantissa} \\times 10^{${r.exponent}}`} displayMode={true} />
      </div>
    {:else}
      <p class="text-sm text-muted">Enter a non-zero number to see its normalized form.</p>
    {/if}
  </Card>

  <!-- Section B: Overflow & Underflow -->
  <Card class="mt-6">
    <h3 class="text-lg font-semibold text-primary mb-3">Overflow &amp; Underflow</h3>
    <p class="text-muted mb-4">
      The exponent e is bounded: m &lt; e &lt; M. For IEEE 754 double precision, e ∈ [−1022, 1023].
    </p>
    <KaTeX math={'e_{\\min} = -1022 \\leq e \\leq 1023 = e_{\\max}'} displayMode={true} />

    <div class="mt-2 mb-4 space-y-2 text-sm text-muted">
      <div class="flex gap-2 items-start">
        <Badge color="#ef4444">Overflow</Badge>
        <span>e &gt; e<sub>max</sub> → result is ±Infinity (or NaN)</span>
      </div>
      <div class="flex gap-2 items-start">
        <Badge color="#f59e0b">Underflow</Badge>
        <span>e &lt; e<sub>min</sub> → result rounds to 0 (or subnormal)</span>
      </div>
    </div>

    <div class="mb-6 space-y-3 text-sm">
      <p class="text-muted font-medium">Static Examples</p>
      <div class="p-3 bg-bg-3 border border-border space-y-2 font-mono text-xs">
        <div class="flex items-center gap-2">
          <span class="text-primary">10³⁰⁸</span>
          <span class="text-muted">≈ 1e308 — near maximum representable value</span>
          <Badge color="#34d399">normal</Badge>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-primary">10³⁰⁹</span>
          <span class="text-muted">= 1e309 → Infinity</span>
          <Badge color="#ef4444">overflow</Badge>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-primary">10⁻³⁰⁸</span>
          <span class="text-muted">≈ 1e-308 — near minimum normal value</span>
          <Badge color="#34d399">normal</Badge>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-primary">10⁻³²⁴</span>
          <span class="text-muted">= 5e-324 → subnormal / 0</span>
          <Badge color="#f59e0b">underflow</Badge>
        </div>
      </div>
    </div>

    <h4 class="text-sm font-semibold text-primary mb-3">Interactive Classifier</h4>
    <Input
      bind:value={overflowInput}
      label="Enter a number (e.g. 1e308, 1e309, 1e-308, 5e-324)"
      type="text"
      placeholder="1e308"
      mono={true}
      class="mb-4"
    />

    {#if overflowResult()}
      {@const r = overflowResult()}
      <div class="p-4 bg-bg-3 border border-border space-y-2">
        <div class="flex items-center gap-3">
          <Badge color={r.color}>{r.label}</Badge>
          <span class="text-sm text-muted">{r.detail}</span>
        </div>
      </div>
    {/if}
  </Card>
</section>
