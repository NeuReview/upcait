import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { User, AuthError } from '@supabase/supabase-js';
import { validatePassword } from '../utils/passwordValidation';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true });
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;
          set({ user: data.user });
        } catch (error) {
          const authError = error as AuthError;
          throw new Error(authError.message);
        } finally {
          set({ loading: false });
        }
      },
      signUp: async (email: string, password: string) => {
        try {
          // Validate password
          const validation = validatePassword(password);
          if (!validation.isValid) {
            throw new Error(validation.errors[0]);
          }

          set({ loading: true });
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/reset-password`
            }
          });

          if (error) throw error;
          set({ user: data.user });
        } catch (error) {
          const authError = error as AuthError;
          throw new Error(authError.message);
        } finally {
          set({ loading: false });
        }
      },
      signOut: async () => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({ user: null });
        } catch (error) {
          const authError = error as AuthError;
          throw new Error(authError.message);
        } finally {
          set({ loading: false });
        }
      },
      resetPassword: async (email: string) => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
          });
          if (error) throw error;
        } catch (error) {
          const authError = error as AuthError;
          throw new Error(authError.message);
        } finally {
          set({ loading: false });
        }
      },
      checkEmailExists: async (email: string) => {
        try {
          // Try to send a password reset email - if the email doesn't exist,
          // Supabase will return an error
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
          });
          
          // If there's no error, the email exists
          return !error;
        } catch (error) {
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);