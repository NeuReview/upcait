import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Question } from '../types/quiz';

interface UseFlashcardsReturn {
  flashcards: Question[];
  loading: boolean;
  error: string | null;
  fetchFlashcards: (category: string) => Promise<void>;
}

export function useFlashcards(): UseFlashcardsReturn {
  const [flashcards, setFlashcards] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = useCallback(async (category: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('question_bank')
        .select('*')
        .eq('category', category)
        .limit(20);

      if (supabaseError) throw supabaseError;

      if (!data || data.length === 0) {
        throw new Error(`No flashcards found for ${category}. Please try a different category.`);
      }

      // Shuffle flashcards
      const shuffledFlashcards = [...data].sort(() => Math.random() - 0.5);
      setFlashcards(shuffledFlashcards);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setFlashcards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { flashcards, loading, error, fetchFlashcards };
}