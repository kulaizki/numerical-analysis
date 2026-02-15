<script lang="ts">
  import MathText from '$lib/components/MathText.svelte';
  import { Card, Badge, Button, Input } from '$lib/components/ui';
  import type { Problem, Mode, Difficulty, Topic } from '../types';

  interface Props {
    mode: Mode;
    currentTopic: Topic | null;
    quizProblems: Problem[];
    currentProblemIndex: number;
    userAnswer: string;
    showFeedback: boolean;
    isCorrect: boolean;
    quizScore: number;
    selectedDifficulty: Difficulty;
    onBackToHub: () => void;
    onSubmitAnswer: () => void;
    onNextProblem: () => void;
    onAnswerChange: (answer: string) => void;
  }

  let {
    mode,
    currentTopic,
    quizProblems,
    currentProblemIndex,
    userAnswer = $bindable(),
    showFeedback,
    isCorrect,
    quizScore,
    selectedDifficulty,
    onBackToHub,
    onSubmitAnswer,
    onNextProblem,
    onAnswerChange
  }: Props = $props();

  let currentProblem = $derived(quizProblems[currentProblemIndex]);

  function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
      case 'basic': return '#22c55e';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#64748b';
    }
  }
</script>

<div class="mb-6">
  <Button variant="ghost" onclick={onBackToHub} class="mb-4">← Back to Hub</Button>

  <div class="flex items-center justify-between mb-4">
    <div>
      <h1 class="text-2xl font-bold text-accent">
        {mode === 'quiz' ? 'Quick Quiz' : currentTopic?.title}
      </h1>
      <p class="text-sm text-muted mt-1">
        Problem {currentProblemIndex + 1} of {quizProblems.length} • Score: {quizScore}/{quizProblems.length}
      </p>
    </div>
    <Badge color={getDifficultyColor(selectedDifficulty)} class="capitalize">
      {selectedDifficulty}
    </Badge>
  </div>

  <!-- Progress Bar -->
  <div class="w-full bg-bg-3 h-2 mb-6 border border-border">
    <div
      class="h-full bg-accent transition-all duration-300"
      style="width: {((currentProblemIndex + 1) / quizProblems.length) * 100}%"
    ></div>
  </div>
</div>

{#if currentProblem}
  <Card class="mb-6">
    <!-- Question -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-primary mb-3">Question</h3>
      <div class="text-muted leading-relaxed">
        <MathText text={currentProblem.question} />
      </div>
    </div>

    <!-- Answer Input -->
    {#if !showFeedback}
      {#if currentProblem.type === 'numeric'}
        <div class="mb-4">
          <Input
            bind:value={userAnswer}
            placeholder="Enter your answer"
            type="number"
            step="any"
            mono
            class="max-w-md"
          />
        </div>
      {:else if currentProblem.type === 'multiple-choice'}
        <div class="space-y-2 mb-4">
          {#each currentProblem.options || [] as option, i}
            <button
              class="w-full text-left border border-border bg-bg-3 p-4 transition-all duration-150
                {userAnswer === option ? 'border-accent bg-bg-2' : 'hover:border-accent'}"
              onclick={() => onAnswerChange(option)}
            >
              <MathText text={option} />
            </button>
          {/each}
        </div>
      {/if}

      <Button onclick={onSubmitAnswer} disabled={!userAnswer}>
        Submit Answer
      </Button>
    {:else}
      <!-- Feedback -->
      <div class="border-t border-border pt-6">
        <div class="mb-4">
          {#if isCorrect}
            <div class="flex items-center gap-2 text-[#22c55e] text-lg font-semibold mb-2">
              <span>✓</span> Correct!
            </div>
          {:else}
            <div class="flex items-center gap-2 text-[#ef4444] text-lg font-semibold mb-2">
              <span>✗</span> Incorrect
            </div>
            <div class="text-muted mb-2">
              Your answer: <MathText text={String(userAnswer)} />
            </div>
            <div class="text-muted mb-2">
              Correct answer: <MathText text={String(currentProblem.correctAnswer)} />
            </div>
          {/if}
        </div>

        <div class="bg-bg-3 border border-border p-4 mb-4">
          <h4 class="text-sm font-semibold text-primary mb-2">Explanation</h4>
          <div class="text-sm text-muted">
            <MathText text={currentProblem.explanation} />
          </div>
        </div>

        {#if currentProblemIndex < quizProblems.length - 1}
          <Button onclick={onNextProblem}>Next Problem →</Button>
        {:else}
          <div class="space-y-3">
            <div class="text-lg font-semibold text-primary">
              Quiz Complete! Final Score: {quizScore}/{quizProblems.length} ({((quizScore / quizProblems.length) * 100).toFixed(0)}%)
            </div>
            <Button onclick={onBackToHub}>Back to Hub</Button>
          </div>
        {/if}
      </div>
    {/if}
  </Card>
{/if}
