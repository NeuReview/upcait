// src/hooks/useFlashcards.ts

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

  // Map your UI category names to actual table names
  const tableMap: Record<string, string> = {
    'English Language Proficiency': 'question_bank_english_lang_prof',
    'English Reading Comprehension': 'question_bank_english_reading_comp',
    'Filipino Language Proficiency': 'question_bank_filipino_lang_prof',
    'Filipino Reading Comprehension': 'question_bank_filipino_reading_comp',
    'Math': 'question_bank_math',
    'Science': 'question_bank_science',
  };

  const fetchFlashcards = useCallback(async (category: string) => {
    setLoading(true);
    setError(null);

    try {
      let allData: Question[] = [];

      if (category === 'General') {
        // 1) pull *all* from each table
        const tableNames = Object.values(tableMap);
        const results = await Promise.all(
          tableNames.map((tbl) =>
            supabase
              .from(tbl)         // <= no <Question> generic here
              .select('*')
          )
        );

        // 2) gather data (or throw if any error)
        results.forEach(({ data, error }) => {
          if (error) throw error;
          if (data) allData.push(...data as Question[]);
        });

        // 3) shuffle + limit
        allData = allData
          .sort(() => Math.random() - 0.5)
          .slice(0, 50);

      } else {
        // single-category fetch
        const tbl = tableMap[category];
        if (!tbl) throw new Error(`Unknown category: "${category}"`);

        const { data, error } = await supabase
          .from(tbl)            // <= no <Question> generic here
          .select('*')
          .limit(20);

        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('No flashcards found. Please try again later.');
        }

        allData = (data as Question[]).sort(() => Math.random() - 0.5);
      }

      setFlashcards(allData);

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(msg);
      setFlashcards([]);

    } finally {
      setLoading(false);
    }
  }, []);

  return { flashcards, loading, error, fetchFlashcards };
}
