export interface Topic {
  id: string;
  title: string;
  path: string;
  color: string;
}

export interface Problem {
  id: string;
  topicId: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  question: string;
  type: 'multiple-choice' | 'numeric';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  generateParams?: () => any;
}

export interface Progress {
  attempted: number;
  correct: number;
  lastPracticeDate: string;
}

export interface TopicProgress {
  [topicId: string]: Progress;
}

export type Difficulty = 'basic' | 'intermediate' | 'advanced';

export type Mode = 'hub' | 'quiz' | 'topic-practice';
