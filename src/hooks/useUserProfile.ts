import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

enum ProfileCols {
  id = 'id',
  created_at = 'created_at',
  user_id = 'user_id',
  user_username = 'user_username',
  user_fullname = 'user_fullname',
  user_year_level = 'user_year_level',
  user_school = 'user_school',
  user_bio = 'user_bio',
  user_location = 'user_location',
}

export interface UserProfile {
  id: number;
  created_at: string;
  user_id: string | null;
  user_username: string | null;
  user_fullname: string | null;
  user_year_level: string | null;
  user_school: string | null;
  user_bio: string | null;
  user_location: string | null;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (
    data: Partial<
      Pick<
        UserProfile,
        | 'user_username'
        | 'user_fullname'
        | 'user_year_level'
        | 'user_school'
        | 'user_bio'
        | 'user_location'
      >
    >
  ) => Promise<void>;
  createProfile: (
    data: Partial<
      Pick<
        UserProfile,
        | 'user_username'
        | 'user_fullname'
        | 'user_year_level'
        | 'user_school'
        | 'user_bio'
        | 'user_location'
      >
    >
  ) => Promise<void>;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('user_profile')
        .select(
          [
            ProfileCols.id,
            ProfileCols.created_at,
            ProfileCols.user_id,
            ProfileCols.user_username,
            ProfileCols.user_fullname,
            ProfileCols.user_year_level,
            ProfileCols.user_school,
            ProfileCols.user_bio,
            ProfileCols.user_location,
          ].join(', ')
        )
        .eq(ProfileCols.user_id, userId);

      if (fetchError) throw fetchError;

      // cast through unknown so TS knows you really mean UserProfile[]
      const rows = (data as unknown) as UserProfile[];

      if (rows.length === 0) {
        const { data: inserted, error: insertError } = await supabase
          .from('user_profile')
          .insert([
            {
              user_id: userId,
              user_username: user?.email || null,
              user_fullname: null,
              user_year_level: null,
              user_school: null,
              user_bio: null,
              user_location: null,
            },
          ])
          .single();

        if (insertError) throw insertError;
        setProfile((inserted as unknown) as UserProfile);
      } else {
        const chosen =
          rows.length > 1
            ? rows.sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )[0]
            : rows[0];
        setProfile(chosen);
      }
    } catch (err: any) {
      console.error('useUserProfile.fetchProfile:', err);
      setError(err.message || 'Could not fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (
    data: Partial<
      Pick<
        UserProfile,
        | 'user_username'
        | 'user_fullname'
        | 'user_year_level'
        | 'user_school'
        | 'user_bio'
        | 'user_location'
      >
    >
  ) => {
    if (!user?.id) {
      setError('Not authenticated');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data: updated, error: updateError } = await supabase
        .from('user_profile')
        .update({ ...data })
        .eq(ProfileCols.user_id, user.id)
        .single();

      if (updateError) throw updateError;
      setProfile((updated as unknown) as UserProfile);
    } catch (err: any) {
      console.error('useUserProfile.updateProfile:', err);
      setError(err.message || 'Could not update profile');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (
    data: Partial<
      Pick<
        UserProfile,
        | 'user_username'
        | 'user_fullname'
        | 'user_year_level'
        | 'user_school'
        | 'user_bio'
        | 'user_location'
      >
    >
  ) => {
    if (!user?.id) {
      setError('Not authenticated');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data: inserted, error: createError } = await supabase
        .from('user_profile')
        .insert([
          {
            user_id: user.id,
            user_username: user.email,
            ...data,
          },
        ])
        .single();

      if (createError) throw createError;
      setProfile((inserted as unknown) as UserProfile);
    } catch (err: any) {
      console.error('useUserProfile.createProfile:', err);
      setError(err.message || 'Could not create profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchProfile(user.id);
    else setProfile(null);
  }, [user?.id]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    createProfile,
  };
};
