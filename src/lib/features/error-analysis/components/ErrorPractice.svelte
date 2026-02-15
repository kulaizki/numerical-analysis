<script lang="ts">
  import { Card, Button, Input } from '$lib/components/ui';

  type Problem = {
    exact: number;
    approx: number;
    absAnswer: number;
    relAnswer: number;
    sigAnswer: number;
  };

  const problems: Problem[] = [
    { exact: 2.71828, approx: 2.718, absAnswer: 0.00028, relAnswer: 0.000103, sigAnswer: 3 },
    { exact: 1.41421, approx: 1.414, absAnswer: 0.00021, relAnswer: 0.000148, sigAnswer: 3 },
    { exact: 9.8696, approx: 9.87, absAnswer: 0.0004, relAnswer: 0.0000405, sigAnswer: 3 }
  ];

  let userAnswers = $state<{abs: string; rel: string; sig: string}[]>(
    problems.map(() => ({ abs: '', rel: '', sig: '' }))
  );
  let submitted = $state<boolean[]>(problems.map(() => false));

  function submitProblem(index: number) {
    submitted[index] = true;
  }

  function checkAnswer(user: string, correct: number, tolerance: number = 0.0001): boolean {
    const val = parseFloat(user);
    if (isNaN(val)) return false;
    return Math.abs(val - correct) < tolerance;
  }
</script>

<Card>
  <h3 class="text-lg font-semibold text-primary mb-4">Practice Problems</h3>
  <p class="text-sm text-muted mb-4">
    Compute the absolute error, relative error, and significant digits for each pair.
  </p>

  {#each problems as problem, i}
    <div class="mb-6 p-4 bg-bg-3 border border-border">
      <p class="text-sm text-muted mb-3">
        Problem {i + 1}: p = {problem.exact}, p* = {problem.approx}
      </p>
      <div class="grid grid-cols-3 gap-3 mb-3">
        <Input
          bind:value={userAnswers[i].abs}
          placeholder="Absolute error"
          type="text"
          mono={true}
          disabled={submitted[i]}
        />
        <Input
          bind:value={userAnswers[i].rel}
          placeholder="Relative error"
          type="text"
          mono={true}
          disabled={submitted[i]}
        />
        <Input
          bind:value={userAnswers[i].sig}
          placeholder="Sig. digits"
          type="text"
          mono={true}
          disabled={submitted[i]}
        />
      </div>

      {#if !submitted[i]}
        <Button onclick={() => submitProblem(i)} size="sm">Submit</Button>
      {:else}
        <div class="space-y-2 text-sm">
          <div class="flex items-center gap-2">
            <span
              class="text-xs font-medium"
              style="color: {checkAnswer(userAnswers[i].abs, problem.absAnswer)
                ? '#10b981'
                : '#ef4444'}"
            >
              {checkAnswer(userAnswers[i].abs, problem.absAnswer) ? '✓' : '✗'} Absolute:
              {problem.absAnswer.toFixed(5)}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="text-xs font-medium"
              style="color: {checkAnswer(userAnswers[i].rel, problem.relAnswer)
                ? '#10b981'
                : '#ef4444'}"
            >
              {checkAnswer(userAnswers[i].rel, problem.relAnswer) ? '✓' : '✗'} Relative:
              {problem.relAnswer.toFixed(6)}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="text-xs font-medium"
              style="color: {checkAnswer(userAnswers[i].sig, problem.sigAnswer, 0)
                ? '#10b981'
                : '#ef4444'}"
            >
              {checkAnswer(userAnswers[i].sig, problem.sigAnswer, 0) ? '✓' : '✗'} Sig. Digits:
              {problem.sigAnswer}
            </span>
          </div>
        </div>
      {/if}
    </div>
  {/each}
</Card>
