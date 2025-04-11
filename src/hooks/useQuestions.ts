import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Question } from '../types/quiz';

interface UseQuestionsReturn {
  questions: Question[];
  loading: boolean;
  error: string | null;
  fetchQuestions: (category: string, difficulty: string) => Promise<void>;
  updateUserStats: (correctAnswers: number, totalAnswers: number) => Promise<void>;
}

export function useQuestions(): UseQuestionsReturn {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTableName = (category: string): string => {
    switch (category) {
      case 'Mathematics':
        return 'question_bank_math';
      case 'Science':
        return 'question_bank_science';
      case 'Language Proficiency':
        return 'question_bank_english_lang_prof'; // Update if you add Filipino
      default:
        throw new Error(`No table mapped for category: ${category}`);
    }
  };

  const fetchQuestions = useCallback(async (category: string, difficulty: string) => {
    try {
      setLoading(true);
      setError(null);

      const tableName = getTableName(category);

      console.log('[Fetching Questions]', { category, difficulty });
      console.log('[Fetching from table]', tableName);

      const { data, error: supabaseError } = await supabase
        .from(tableName)
        .select('*')
        .eq('difficulty', difficulty)
        .limit(20);

      if (supabaseError) throw supabaseError;

      if (!data || data.length === 0) {
        throw new Error(`No questions found for ${category} at ${difficulty} level. Please try a different combination.`);
      }

      // Sanitize and map uppercase column names to lowercase
      const sanitized = data.map((q: any): Question => ({
        question_id: q.question_id,
        category: category,
        question: q.question?.trim() || '[Question missing]',
        option_a: q.option_a?.trim() || q.option_A?.trim() || '[Option A missing]',
        option_b: q.option_b?.trim() || q.option_B?.trim() || '[Option B missing]',
        option_c: q.option_c?.trim() || q.option_C?.trim() || '[Option C missing]',
        option_d: q.option_d?.trim() || q.option_D?.trim() || '[Option D missing]',

        answer: q.answer?.trim() || 'A',
        explanation: q.explanation?.trim() || 'No explanation provided.',
        difficulty_level: q.difficulty || difficulty,
      }));

      // Shuffle questions
      const shuffled = [...sanitized].sort(() => Math.random() - 0.5);

      setQuestions(shuffled);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserStats = async (correctAnswers: number, totalAnswers: number) => {
    try {
      const user = supabase.auth.getUser();
      if (!user) return;

      const { data: existingStats, error: fetchError } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', (await user).data.user?.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingStats) {
        const { error: updateError } = await supabase
          .from('user_statistics')
          .update({
            questions_answered: existingStats.questions_answered + totalAnswers,
            correct_answers: existingStats.correct_answers + correctAnswers
          })
          .eq('user_id', (await user).data.user?.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_statistics')
          .insert([{
            user_id: (await user).data.user?.id,
            questions_answered: totalAnswers,
            correct_answers: correctAnswers
          }]);

        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Error updating user statistics:', err);
    }
  };

  return { questions, loading, error, fetchQuestions, updateUserStats };
}
