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

  // Fisher–Yates shuffle
  function shuffleArray<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Map UI category keys to your Supabase tables
  const tableMap: Record<string, string> = {
    'English Language Proficiency':   'question_bank_english_lang_prof',
    'English Reading Comprehension':  'question_bank_english_reading_comp',
    'Filipino Language Proficiency':  'question_bank_filipino_lang_prof',
    'Filipino Reading Comprehension': 'question_bank_filipino_reading_comp',
    'Math':                           'question_bank_math',
    'Science':                        'question_bank_science',
  };

  const fetchFlashcards = useCallback(async (category: string) => {
    setLoading(true);
    setError(null);

    try {
      let allData: Question[] = [];

      if (category === 'General') {
        // 1) pull *all* rows from each table
        const tables = Object.values(tableMap);
        const results = await Promise.all(
          tables.map(tbl => supabase.from(tbl).select('*'))
        );

        // 2) collect and error‐check
        results.forEach(({ data, error: fetchErr }) => {
          if (fetchErr) throw fetchErr;
          if (data) allData.push(...(data as Question[]));
        });

        // 3) shuffle + limit to 50
        allData = shuffleArray(allData).slice(0, 50);

      } else {
        // single‐category fetch (up to 20), then shuffle
        const tbl = tableMap[category];
        if (!tbl) throw new Error(`Unknown category: "${category}"`);

        const { data, error: fetchErr } = await supabase
          .from(tbl)
          .select('*')
          .limit(20);

        if (fetchErr) throw fetchErr;
        if (!data || data.length === 0) {
          throw new Error('No flashcards found. Please try again later.');
        }

        allData = shuffleArray(data as Question[]);
      }

      setFlashcards(allData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setFlashcards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { flashcards, loading, error, fetchFlashcards };
}
