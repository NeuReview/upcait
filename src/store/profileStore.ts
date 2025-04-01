import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Profile {
  id: number;
  created_at: string;
  user_id: string;
  user_fullname: string | null;
  user_year_level: string | null;
  user_school: string | null;
}

interface ProfileStore {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, data: Partial<Profile>) => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      set({ profile: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateProfile: async (userId: string, profileData: Partial<Profile>) => {
    try {
      set({ loading: true, error: null });

      const { data: existingProfile } = await supabase
        .from('user_profile')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      const { data, error } = await supabase
        .from('user_profile')
        .upsert({
          ...(existingProfile?.id ? { id: existingProfile.id } : {}),
          user_id: userId,
          user_fullname: profileData.user_fullname,
          user_year_level: profileData.user_year_level,
          user_school: profileData.user_school,
        })
        .select()
        .single();

      if (error) throw error;

      set({ profile: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));