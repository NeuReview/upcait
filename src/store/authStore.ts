// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { User, AuthError } from '@supabase/supabase-js';
import { validatePassword } from '../utils/passwordValidation';

interface AuthState {
  user: User | null;
  loading: boolean;
  otpPending: boolean;
  acceptedTOS: boolean | null;

  signIn: (email: string, password: string) => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
  fetchTOS: () => Promise<void>;
  markTOSAccepted: () => Promise<void>;
  setOtpPending: (pending: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      otpPending: false,
      acceptedTOS: null,

      /* ─────────────────────────  EMAIL / PASSWORD SIGN‑IN  ───────────────────────── */
      signIn: async (email, password) => {
        try {
          set({ loading: true });
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;

          set({ user: data.user, otpPending: true });
          localStorage.setItem('otp-email', email);
        } catch (err) {
          throw new Error((err as AuthError).message);
        } finally {
          set({ loading: false });
        }
      },

      /* ────────────────────────────────  OTP FLOWS  ──────────────────────────────── */
      sendOtp: async (email) => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: false },
          });
          if (error) throw error;
        } catch (err) {
          throw new Error((err as AuthError).message);
        } finally {
          set({ loading: false });
        }
      },

      verifyOtp: async (email, token) => {
        try {
          set({ loading: true });
          const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email',
          });
          if (error) throw error;

          set({ user: data.user, otpPending: false });
          localStorage.removeItem('otp-email');
        } catch (err) {
          throw new Error((err as AuthError).message);
        } finally {
          set({ loading: false });
        }
      },

      /* ───────────────────────  NEW‑USER SIGN‑UP (PKCE FLOW)  ─────────────────────── */
      // ─── New‑user sign‑up (PKCE e‑mail confirmation) ───────────
signUp: async (email, password) => {
  /* 1. Client‑side password strength check */
  const validation = validatePassword(password);
  if (!validation.isValid) throw new Error(validation.errors[0]);

  try {
    set({ loading: true });

    /* 2. Create auth user + send verification link */
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/confirm` },
    });

    /* 3. Duplicate‑e‑mail guard
          – “User already registered”  => confirmed address
          – 400 “already been registered” => pending confirmation          */
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('already registered') || error.status === 400) {
        throw new Error(
          msg.includes('already') && !msg.includes('new')
            ? 'That e‑mail is already registered. Please sign in instead.'
            : 'This e‑mail has a pending registration. Check your inbox for the verification link or click “Resend link.”',
        );
      }
      throw error; // unexpected error – bubble up
    }

    /* 4. Initialise user_profile row (email copy + ToS flag) */
    await supabase
      .from('user_profile')
      .upsert(
        { user_id: data.user!.id, email, accept_tos: false },
        { onConflict: 'user_id' },
      );

    /* 5. Local state / UX */
    set({ user: null, otpPending: false });        // wait for confirmation
    localStorage.setItem('otp-email', email);      // shows “check inbox”
  } catch (err) {
    throw new Error(
      err instanceof Error
        ? err.message
        : 'Sign‑up failed, please try again later.',
    );
  } finally {
    set({ loading: false });
  }
},

      /* ─────────────────────────────  PASSWORD RESET  ────────────────────────────── */
      resetPassword: async (email) => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          if (error) throw error;
        } catch (err) {
          throw new Error((err as AuthError).message);
        } finally {
          set({ loading: false });
        }
      },

      /* ───────────────────────────────  GOOGLE OAUTH  ────────────────────────────── */
      googleSignIn: async () => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/dashboard` },
          });
          if (error) throw error;
        } catch (err) {
          throw new Error((err as AuthError).message);
        } finally {
          set({ loading: false });
        }
      },

      /* ─────────────────────────────────  SIGN‑OUT  ──────────────────────────────── */
      signOut: async () => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          set({ user: null, otpPending: false, acceptedTOS: null });
          localStorage.removeItem('verify-email');
          window.location.href = '/login';
        } catch (err) {
          throw new Error((err as AuthError).message);
        } finally {
          set({ loading: false });
        }
      },

      /* ─────────────────────────────  SESSION HELPERS  ───────────────────────────── */
      fetchUser: async () => {
        try {
          set({ loading: true });
          const { data: session } = await supabase.auth.getSession();

          const isOtpPending =
            localStorage.getItem('otp-email') !== null &&
            !(session?.session?.user?.email_confirmed_at);

          set({
            user: session?.session?.user || null,
            otpPending: isOtpPending,
          });
        } finally {
          set({ loading: false });
        }
      },

      fetchTOS: async () => {
        const user = get().user;
        if (!user) {
          set({ acceptedTOS: true });
          return;
        }

        const { data, error } = await supabase
          .from('user_profile')
          .select('accept_tos')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if ((error as any).code === 'PGRST116') {
            set({ acceptedTOS: false });
          } else {
            console.error('Error loading ToS flag:', error);
            set({ acceptedTOS: true });
          }
        } else {
          set({ acceptedTOS: !!data.accept_tos });
        }
      },

      markTOSAccepted: async () => {
        const user = get().user;
        if (!user) return;

        set({ acceptedTOS: true }); // optimistic
        await supabase
          .from('user_profile')
          .upsert({ user_id: user.id, accept_tos: true }, { onConflict: 'user_id' });
      },

      setOtpPending: (pending) => set({ otpPending: pending }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        otpPending: state.otpPending,
      }),
    },
  ),
);
