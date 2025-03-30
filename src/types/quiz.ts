export interface Question {
  question_id: number;
  category: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: string;
  explanation: string;
  difficulty_level: string; // ⬅️ REQUIRED
}


export type QuizState = {
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  showExplanation: boolean;
  score: number;
  isComplete: boolean;
};