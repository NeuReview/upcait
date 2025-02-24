export interface Question {
  question_id: number;
  category: string;
  difficulty_level: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: string;
  explanation: string;
  created_at?: string;
}

export type QuizState = {
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  showExplanation: boolean;
  score: number;
  isComplete: boolean;
};