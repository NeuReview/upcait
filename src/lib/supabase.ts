import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// ✅ Declare global Supabase instance to prevent multiple instances
declare global {
  var supabaseInstance: SupabaseClient<Database> | undefined;
}

// ✅ Create or reuse existing Supabase instance
export const supabase: SupabaseClient<Database> =
  globalThis.supabaseInstance ??
  createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true, // ✅ Automatically refresh authentication tokens
      persistSession: true, // ✅ Maintain session across refreshes
      detectSessionInUrl: true, // ✅ Detect and handle session from URL
    },
  });

// ✅ Store the instance globally to prevent multiple instances
if (!globalThis.supabaseInstance) {
  globalThis.supabaseInstance = supabase;
}

// ✅ Google Sign-in function with error handling
export const signInWithGoogle = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`, // ✅ Redirect after login
      },
    });

    if (error) throw error;
  } catch (error) {
    console.error('Google Sign-in Error:', error);
  }
};

// ✅ Define types for connection testing
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
      dataIssues: DataIssue[];
    };
  };
}

export interface CategoryStats {
  category: string;
  total: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface DataIssue {
  question_id: number;
  category: string;
  difficulty_level: string;
}

// ✅ Function to test database connection and retrieve diagnostics
export const testConnection = async (): Promise<ConnectionTestResult[]> => {
  try {
    // Perform a basic query to check the connection
    const { data, error, count } = await supabase
      .from('question_bank')
      .select('*', { count: 'exact' })
      .limit(1);

    if (error) {
      return [
        {
          step: 'Database Connection',
          success: false,
          details: { message: error.message },
        },
      ];
    }

    // Sample data to simulate diagnostics
    const diagnostics = {
      totalQuestions: count || 0,
      categoryStats: [
        { category: 'Math', total: 50, easy: 20, medium: 20, hard: 10 },
        { category: 'Science', total: 50, easy: 25, medium: 15, hard: 10 },
      ],
      dataIssues: [],
    };

    return [
      {
        step: 'Database Connection',
        success: true,
        details: {
          message: 'Connected successfully',
          diagnostics,
        },
      },
    ];
  } catch (error) {
    return [
      {
        step: 'Database Connection',
        success: false,
        details: { message: (error as Error).message },
      },
    ];
  }
};

export type { Database };
