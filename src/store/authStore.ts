import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, signInWithGoogle } from '../lib/supabase';
import { User, AuthError } from '@supabase/supabase-js';
import { validatePassword } from '../utils/passwordValidation';

interface AuthState {
  user: User | null;
  loading: boolean;
  otpPending: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setOtpPending: (pending: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      otpPending: false,

      // ✅ Authenticate User with Email & Password
      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true });

          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;

          // ✅ Store OTP pending state ONLY for email/password users
          set({ user: data.user, otpPending: true });
          localStorage.setItem('otp-email', email);
        } catch (error) {
          throw new Error((error as AuthError).message);
        } finally {
          set({ loading: false });
        }
      },

      // ✅ Send OTP after successful login
      sendOtp: async (email: string) => {
        try {
          set({ loading: true });

          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: false }, // ✅ Ensure only existing users receive OTP
          });

          if (error) throw error;
        } catch (error) {
          throw new Error((error as AuthError).message);
        } finally {
          set({ loading: false });
        }
      },

      /// authStore.ts (partial update)
        verifyOtp: async (email: string, token: string) => {
          try {
            set({ loading: true });

            const { data, error } = await supabase.auth.verifyOtp({
              email,
              token,
              type: 'email',
            });

            if (error) throw error;

            // ✅ Remove `otpPending: false` here
            set({ user: data.user });
            localStorage.removeItem('otp-email');
          } catch (error) {
            throw new Error((error as AuthError).message);
          } finally {
            set({ loading: false });
          }
        },

      // ✅ Reset Password
      resetPassword: async (email: string) => {
        try {
          set({ loading: true });

          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`, // Redirect user to reset page
          });

          if (error) throw error;
        } catch (error) {
          throw new Error((error as AuthError).message);
        } finally {
          set({ loading: false });
        }
      },

      // ✅ Register a new user
      signUp: async (email: string, password: string) => {
        try {
          const validation = validatePassword(password);
          if (!validation.isValid) throw new Error(validation.errors[0]);

          set({ loading: true });

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/reset-password` },
          });

          if (error) throw error;

          set({ user: data.user, otpPending: true }); // ✅ Set OTP required after registration
          localStorage.setItem('otp-email', email);
        } catch (error) {
          throw new Error((error as AuthError).message);
        } finally {
          set({ loading: false });
        }
      },

      // ✅ Google Sign-In (No OTP Required)
      googleSignIn: async () => {
        try {
          set({ loading: true });

          await signInWithGoogle();

          // ✅ Fetch user after successful Google sign-in
          const { data } = await supabase.auth.getUser();
          set({ user: data?.user || null, otpPending: false });

          // ✅ Ensure no OTP is required for Google users
          localStorage.removeItem('otp-email');
        } catch (error) {
          throw new Error((error as AuthError).message);
        } finally {
          set({ loading: false });
        }
      },

      // ✅ Sign out user
      signOut: async () => {
        try {
          set({ loading: true });
      
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
      
          set({ user: null, otpPending: false });
          localStorage.removeItem('otp-email');
      
          // ✅ Redirect to login page after logout
          window.location.href = '/login';
        } catch (error) {
          throw new Error((error as AuthError).message);
        } finally {
          set({ loading: false });
        }
      },

      // ✅ Fetch authenticated user session
      fetchUser: async () => {
        try {
          set({ loading: true });

          const { data: session } = await supabase.auth.getSession();
          set({
            user: session?.session?.user || null,
            otpPending: localStorage.getItem('otp-email') !== null, // ✅ Set OTP status if email exists
          });
        } catch (error) {
          console.error('Error fetching user session:', error);
        } finally {
          set({ loading: false });
        }
      },

      // ✅ Set OTP Pending Status (Required in LoginPage.tsx)
      setOtpPending: (pending: boolean) => set({ otpPending: pending }),
    }),
    { name: 'auth-storage' }
  )
);
