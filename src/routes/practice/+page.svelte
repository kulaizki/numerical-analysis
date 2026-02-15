<script lang="ts">
  import { onMount } from 'svelte';
  import { PracticeHub, QuizRunner } from '$lib/features/practice';
  import { problemTemplates } from '$lib/features/practice/problems';
  import type { Difficulty, Topic, Mode, TopicProgress, Problem } from '$lib/features/practice';

  // State
  let selectedDifficulty: Difficulty = $state('basic');
  let mode: Mode = $state('hub');
  let currentTopic: Topic | null = $state(null);
  let quizProblems: Problem[] = $state([]);
  let currentProblemIndex = $state(0);
  let userAnswer = $state('');
  let showFeedback = $state(false);
  let isCorrect = $state(false);
  let quizScore = $state(0);
  let progress: TopicProgress = $state({});

  let currentProblem = $derived(quizProblems[currentProblemIndex]);

  // Load progress from localStorage
  onMount(() => {
    const stored = localStorage.getItem('numerilab-progress');
    if (stored) {
      progress = JSON.parse(stored);
    }
  });

  // Save progress
  function saveProgress() {
    localStorage.setItem('numerilab-progress', JSON.stringify(progress));
  }

  // Start quick quiz
  function startQuickQuiz() {
    const filtered = problemTemplates.filter(p => p.difficulty === selectedDifficulty);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    quizProblems = shuffled.slice(0, 5);
    currentProblemIndex = 0;
    quizScore = 0;
    userAnswer = '';
    showFeedback = false;
    mode = 'quiz';
  }

  // Start topic practice
  function startTopicPractice(topic: Topic) {
    currentTopic = topic;
    const filtered = problemTemplates.filter(
      p => p.topicId === topic.id && p.difficulty === selectedDifficulty
    );
    quizProblems = [...filtered].sort(() => Math.random() - 0.5);
    currentProblemIndex = 0;
    quizScore = 0;
    userAnswer = '';
    showFeedback = false;
    mode = 'topic-practice';
  }

  // Submit answer
  function submitAnswer() {
    if (!currentProblem) return;

    const correct = currentProblem.type === 'numeric'
      ? Math.abs(parseFloat(userAnswer) - Number(currentProblem.correctAnswer)) < 0.01
      : userAnswer === currentProblem.correctAnswer;

    isCorrect = correct;
    showFeedback = true;

    if (correct) quizScore++;

    // Update progress
    const topicId = currentProblem.topicId;
    if (!progress[topicId]) {
      progress[topicId] = { attempted: 0, correct: 0, lastPracticeDate: '' };
    }
    progress[topicId].attempted++;
    if (correct) progress[topicId].correct++;
    progress[topicId].lastPracticeDate = new Date().toISOString();
    saveProgress();
  }

  // Next problem
  function nextProblem() {
    if (currentProblemIndex < quizProblems.length - 1) {
      currentProblemIndex++;
      userAnswer = '';
      showFeedback = false;
    } else {
      mode = 'hub';
    }
  }

  // Back to hub
  function backToHub() {
    mode = 'hub';
    currentTopic = null;
  }
</script>

<svelte:head>
  <title>Practice | numerilab</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  {#if mode === 'hub'}
    <PracticeHub
      bind:selectedDifficulty
      {progress}
      onDifficultyChange={(diff) => selectedDifficulty = diff}
      onStartQuickQuiz={startQuickQuiz}
      onStartTopicPractice={startTopicPractice}
    />
  {:else if mode === 'quiz' || mode === 'topic-practice'}
    <QuizRunner
      {mode}
      {currentTopic}
      {quizProblems}
      {currentProblemIndex}
      bind:userAnswer
      {showFeedback}
      {isCorrect}
      {quizScore}
      {selectedDifficulty}
      onBackToHub={backToHub}
      onSubmitAnswer={submitAnswer}
      onNextProblem={nextProblem}
      onAnswerChange={(answer) => userAnswer = answer}
    />
  {/if}
</div>

<style>
  :global(body) {
    min-height: 100vh;
  }
</style>
