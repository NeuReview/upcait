import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Question } from '../types/quiz'

interface UseFlashcardsReturn {
  flashcards: Question[]
  loading: boolean
  error: string | null
  fetchFlashcards: (category: string, limit?: number) => Promise<void>
}

export function useFlashcards(): UseFlashcardsReturn {
  const [flashcards, setFlashcards] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  // Map each logical category to its underlying table(s)
  const categoryTables: Record<string, string[]> = {
    'Language Proficiency': [
      'question_bank_english_lang_prof',
      'question_bank_filipino_lang_prof',
    ],
    'Reading Comprehension': [
      'question_bank_english_reading_comp',
      'question_bank_filipino_reading_comp',
    ],
    Math: ['question_bank_math'],
    Science: ['question_bank_science'],
  }

  // Reverse lookup: table name → generic category
  const tableToCategory: Record<string, string> = {
    question_bank_english_lang_prof:    'Language Proficiency',
    question_bank_filipino_lang_prof:   'Language Proficiency',
    question_bank_english_reading_comp: 'Reading Comprehension',
    question_bank_filipino_reading_comp:'Reading Comprehension',
    question_bank_math:                 'Math',
    question_bank_science:              'Science',
  }

  const fetchFlashcards = useCallback(
    async (category: string, limit?: number) => {
      setLoading(true)
      setError(null)

      try {
        // 1) choose which tables to fetch
        const tablesToFetch =
          category === 'General'
            ? Object.values(categoryTables).flat()
            : categoryTables[category] ?? []

        if (tablesToFetch.length === 0) {
          throw new Error(`Unknown category: "${category}"`)
        }

        // 2) fetch from each table and tag rows
        const results = await Promise.all(
          tablesToFetch.map(tbl =>
            supabase
              .from(tbl)
              .select('*')
              .then(res => ({ ...res, tbl }))
          )
        )

        let allData: Question[] = []
        results.forEach(({ data, error: fetchErr, tbl }) => {
          if (fetchErr) throw fetchErr
          if (!data) return

          const withCat = (data as Question[]).map(row => ({
            ...row,
            category: tableToCategory[tbl] ?? 'Ungrouped',
          }))
          allData.push(...withCat)
        })

        // 3) shuffle + limit
        allData = shuffleArray(allData)
        if (limit != null) {
          allData = allData.slice(0, limit)
        }

        setFlashcards(allData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        setFlashcards([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { flashcards, loading, error, fetchFlashcards }
}
