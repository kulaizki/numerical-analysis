<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Button } from '$lib/components/ui';

  let show = $state(true);

  // Example 1.16: f(x) = sqrt(x+1) - sqrt(x)
  // Condition number: kappa = |x f'(x) / f(x)|
  // f'(x) = 1/(2*sqrt(x+1)) - 1/(2*sqrt(x))
  function f(x: number): number {
    return Math.sqrt(x + 1) - Math.sqrt(x);
  }

  function fPrime(x: number): number {
    return 1 / (2 * Math.sqrt(x + 1)) - 1 / (2 * Math.sqrt(x));
  }

  function conditionNumber(x: number): number {
    const fx = f(x);
    const fpx = fPrime(x);
    if (fx === 0) return Infinity;
    return Math.abs((x * fpx) / fx);
  }

  // 3-digit rounding helper (round to 3 significant figures)
  function round3(v: number): number {
    if (v === 0) return 0;
    const mag = Math.floor(Math.log10(Math.abs(v)));
    const factor = Math.pow(10, 2 - mag);
    return Math.round(v * factor) / factor;
  }

  const demoX = 12345;
  const trueVal = f(demoX);
  const naive3 = round3(Math.sqrt(demoX + 1)) - round3(Math.sqrt(demoX));
  const naiveRelErr = Math.abs(naive3 - trueVal) / Math.abs(trueVal);
  const kappa = conditionNumber(demoX);

  type TableRow = {
    x: number;
    fTrue: number;
    kappa: number;
  };

  const tableRows: TableRow[] = [1, 10, 100, 1000, 12345, 100000].map((x) => ({
    x,
    fTrue: f(x),
    kappa: conditionNumber(x)
  }));
</script>

<section id="propagated-error" class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold text-accent">Propagated Error &amp; Stability</h2>
    <Button variant="ghost" size="sm" onclick={() => (show = !show)}>
      {show ? 'Hide' : 'Show'}
    </Button>
  </div>

  {#if show}
    <Card class="space-y-6">

      <!-- Theory -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-3">Theory</h3>
        <div class="space-y-3 text-sm text-muted">
          <p>
            By the Mean Value Theorem, if <KaTeX math={'x_A'} /> approximates <KaTeX math={'x'} />,
            then the error in <KaTeX math={'f(x)'} /> propagates as:
          </p>
          <KaTeX
            math={'f(x) - f(x_A) \\approx f\'(x)\\,(x - x_A)'}
            displayMode={true}
          />
          <p>Converting to relative errors:</p>
          <KaTeX
            math={'E_r(f(x)) \\approx \\left|\\frac{x\\,f\'(x)}{f(x)}\\right| E_r(x) = \\kappa(x)\\,E_r(x)'}
            displayMode={true}
          />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-3 bg-bg-3 border border-border">
              <p class="font-medium text-green-400">Well-conditioned: <KaTeX math={'\\kappa \\approx 1'} /></p>
              <p class="text-xs mt-1">Error is not amplified. Algorithm is stable.</p>
            </div>
            <div class="p-3 bg-bg-3 border border-border">
              <p class="font-medium text-red-400">Ill-conditioned: <KaTeX math={'\\kappa \\gg 1'} /></p>
              <p class="text-xs mt-1">Errors amplify dramatically. Algorithm is unstable.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Example 1.16 -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-3">Example 1.16 — Stability of <KaTeX math={'f(x) = \\sqrt{x+1} - \\sqrt{x}'} /></h3>
        <div class="space-y-4 text-sm">

          <div class="bg-bg-3 border border-border p-4 space-y-2">
            <p class="text-muted">
              Consider <KaTeX math={'x = 12345'} />. The true value is:
            </p>
            <KaTeX
              math={'f(12345) = \\sqrt{12346} - \\sqrt{12345} \\approx 0.004500'}
              displayMode={true}
            />
          </div>

          <div class="bg-bg-3 border border-border p-4 space-y-2">
            <p class="text-muted font-medium">Step 1: 3-digit rounding of each square root</p>
            <KaTeX
              math={'\\sqrt{12346} \\approx 111.112 \\xrightarrow{\\text{3-digit}} 111'}
              displayMode={true}
            />
            <KaTeX
              math={'\\sqrt{12345} \\approx 111.108 \\xrightarrow{\\text{3-digit}} 111'}
              displayMode={true}
            />
            <KaTeX
              math={'f_A = 111 - 111 = 0'}
              displayMode={true}
            />
          </div>

          <div class="bg-bg-3 border border-border p-4 space-y-2">
            <p class="text-muted font-medium">Step 2: Relative error of the naive computation</p>
            <KaTeX
              math={'E_r(f_A) = \\frac{|f(12345) - f_A|}{|f(12345)|} = \\frac{|0.004500 - 0|}{0.004500} \\approx 100\\%'}
              displayMode={true}
            />
            <p class="text-red-400 font-medium">
              The computed result is completely wrong — a 100% relative error from 3-digit rounding.
            </p>
          </div>

          <div class="bg-bg-3 border border-border p-4 space-y-2">
            <p class="text-muted font-medium">Step 3: Condition number confirms instability</p>
            <KaTeX
              math={'\\kappa(12345) = \\left|\\frac{x\\,f\'(x)}{f(x)}\\right| \\approx {' + kappa.toFixed(0) + '}'}
              displayMode={true}
            />
            <p class="text-muted">
              A condition number of <span class="text-red-400 font-semibold">{kappa.toFixed(0)}</span> means
              every digit of relative error in <KaTeX math={'x'} /> produces roughly {kappa.toFixed(0)} digits
              of relative error in <KaTeX math={'f(x)'} />. This function is severely ill-conditioned for large <KaTeX math={'x'} />.
            </p>
          </div>

          <div class="bg-bg-3 border border-border p-4 space-y-2">
            <p class="text-muted font-medium">Step 4: Stable reformulation</p>
            <KaTeX
              math={'f(x) = \\sqrt{x+1} - \\sqrt{x} = \\frac{1}{\\sqrt{x+1} + \\sqrt{x}}'}
              displayMode={true}
            />
            <p class="text-muted">
              This algebraically equivalent form avoids subtracting nearly equal numbers and is numerically stable.
            </p>
          </div>
        </div>
      </div>

      <!-- Condition number table across x values -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-3">
          Condition Number vs. <KaTeX math={'x'} /> for <KaTeX math={'f(x) = \\sqrt{x+1} - \\sqrt{x}'} />
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm font-mono border-collapse">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left text-muted py-2 pr-6 font-medium">x</th>
                <th class="text-left text-muted py-2 pr-6 font-medium">f(x)</th>
                <th class="text-left text-muted py-2 font-medium">
                  <KaTeX math={'\\kappa(x)'} />
                </th>
              </tr>
            </thead>
            <tbody>
              {#each tableRows as row}
                {@const isIll = row.kappa > 100}
                <tr class="border-b border-border">
                  <td class="text-primary py-2 pr-6">{row.x.toLocaleString()}</td>
                  <td class="text-primary py-2 pr-6">{row.fTrue.toFixed(8)}</td>
                  <td class="py-2 {isIll ? 'text-red-400' : 'text-green-400'}">
                    {row.kappa.toFixed(1)}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <p class="text-xs text-muted mt-2">
          The condition number grows without bound as <KaTeX math={'x \\to \\infty'} />,
          confirming that <KaTeX math={'f(x) = \\sqrt{x+1} - \\sqrt{x}'} /> is increasingly ill-conditioned for large <KaTeX math={'x'} />.
        </p>
      </div>

    </Card>
  {/if}
</section>
