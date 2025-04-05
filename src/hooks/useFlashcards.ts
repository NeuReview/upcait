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

  const fetchFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
  
      const { data, error: supabaseError } = await supabase
        .from('question_bank_english_lang_prof')
        .select('*')
        .limit(20);
  
      if (supabaseError) throw supabaseError;
  
      if (!data || data.length === 0) {
        throw new Error('No flashcards found. Please try again later.');
      }
  
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