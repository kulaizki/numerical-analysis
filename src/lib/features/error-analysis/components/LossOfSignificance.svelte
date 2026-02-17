<script lang="ts">
  import KaTeX from '$lib/components/KaTeX.svelte';
  import { Card, Button } from '$lib/components/ui';

  let show = $state(true);

  // Example 1.13: f(x) = x(sqrt(x+1) - sqrt(x))
  const testValues = [1, 100, 1000, 10000, 100000];

  type Row1_13 = {
    x: number;
    naive: number;
    stable: number;
  };

  const rows1_13: Row1_13[] = testValues.map((x) => {
    const naive = x * (Math.sqrt(x + 1) - Math.sqrt(x));
    const stable = x / (Math.sqrt(x + 1) + Math.sqrt(x)); // rationalised form
    return { x, naive, stable };
  });
</script>

<section id="loss-of-significance" class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold text-accent">Loss of Significance</h2>
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
            When two nearly equal numbers are subtracted, the leading significant digits cancel
            and the relative error of the result can be <em>much</em> larger than the relative
            errors of the individual operands.
          </p>
          <div>
            <p class="mb-1">If <KaTeX math={'E_r(x_A)'} /> and <KaTeX math={'E_r(y_A)'} /> are small, the relative error of <KaTeX math={'z_A = x_A - y_A'} /> satisfies:</p>
            <KaTeX
              math={'E_r(z_A) \\approx \\frac{|x| \\, E_r(x_A) + |y| \\, E_r(y_A)}{|x - y|}'}
              displayMode={true}
            />
          </div>
          <p>
            When <KaTeX math={'x \\approx y'} />, the denominator <KaTeX math={'|x - y|'} /> is tiny
            while the numerator remains of order <KaTeX math={'|x|'} />, causing catastrophic amplification.
          </p>
        </div>
      </div>

      <!-- Example 1.11 -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-3">Example 1.11 — Subtraction of Nearly Equal Numbers</h3>
        <div class="space-y-4 text-sm">
          <div class="bg-bg-3 border border-border p-4 space-y-2">
            <p class="text-muted">Given values and their approximations (rounded):</p>
            <KaTeX
              math={'x = 7.6545428, \\quad x_A = 7.6545421 \\; (6 \\text{ sig. digits})'}
              displayMode={true}
            />
            <KaTeX
              math={'y = 7.6544201, \\quad y_A = 7.6544200 \\; (7 \\text{ sig. digits})'}
              displayMode={true}
            />
          </div>

          <div class="bg-bg-3 border border-border p-4 space-y-2">
            <p class="text-muted font-medium">Step 1: Compute the subtraction</p>
            <KaTeX
              math={'z = x - y = 7.6545428 - 7.6544201 = 0.0001227'}
              displayMode={true}
            />
            <KaTeX
              math={'z_A = x_A - y_A = 7.6545421 - 7.6544200 = 0.0001221'}
              displayMode={true}
            />
          </div>

          <div class="bg-bg-3 border border-border p-4 space-y-2">
            <p class="text-muted font-medium">Step 2: Absolute error of the result</p>
            <KaTeX
              math={'|z - z_A| = |0.0001227 - 0.0001221| = 0.6 \\times 10^{-6}'}
              displayMode={true}
            />
            <p class="text-muted">
              Although <KaTeX math={'x_A'} /> had 6 significant digits, <KaTeX math={'z_A'} /> has only
              <span class="text-primary font-semibold">3 significant digits</span> — three digits were lost to cancellation.
            </p>
          </div>

          <div class="bg-bg-3 border border-border p-4 space-y-2">
            <p class="text-muted font-medium">Step 3: Error amplification factor</p>
            <KaTeX
              math={'E_r(z_A) \\approx 53736 \\times E_r(x_A)'}
              displayMode={true}
            />
            <p class="text-muted">
              The relative error of the result is roughly <span class="text-red-400 font-semibold">53,736 times</span> larger
              than the relative error of the original approximation — a dramatic loss of significance.
            </p>
          </div>
        </div>
      </div>

      <!-- Example 1.13 -->
      <div>
        <h3 class="text-sm font-semibold text-primary mb-3">Example 1.13 — Reformulation to Avoid Cancellation</h3>
        <div class="space-y-4 text-sm">
          <div class="bg-bg-3 border border-border p-4 space-y-2">
            <p class="text-muted">Consider the function:</p>
            <KaTeX
              math={'f(x) = x\\bigl(\\sqrt{x+1} - \\sqrt{x}\\bigr)'}
              displayMode={true}
            />
            <p class="text-muted">
              For large <KaTeX math={'x'} />, the terms <KaTeX math={'\\sqrt{x+1}'} /> and
              <KaTeX math={'\\sqrt{x}'} /> are nearly equal, causing catastrophic cancellation.
              Rationalising the numerator gives the equivalent but numerically stable form:
            </p>
            <KaTeX
              math={'f(x) = \\frac{x}{\\sqrt{x+1} + \\sqrt{x}}'}
              displayMode={true}
            />
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm font-mono border-collapse">
              <thead>
                <tr class="border-b border-border">
                  <th class="text-left text-muted py-2 pr-6 font-medium">x</th>
                  <th class="text-left text-muted py-2 pr-6 font-medium">Naive (cancellation)</th>
                  <th class="text-left text-muted py-2 font-medium">Stable (rationalised)</th>
                </tr>
              </thead>
              <tbody>
                {#each rows1_13 as row}
                  <tr class="border-b border-border">
                    <td class="text-primary py-2 pr-6">{row.x.toLocaleString()}</td>
                    <td
                      class="py-2 pr-6 {Math.abs(row.naive - row.stable) / row.stable > 1e-6
                        ? 'text-red-400'
                        : 'text-green-400'}"
                    >
                      {row.naive.toFixed(6)}
                    </td>
                    <td class="text-green-400 py-2">{row.stable.toFixed(6)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <div class="bg-bg-3 border border-border p-3 text-xs text-muted space-y-1">
            <p>
              At <KaTeX math={'x = 100{,}000'} /> the naive form suffers from severe cancellation.
              The stable form <KaTeX math={'x / (\\sqrt{x+1} + \\sqrt{x})'} /> is algebraically
              identical but avoids subtracting nearly equal square roots, preserving all significant digits.
            </p>
          </div>
        </div>
      </div>

    </Card>
  {/if}
</section>
