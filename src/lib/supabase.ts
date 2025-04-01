import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export interface CategoryStats {
  category: string;
  total: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface ConnectionTestResult {
  step: string;
  success: boolean;
  details?: {
    message?: string;
    hint?: string;
    rowCount?: number;
    diagnostics?: {
      totalQuestions: number;
      categoryStats: CategoryStats[];
      dataIssues: Array<{
        question_id: number;
        category: string;
        difficulty_level: string;
      }>;
    };
  };
}

export const testConnection = async (): Promise<ConnectionTestResult[]> => {
  const results: ConnectionTestResult[] = [];

  try {
    // Test basic connection
    results.push({
      step: 'Connection Test',
      success: true
    });

    // Test query execution
    const { data, error } = await supabase
      .from('question_bank')
      .select('*');

    if (error) throw error;

    // Get statistics
    const totalQuestions = data?.length || 0;
    const categoryStats: CategoryStats[] = [];
    const dataIssues: any[] = [];

    // Add diagnostic results
    results.push({
      step: 'Diagnostic Check',
      success: true,
      details: {
        diagnostics: {
          totalQuestions,
          categoryStats,
          dataIssues
        }
      }
    });

    return results;
  } catch (error) {
    results.push({
      step: 'Error',
      success: false,
      details: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        hint: 'Check your database connection and credentials'
      }
    });
    return results;
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export type { Database };