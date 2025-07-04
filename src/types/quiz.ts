export interface Question {
  question_id: string;
  global_id?: string;
  category: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  tag: string;
  difficulty_level: 'Easy' | 'Medium' | 'Hard';
}


export type QuizState = {
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  showExplanation: boolean;
  score: number;
  isComplete: boolean;
};