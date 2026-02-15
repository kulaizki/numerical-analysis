<script lang="ts">
  import { Card, Badge, Button } from '$lib/components/ui';
  import { topics } from '../problems';
  import type { Difficulty, Topic, TopicProgress } from '../types';

  interface Props {
    selectedDifficulty: Difficulty;
    progress: TopicProgress;
    onDifficultyChange: (difficulty: Difficulty) => void;
    onStartQuickQuiz: () => void;
    onStartTopicPractice: (topic: Topic) => void;
  }

  let {
    selectedDifficulty = $bindable(),
    progress,
    onDifficultyChange,
    onStartQuickQuiz,
    onStartTopicPractice
  }: Props = $props();

  // Derived overall stats
  let overallStats = $derived(() => {
    const total = Object.values(progress).reduce((acc, p) => ({
      attempted: acc.attempted + p.attempted,
      correct: acc.correct + p.correct
    }), { attempted: 0, correct: 0 });
    return {
      ...total,
      accuracy: total.attempted > 0 ? (total.correct / total.attempted * 100).toFixed(1) : '0.0'
    };
  });

  // Get topic progress
  function getTopicProgress(topicId: string) {
    const p = progress[topicId];
    if (!p || p.attempted === 0) return null;
    return {
      ...p,
      accuracy: (p.correct / p.attempted * 100).toFixed(0)
    };
  }
</script>

<!-- Header -->
<div class="mb-8">
  <h1 class="text-4xl font-bold text-accent mb-2">Practice Mode</h1>
  <p class="text-muted">Test your understanding with interactive problems</p>
</div>

<!-- Progress Dashboard -->
<Card class="mb-8">
  <h2 class="text-xl font-semibold text-primary mb-4">Your Progress</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <div class="border border-border p-4">
      <div class="text-3xl font-bold text-accent font-mono">{overallStats().attempted}</div>
      <div class="text-sm text-muted mt-1">Problems Attempted</div>
    </div>
    <div class="border border-border p-4">
      <div class="text-3xl font-bold text-accent font-mono">{overallStats().correct}</div>
      <div class="text-sm text-muted mt-1">Correct Answers</div>
    </div>
    <div class="border border-border p-4">
      <div class="text-3xl font-bold text-accent font-mono">{overallStats().accuracy}%</div>
      <div class="text-sm text-muted mt-1">Accuracy Rate</div>
    </div>
  </div>
</Card>

<!-- Difficulty Selector -->
<div class="mb-8">
  <h2 class="text-xl font-semibold text-primary mb-4">Select Difficulty</h2>
  <div class="flex gap-3">
    {#each ['basic', 'intermediate', 'advanced'] as difficulty}
      <button
        class="px-6 py-3 border transition-all duration-150
          {selectedDifficulty === difficulty
            ? 'bg-accent text-bg border-accent'
            : 'bg-bg-3 text-muted border-border hover:border-accent'}"
        onclick={() => onDifficultyChange(difficulty as Difficulty)}
      >
        <div class="font-semibold capitalize">{difficulty}</div>
        <div class="text-xs mt-1">
          {difficulty === 'basic' ? 'Direct computation' : difficulty === 'intermediate' ? 'Multi-step problems' : 'Analysis & theory'}
        </div>
      </button>
    {/each}
  </div>
</div>

<!-- Quick Quiz -->
<Card class="mb-8 bg-bg-3">
  <h2 class="text-xl font-semibold text-primary mb-3">Quick Quiz</h2>
  <p class="text-muted mb-4">Test yourself with 5 random problems across all topics</p>
  <Button onclick={onStartQuickQuiz}>Start Quick Quiz</Button>
</Card>

<!-- Topic Selector -->
<div>
  <h2 class="text-xl font-semibold text-primary mb-4">Practice by Topic</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    {#each topics as topic}
      {@const topicProgress = getTopicProgress(topic.id)}
      <button
        onclick={() => onStartTopicPractice(topic)}
        class="text-left border border-border bg-bg-2 p-4 hover:border-accent transition-all duration-150"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" style="background-color: {topic.color};"></div>
            <h3 class="font-semibold text-primary">{topic.title}</h3>
          </div>
          {#if topicProgress}
            <Badge color={topic.color} class="text-xs">
              {topicProgress.accuracy}% ({topicProgress.correct}/{topicProgress.attempted})
            </Badge>
          {/if}
        </div>
        {#if topicProgress}
          <div class="text-xs text-tertiary">
            Last practiced: {new Date(topicProgress.lastPracticeDate).toLocaleDateString()}
          </div>
        {:else}
          <div class="text-xs text-tertiary">Not attempted yet</div>
        {/if}
      </button>
    {/each}
  </div>
</div>
