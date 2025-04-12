import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Question } from '../types/quiz';

// Define types for localStorage records
interface ScienceProgressRecord {
  user_id: string;
  question_uuid: string;
  correct_question: number;
  timestamp: string;
}

// Simple frontend tracking for science progress
export const scienceProgressStore = {
  records: [] as Array<{
    userId: string;
    questionId: string;
    isCorrect: boolean;
    timestamp: string;
  }>,
  
  add(userId: string, questionId: string, isCorrect: boolean) {
    this.records.push({
      userId,
      questionId,
      isCorrect,
      timestamp: new Date().toISOString()
    });
    
    // Also save to localStorage for persistence
    this.saveToLocalStorage();
    
    console.log(`Added science progress record: User ${userId}, Question ${questionId}, Correct: ${isCorrect}`);
    console.log(`Total records: ${this.records.length}`);
    
    return true;
  },
  
  getRecords(userId: string) {
    return this.records.filter(record => record.userId === userId);
  },
  
  getStats(userId: string) {
    const userRecords = this.getRecords(userId);
    const totalQuestions = userRecords.length;
    const correctAnswers = userRecords.filter(r => r.isCorrect).length;
    
    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
    };
  },
  
  // Persist to localStorage
  saveToLocalStorage() {
    try {
      localStorage.setItem('scienceProgressStore', JSON.stringify(this.records));
    } catch (err) {
      console.error('Error saving science progress to localStorage:', err);
    }
  },
  
  // Load from localStorage
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('scienceProgressStore');
      if (stored) {
        this.records = JSON.parse(stored);
        console.log(`Loaded ${this.records.length} science progress records from localStorage`);
      }
    } catch (err) {
      console.error('Error loading science progress from localStorage:', err);
    }
  }
};

// Initialize by loading from localStorage
try {
  scienceProgressStore.loadFromLocalStorage();
} catch (e) {
  console.error('Failed to initialize scienceProgressStore:', e);
}

// Define types for localStorage records
interface MathProgressRecord {
  user_id: string;  // UUID string
  question_uuid: string;  // UUID string
  correct_question: number;
  timestamp: string;
}

// Simple frontend tracking for math progress
export const mathProgressStore = {
  records: [] as Array<{
    userId: string;  // UUID string
    questionId: string;  // UUID string
    isCorrect: boolean;
    timestamp: string;
  }>,
  
  add(userId: string, questionId: string, isCorrect: boolean) {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId) || !uuidRegex.test(questionId)) {
      console.error('Invalid UUID format:', { userId, questionId });
      return false;
    }

    this.records.push({
      userId,
      questionId,
      isCorrect,
      timestamp: new Date().toISOString()
    });
    
    // Also save to localStorage for persistence
    this.saveToLocalStorage();
    
    console.log(`Added math progress record: User ${userId}, Question ${questionId}, Correct: ${isCorrect}`);
    console.log(`Total records: ${this.records.length}`);
    
    return true;
  },
  
  getRecords(userId: string) {
    return this.records.filter(record => record.userId === userId);
  },
  
  getStats(userId: string) {
    const userRecords = this.getRecords(userId);
    const totalQuestions = userRecords.length;
    const correctAnswers = userRecords.filter(r => r.isCorrect).length;
    
    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
    };
  },
  
  // Persist to localStorage
  saveToLocalStorage() {
    try {
      localStorage.setItem('mathProgressStore', JSON.stringify(this.records));
    } catch (err) {
      console.error('Error saving math progress to localStorage:', err);
    }
  },
  
  // Load from localStorage
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('mathProgressStore');
      if (stored) {
        this.records = JSON.parse(stored);
        console.log(`Loaded ${this.records.length} math progress records from localStorage`);
      }
    } catch (err) {
      console.error('Error loading math progress from localStorage:', err);
    }
  }
};

// Initialize by loading from localStorage
try {
  mathProgressStore.loadFromLocalStorage();
} catch (e) {
  console.error('Failed to initialize mathProgressStore:', e);
}

// Add interface for Math question data
interface MathQuestionData {
  question_id: number;
  difficulty: string;
  question: string;
  option_A: string;
  option_B: string;
  option_C: string;
  option_D: string;
  answer: string;
  explanation: string;
  tag: string;
  global_id: string;
}

// Add interface for other subjects' question data
interface OtherQuestionData {
  question_id: number;
  difficulty: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: string;
  explanation: string;
  tag: string;
  global_id: string;
}

interface UseQuestionsReturn {
  questions: Question[];
  loading: boolean;
  error: string | null;
  fetchQuestions: (category: string, difficulty: string) => Promise<void>;
  updateUserStats: (correctAnswers: number, totalAnswers: number) => Promise<void>;
  recordScienceProgress: (questionUuid: string, isCorrect: boolean) => Promise<void>;
  recordMathProgress: (questionUuid: string, isCorrect: boolean) => Promise<void>;
  getScienceProgressStats: (userId: string) => { totalQuestions: number; correctAnswers: number; incorrectAnswers: number; accuracy: number };
  getMathProgressStats: (userId: string) => { totalQuestions: number; correctAnswers: number; incorrectAnswers: number; accuracy: number };
}

export function useQuestions(): UseQuestionsReturn {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async (category: string, difficulty: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching questions with params:', { category, difficulty });

      // First, check if we can connect to Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session - please log in');
      }

      // Map categories to their respective tables
      const tableMap: Record<string, string> = {
        'Science': 'question_bank_science',
        'Mathematics': 'question_bank_math',
        'Language Proficiency': 'question_bank_language',
        'Reading Comprehension': 'question_bank_reading'
      };

      const tableName = tableMap[category];
      if (!tableName) {
        throw new Error(`Unsupported category: ${category}`);
      }

      console.log('Using table:', tableName);

      // Build the query step by step with correct column names
      const query = supabase
        .from(tableName)
        .select(`
          question_id,
          difficulty,
          question,
          ${category === 'Mathematics' ? '"option_A", "option_B", "option_C", "option_D"' : 'option_a, option_b, option_c, option_d'},
          answer,
          explanation,
          tag,
          global_id
        `)
        .eq('difficulty', difficulty)
        .limit(20);

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw supabaseError;
      }

      if (!data || data.length === 0) {
        console.log('No data returned from query:', { category, difficulty });
        throw new Error(`No questions found for ${category} at ${difficulty} level. Please try a different combination.`);
      }

      console.log('Raw fetched data:', data);

      // Transform the data to match our Question interface
      const transformedQuestions = data.map(q => {
        if (category === 'Mathematics') {
          const mathQ = q as MathQuestionData;
          return {
            question_id: mathQ.question_id,
            global_id: mathQ.global_id,
            category: category,
            difficulty_level: mathQ.difficulty,
            question: mathQ.question || '',
            options: [mathQ.option_A, mathQ.option_B, mathQ.option_C, mathQ.option_D].filter(Boolean),
            option_a: mathQ.option_A || '',
            option_b: mathQ.option_B || '',
            option_c: mathQ.option_C || '',
            option_d: mathQ.option_D || '',
            answer: mathQ.answer || '',
            explanation: mathQ.explanation || ''
          };
        } else {
          const otherQ = q as OtherQuestionData;
          return {
            question_id: otherQ.question_id,
            global_id: otherQ.global_id,
            category: category,
            difficulty_level: otherQ.difficulty,
            question: otherQ.question || '',
            options: [otherQ.option_a, otherQ.option_b, otherQ.option_c, otherQ.option_d].filter(Boolean),
            option_a: otherQ.option_a || '',
            option_b: otherQ.option_b || '',
            option_c: otherQ.option_c || '',
            option_d: otherQ.option_d || '',
            answer: otherQ.answer || '',
            explanation: otherQ.explanation || ''
          };
        }
      });

      console.log('Transformed questions:', transformedQuestions);

      if (transformedQuestions.length === 0) {
        throw new Error('No questions available after transformation');
      }

      // Log global_ids for debugging
      console.log('Question global_ids:', transformedQuestions.map(q => q.global_id));

      // Shuffle questions
      const shuffledQuestions = [...transformedQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffledQuestions);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error in fetchQuestions:', err);
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

  const recordScienceProgress = async (questionUuid: string, isCorrect: boolean) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        console.log("No logged in user found - cannot record science progress");
        return;
      }

      const userId = user.data.user.id;
      
      // Validate that we have a valid UUID
      if (!questionUuid) {
        console.error('No global_id provided for the question');
        return;
      }

      console.log(`Recording science progress for user ${userId}, question global_id ${questionUuid}, correct: ${isCorrect}`);
      
      // Add the record to our local store first
      scienceProgressStore.add(userId, questionUuid, isCorrect);
      
      // Then attempt to save to the database
      try {
        console.log('Attempting to insert to science_progress_report table with global_id');
        
        const { data, error } = await supabase
          .from('science_progress_report')
          .insert({
            user_id: userId,
            question_uuid: questionUuid, // This should now be the global_id from the question
            correct_question: isCorrect ? 1 : 0
          })
          .select();
        
        if (error) {
          console.error('Error inserting to science_progress_report:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          
          if (error.code === '42501' || error.message.includes('permission denied') || error.message.includes('403')) {
            console.warn('Permission issue detected. This is likely an RLS policy that needs to be updated in Supabase.');
            console.log('Saved to localStorage as fallback due to permission issue');
          }
        } else {
          console.log('Successfully recorded to database with global_id!', data);
        }
      } catch (dbErr) {
        console.error('Exception in database operation:', dbErr);
      }
    } catch (err) {
      console.error('Failed to record science progress:', err);
    }
  };
  
  const recordMathProgress = async (questionUuid: string, isCorrect: boolean) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        console.log("No logged in user found - cannot record math progress");
        return;
      }

      const userId = user.data.user.id;
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(questionUuid)) {
        console.error('Invalid question UUID format:', questionUuid);
        return;
      }

      if (!uuidRegex.test(userId)) {
        console.error('Invalid user UUID format:', userId);
        return;
      }

      console.log(`Recording math progress for user ${userId}, question global_id ${questionUuid}, correct: ${isCorrect}`);
      
      // Add the record to our local store first
      mathProgressStore.add(userId, questionUuid, isCorrect);
      
      // Then attempt to save to the database
      try {
        console.log('Attempting to insert to math_progress_report table with global_id');
        
        const { data, error } = await supabase
          .from('math_progress_report')
          .insert({
            user_id: userId,
            question_uuid: questionUuid,
            correct_question: isCorrect ? 1 : 0
          })
          .select();
        
        if (error) {
          console.error('Error inserting to math_progress_report:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          
          if (error.code === '42501' || error.message.includes('permission denied') || error.message.includes('403')) {
            console.warn('Permission issue detected. This is likely an RLS policy that needs to be updated in Supabase.');
            console.log('Saved to localStorage as fallback due to permission issue');
          }
        } else {
          console.log('Successfully recorded to database with global_id!', data);
        }
      } catch (dbErr) {
        console.error('Exception in database operation:', dbErr);
      }
    } catch (err) {
      console.error('Failed to record math progress:', err);
    }
  };
  
  // Function to get science progress stats
  const getScienceProgressStats = (userId: string) => {
    // Just use the scienceProgressStore for now
    return scienceProgressStore.getStats(userId);
  };

  // Function to get math progress stats
  const getMathProgressStats = (userId: string) => {
    return mathProgressStore.getStats(userId);
  };

  return { 
    questions, 
    loading, 
    error, 
    fetchQuestions, 
    updateUserStats, 
    recordScienceProgress,
    recordMathProgress,
    getScienceProgressStats,
    getMathProgressStats
  };
}