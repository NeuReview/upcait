import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, data: Partial<Profile>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      set({ profile: data });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (userId: string, profileData: Partial<Profile>) => {
    try {
      set({ loading: true, error: null });

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        set({ profile: data });
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('profiles')
          .insert([{ user_id: userId, ...profileData }])
          .select()
          .single();

        if (error) throw error;
        set({ profile: data });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  }
}));