export interface Question {
  question_id: number;
  global_id?: string;
  category: string;
  difficulty_level: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
}


export type QuizState = {
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  showExplanation: boolean;
  score: number;
  isComplete: boolean;
};