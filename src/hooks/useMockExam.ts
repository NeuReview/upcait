import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Question } from '../types/quiz';
import { v4 as uuidv4 } from 'uuid'; // Make sure you have `uuid` installed

interface UseMockExamReturn {
  questions: Question[];
  loading: boolean;
  error: string | null;
  fetchQuestions: (category: string, append?: boolean) => Promise<void>;
  updateUserStats: (correctAnswers: number, totalAnswers: number) => Promise<void>;
  clearError: () => void; // ✅ Added
}

export function useMockExam(): UseMockExamReturn {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeQuestion = (q: any, category: string) => ({
    question_id: q.question_id,
    question: q.question,
    option_a: q.option_a || q.option_A,
    option_b: q.option_b || q.option_B,
    option_c: q.option_c || q.option_C,
    option_d: q.option_d || q.option_D,
    answer: q.answer,
    explanation: q.explanation || 'No explanation provided.',
    category,
  });

  const fetchQuestions = useCallback(
    async (category: string, append: boolean = false) => {
      try {
        setLoading(true);
        setError(null);
  
        let data: any[] = [];
  
        if (category === 'Language Proficiency') {
          const { data: englishData, error: englishError } = await supabase
            .from('question_bank_english_lang_prof')
            .select('*')
            .limit(5);
  
          if (englishError) throw englishError;
  
          const { data: filipinoData, error: filipinoError } = await supabase
            .from('question_bank_filipino_lang_prof')
            .select('*')
            .limit(5);
  
          if (filipinoError) throw filipinoError;
  
          data = [
            ...englishData.map((q) => ({
              ...normalizeQuestion(q, 'Language Proficiency'),
              question_id: uuidv4() // assign unique ID
            })),
            ...filipinoData.map((q) => ({
              ...normalizeQuestion(q, 'Language Proficiency'),
              question_id: uuidv4() // assign unique ID
            })),
          ];
        } else if (category === 'Mathematics') {
          const { data: mathData, error: mathError } = await supabase
            .from('question_bank_math')
            .select('*')
            .limit(5);
  
          if (mathError) throw mathError;
  
          data = mathData.map((q) => ({
            ...normalizeQuestion(q, 'Mathematics'),
            question_id: uuidv4()
          }));
        } else if (category === 'Science') {
          const { data: scienceData, error: scienceError } = await supabase
            .from('question_bank_science')
            .select('*')
            .limit(5);
  
          if (scienceError) throw scienceError;
  
          data = scienceData.map((q) => ({
            ...normalizeQuestion(q, 'Science'),
            question_id: uuidv4()
          }));
        } else if (category === 'Reading Comprehension') {
          const { data: readingData, error: readingError } = await supabase
            .from('question_bank')
            .select('*')
            .eq('category', 'Reading Comprehension')
            .limit(5);
  
          if (readingError) throw readingError;
  
          data = readingData.map((q) => ({
            ...normalizeQuestion(q, 'Reading Comprehension'),
            question_id: uuidv4()
          }));
        } else {
          throw new Error(`Unknown category: ${category}`);
        }
  
        if (!data || data.length === 0) {
          throw new Error(`No questions found for ${category}.`);
        }
  
        // Shuffle questions
        const shuffled = data.sort(() => Math.random() - 0.5);
  
        setQuestions((prev) => (append ? [...prev, ...shuffled] : shuffled));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateUserStats = async (correctAnswers: number, totalAnswers: number) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const { data: existingStats, error: fetchError } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.data.user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingStats) {
        const { error: updateError } = await supabase
          .from('user_statistics')
          .update({
            questions_answered: existingStats.questions_answered + totalAnswers,
            correct_answers: existingStats.correct_answers + correctAnswers,
          })
          .eq('user_id', user.data.user.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_statistics')
          .insert([
            {
              user_id: user.data.user.id,
              questions_answered: totalAnswers,
              correct_answers: correctAnswers,
            },
          ]);

        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Error updating user stats:', err);
    }
  };

  const clearError = () => setError(null); // ✅ Added

  return { questions, loading, error, fetchQuestions, updateUserStats, clearError };
}
