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

export type { Database };
