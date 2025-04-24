import { useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Question } from '../types/quiz';
import { v4 as uuidv4 } from 'uuid';

const getUserId = async (): Promise<string|null> => {
  const { data, error } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
};


interface UseMockExamReturn {
  questions: Question[];
  loading: boolean;
  error: string | null;
  fetchQuestions: (category: string, append?: boolean) => Promise<Question[]>;
  updateUserStats: (correctAnswers: number, totalAnswers: number) => Promise<void>;
  clearError: () => void;
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  clearUsedQuestionIds: () => void;

  // ← Add these four:
  recordScienceMockExam: (questionUuid: string, isCorrect: boolean, tag: string) => Promise<void>;
  recordMathMockExam: (questionUuid: string, isCorrect: boolean, tag: string) => Promise<void>;
  recordLangProfMockExam: (questionUuid: string, isCorrect: boolean, tag: string) => Promise<void>;
  recordReadingCompMockExam: (questionUuid: string, isCorrect: boolean, tag: string) => Promise<void>;
}

export function useMockExam(): UseMockExamReturn {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tracks previously used original IDs so they aren’t repeated.
  const previouslyUsedQuestionIds = useRef<Set<number>>(new Set());

  const clearUsedQuestionIds = () => {
    previouslyUsedQuestionIds.current.clear();
  };

  const normalizeQuestion = (q: any, category: string) => ({
    // React list key
    question_id: uuidv4(),
  
    // Your numeric PK (used to filter out repeats in-session)
    original_id: q.id ?? q.question_id,
  
    // **The real UUID from your table** — this is what you should send
    // into your mock-exam upserts as `question_uuid`.
    global_id: q.global_id,
  
    // The rest of your payload
    question:    q.question,
    option_a:    q.option_a || q.option_A || '',
    option_b:    q.option_b || q.option_B || '',
    option_c:    q.option_c || q.option_C || '',
    option_d:    q.option_d || q.option_D || '',
    answer:      q.answer,
    explanation: q.explanation || 'No explanation provided.',
    category,
    tag:         q.tag,
  });
  

  const fetchQuestions = useCallback(
    async (category: string, append: boolean = false) => {
      try {
        setLoading(true);
        setError(null);

        let data: any[] = [];

        if (category === 'Language Proficiency') {
          // For Language Proficiency: fetch a total of 10 questions (5 English and 5 Filipino)
          const totalLangQuestions = 100;
          const englishCount = Math.ceil(totalLangQuestions / 2);
          const filipinoCount = totalLangQuestions - englishCount;

          const { data: englishData, error: englishError } = await supabase
            .from('question_bank_english_lang_prof')
            .select('*')
            .limit(englishCount);
          if (englishError) throw englishError;

          const { data: filipinoData, error: filipinoError } = await supabase
            .from('question_bank_filipino_lang_prof')
            .select('*')
            .limit(filipinoCount);
          if (filipinoError) throw filipinoError;

          data = [
            ...englishData.map((q) => ({
              ...normalizeQuestion(q, 'Language Proficiency'),
              question_id: uuidv4(),
              language: 'English', // NEW property for grouping
            })),
            ...filipinoData.map((q) => ({
              ...normalizeQuestion(q, 'Language Proficiency'),
              question_id: uuidv4(),
              language: 'Filipino', // NEW property for grouping
            })),
          ];
        } else if (category === 'Mathematics') {
          const { data: mathData, error: mathError } = await supabase
            .from('question_bank_math')
            .select('*')
            .limit(60);
          if (mathError) throw mathError;
          data = mathData.map((q) => ({
            ...normalizeQuestion(q, 'Mathematics'),
            question_id: uuidv4(),
          }));
        } else if (category === 'Science') {
          const { data: scienceData, error: scienceError } = await supabase
            .from('question_bank_science')
            .select('*')
            .limit(60);
          if (scienceError) throw scienceError;
          data = scienceData.map((q) => ({
            ...normalizeQuestion(q, 'Science'),
            question_id: uuidv4(),
          }));
        } else if (category === 'Reading Comprehension') {
          // For Reading Comprehension: fetch a total of 10 questions (5 English and 5 Filipino)
          const totalReadingQuestions = 100;
          const englishCount = Math.ceil(totalReadingQuestions / 2);
          const filipinoCount = totalReadingQuestions - englishCount;

          const { data: englishReadingData, error: englishReadingError } =
            await supabase
              .from('question_bank_english_reading_comp')
              .select('*')
              .limit(englishCount);
          if (englishReadingError) throw englishReadingError;

          const { data: filipinoReadingData, error: filipinoReadingError } =
            await supabase
              .from('question_bank_filipino_reading_comp')
              .select('*')
              .limit(filipinoCount);
          if (filipinoReadingError) throw filipinoReadingError;

          data = [
            ...englishReadingData.map((q) => ({
              ...normalizeQuestion(q, 'Reading Comprehension'),
              question_id: uuidv4(),
              language: 'English',
            })),
            ...filipinoReadingData.map((q) => ({
              ...normalizeQuestion(q, 'Reading Comprehension'),
              question_id: uuidv4(),
              language: 'Filipino',
            })),
          ];
        } else {
          throw new Error(`Unknown category: ${category}`);
        }

        if (!data || data.length === 0) {
          console.warn(`[fetchQuestions] No questions found for category: ${category}`);
          return [];
        }

        // Order the array so that English questions come first, then Filipino.
        const ordered = data.sort((a, b) => {
          if (a.language === b.language) return 0;
          return a.language === 'English' ? -1 : 1;
        });

        // Filter out questions already used.
        const freshQuestions = ordered.filter(q => !previouslyUsedQuestionIds.current.has(q.original_id));
        const finalQuestions =
          freshQuestions.length >= 5
            ? freshQuestions.slice(0, 5)
            : [
                ...freshQuestions,
                ...ordered.filter(q => !freshQuestions.includes(q)).slice(0, 5 - freshQuestions.length),
              ];
        finalQuestions.forEach(q => previouslyUsedQuestionIds.current.add(q.original_id));

        setQuestions(prev => (append ? [...prev, ...ordered] : ordered));
        return ordered;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setQuestions([]);
        return [];
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

  const clearError = () => setError(null);

    // ——— NEW: per‑category mock‑exam inserts ———
    const recordScienceMockExam = async (
      questionUuid: string,
      isCorrect: boolean,
      tag: string
    ) => {
      const userId = await getUserId();
      if (!userId) return;
    
      const { data, error } = await supabase
        .from('science_progress_report_mockexam')
        .upsert(
          [ { user_id: userId, question_uuid: questionUuid, correct_question: isCorrect ? 1 : 0, tags: tag } ],
          { onConflict: 'user_id,question_uuid' }
        )
        ;
    
      if (error) console.error('Science upsert failed:', error);
      else       console.log('Science upsert succeeded:', data);
    };
    
  
    // Math
    const recordMathMockExam = async (
      questionUuid: string,
      isCorrect: boolean,
      tag: string
    ) => {
      const userId = await getUserId();
      if (!userId) return;

      const { data, error } = await supabase
        .from('math_progress_report_mockexam')
        .upsert(
          [
            {
              user_id:          userId,
              question_uuid:    questionUuid,
              correct_question: isCorrect ? 1 : 0,
              tags:             tag
            }
          ],
          { onConflict: 'user_id,question_uuid' }
        );

      if (error) console.error('Math upsert failed:', error);
      else       console.log('Math upsert succeeded:', data);
    };

    // Language Proficiency
    const recordLangProfMockExam = async (
      questionUuid: string,
      isCorrect: boolean,
      tag: string
    ) => {
      const userId = await getUserId();
      if (!userId) return;

      const { data, error } = await supabase
        .from('lang_prof_progress_report_mockexam')
        .upsert(
          [
            {
              user_id:          userId,
              question_uuid:    questionUuid,
              correct_question: isCorrect ? 1 : 0,
              tags:             tag
            }
          ],
          { onConflict: 'user_id,question_uuid' }
        );

      if (error) console.error('LangProf upsert failed:', error);
      else       console.log('LangProf upsert succeeded:', data);
    };

    // Reading Comprehension
    const recordReadingCompMockExam = async (
      questionUuid: string,
      isCorrect: boolean,
      tag: string
    ) => {
      const userId = await getUserId();
      if (!userId) return;

      const { data, error } = await supabase
        .from('reading_comp_progress_report_mockexam')
        .upsert(
          [
            {
              user_id:          userId,
              question_uuid:    questionUuid,
              correct_question: isCorrect ? 1 : 0,
              tags:             tag
            }
          ],
          { onConflict: 'user_id,question_uuid' }
        );

      if (error) console.error('ReadingComp upsert failed:', error);
      else       console.log('ReadingComp upsert succeeded:', data);
    };

  

  return { questions, loading, error, fetchQuestions, updateUserStats, clearError, setQuestions, clearUsedQuestionIds, recordScienceMockExam, recordMathMockExam, recordLangProfMockExam, recordReadingCompMockExam};
}
