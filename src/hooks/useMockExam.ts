import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Question } from '../types/quiz';

interface UseMockExamReturn {
  questions: Question[];
  loading: boolean;
  error: string | null;
  fetchQuestions: (category: string, append?: boolean) => Promise<void>; // ✅ Now allows 2 arguments
  updateUserStats: (correctAnswers: number, totalAnswers: number) => Promise<void>;
}

export function useMockExam(): UseMockExamReturn {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async (category: string, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
  
      const { data, error: supabaseError } = await supabase
        .from('question_bank')
        .select('*')
        .eq('category', category)
        .limit(1);
  
      if (supabaseError) throw supabaseError;
  
      if (!data || data.length === 0) {
        throw new Error(`No questions found for ${category}. Please try a different category.`);
      }
  
      // Shuffle questions
      const shuffledQuestions = [...data].sort(() => Math.random() - 0.5);
  
      // Append new questions if append = true; otherwise, replace
      setQuestions(prevQuestions => append ? [...prevQuestions, ...shuffledQuestions] : shuffledQuestions); 
  
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
        // Update existing stats
        const { error: updateError } = await supabase
          .from('user_statistics')
          .update({
            questions_answered: existingStats.questions_answered + totalAnswers,
            correct_answers: existingStats.correct_answers + correctAnswers
          })
          .eq('user_id', (await user).data.user?.id);

        if (updateError) throw updateError;
      } else {
        // Create new stats
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