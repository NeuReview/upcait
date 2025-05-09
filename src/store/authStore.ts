// store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { User, AuthError } from '@supabase/supabase-js'
import { validatePassword } from '../utils/passwordValidation'

interface AuthState {
  user: User | null
  loading: boolean
  otpPending: boolean
  acceptedTOS: boolean | null

  signIn: (email: string, password: string) => Promise<void>
  sendOtp: (email: string) => Promise<void>
  verifyOtp: (email: string, token: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  googleSignIn: () => Promise<void>
  signOut: () => Promise<void>
  fetchUser: () => Promise<void>
  fetchTOS: () => Promise<void>
  markTOSAccepted: () => Promise<void>
  setOtpPending: (pending: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      otpPending: false,
      acceptedTOS: null,

      // ─── Email/Password Sign-In ────────────────────────────────
      signIn: async (email, password) => {
        try {
          set({ loading: true })
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) throw error
          set({ user: data.user, otpPending: true })
          localStorage.setItem('otp-email', email)
        } catch (err) {
          throw new Error((err as AuthError).message)
        } finally {
          set({ loading: false })
        }
      },

      // ─── OTP Flows ───────────────────────────────────────────────
      sendOtp: async (email) => {
        try {
          set({ loading: true })
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: false },
          })
          if (error) throw error
        } catch (err) {
          throw new Error((err as AuthError).message)
        } finally {
          set({ loading: false })
        }
      },

      verifyOtp: async (email, token) => {
        try {
          set({ loading: true })
          const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email',
          })
          if (error) throw error
          set({ user: data.user })
          localStorage.removeItem('otp-email')
        } catch (err) {
          throw new Error((err as AuthError).message)
        } finally {
          set({ loading: false })
        }
      },

      // ─── New User Sign-Up ────────────────────────────────────────
      signUp: async (email, password) => {
        const validation = validatePassword(password)
        if (!validation.isValid) throw new Error(validation.errors[0])

        try {
          set({ loading: true })
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/confirm`,
            },
          })
          if (error) throw error

          // ─── Option 2: Initialize profile row with accept_tos = false
          await supabase
            .from('user_profile')
            .upsert({ user_id: data.user!.id, accept_tos: false })

          set({ user: data.user, otpPending: true })
          localStorage.setItem('otp-email', email)
        } catch (err) {
          throw new Error((err as AuthError).message)
        } finally {
          set({ loading: false })
        }
      },

      // ─── Password Reset ──────────────────────────────────────────
      resetPassword: async (email) => {
        try {
          set({ loading: true })
          const { error } = await supabase.auth.resetPasswordForEmail(
            email,
            { redirectTo: `${window.location.origin}/reset-password` }
          )
          if (error) throw error
        } catch (err) {
          throw new Error((err as AuthError).message)
        } finally {
          set({ loading: false })
        }
      },

      // ─── Google OAuth ────────────────────────────────────────────
      googleSignIn: async () => {
        try {
          set({ loading: true })
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/dashboard`,
            },
          })
          if (error) throw error
        } catch (err) {
          throw new Error((err as AuthError).message)
        } finally {
          set({ loading: false })
        }
      },

      // ─── Sign-Out ────────────────────────────────────────────────
      signOut: async () => {
        try {
          set({ loading: true })
          const { error } = await supabase.auth.signOut()
          if (error) throw error
          set({ user: null, otpPending: false, acceptedTOS: null })
          localStorage.removeItem('otp-email')
          window.location.href = '/login'
        } catch (err) {
          throw new Error((err as AuthError).message)
        } finally {
          set({ loading: false })
        }
      },

      // ─── Session & ToS Management ───────────────────────────────
      fetchUser: async () => {
        try {
          set({ loading: true })
          const { data: session } = await supabase.auth.getSession()
          set({
            user: session?.session?.user || null,
            otpPending: localStorage.getItem('otp-email') !== null,
          })
        } finally {
          set({ loading: false })
        }
      },

      fetchTOS: async () => {
        const user = get().user

        // anonymous or logged-out → skip TOS
        if (!user) {
          set({ acceptedTOS: true })
          return
        }

        const { data, error } = await supabase
          .from('user_profile')
          .select('accept_tos')
          .eq('user_id', user.id)
          .single()

        if (error) {
          // row-not-found → force TOS
          if ((error as any).code === 'PGRST116') {
            set({ acceptedTOS: false })
          } else {
            console.error('Error loading ToS flag:', error)
            // unexpected DB error → let them through
            set({ acceptedTOS: true })
          }
        } else {
          set({ acceptedTOS: !!data.accept_tos })
        }
      },

      markTOSAccepted: async () => {
        const user = get().user
        if (!user) return
        set({ acceptedTOS: true }) // optimistic UI
        await supabase
          .from('user_profile')
          .upsert({ user_id: user.id, accept_tos: true }, { onConflict: 'user_id' })
      },

      setOtpPending: (pending) => set({ otpPending: pending }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        otpPending: state.otpPending,
      }),
    }
  )
)
