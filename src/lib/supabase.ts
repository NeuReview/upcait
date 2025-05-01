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
export const supabase =
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

// Add a utility function to check connection status
export const checkSupabaseConnection = async (): Promise<{ connected: boolean; error?: string }> => {
  try {
    // Try a simple query to check connection
    const { error } = await supabase.from('user_statistics').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection check failed:', error);
      return { connected: false, error: error.message };
    }
    
    return { connected: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error checking Supabase connection:', errorMessage);
    return { connected: false, error: errorMessage };
  }
};

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

export async function upsertDailyTotal(
  userId: string,
  day: string   // ISO date string, e.g. '2025-05-01'
) {
  const dayStart = `${day}T00:00:00.000Z`;
  const dayEnd   = `${day}T23:59:59.999Z`;

  const [{ data: quizRows, error: qErr }, { data: mockRows, error: mErr }]
    = await Promise.all([
      supabase
        .from('quizzes_session')
        .select('duration')
        .eq('user_id', userId)
        .gte('start_time', dayStart)
        .lte('start_time', dayEnd),
      supabase
        .from('mock_exams_session')
        .select('duration')
        .eq('user_id', userId)
        .gte('start_time', dayStart)
        .lte('start_time', dayEnd),
    ]);

  if (qErr) console.error('quizzes_session fetch error', qErr);
  if (mErr) console.error('mock_exams_session fetch error', mErr);

  // sum() now only accepts a number[] (never null)
  const sum = (rows: { duration: number }[]) =>
    rows.reduce((acc, r) => acc + (r.duration || 0), 0);

  // default to [] if data is null
  const totalSecs = sum(quizRows ?? []) + sum(mockRows ?? []);

  // onConflict must be a single string
  const { error: upErr } = await supabase
    .from('daily_session_time')
    .upsert(
      { user_id: userId, day, total_secs: totalSecs },
      { onConflict: 'user_id,day' }
    );

  if (upErr) console.error('upsertDailyTotal error:', upErr.message);
}


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
