import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export interface UserProfile {
  id: number;
  created_at: string;
  user_fullname: string | null;
  user_year_level: string | null;
  user_school: string | null;
  user_id: string | null;
  user_username: string | null;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  createProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching profile for user:', userId);
      
      const { data, error: supabaseError } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (supabaseError) {
        console.error('Error fetching profile:', supabaseError);
        throw supabaseError;
      }
      
      console.log('Profile data received:', data);
      setProfile(data);
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Updating profile for user:', user.id, 'with data:', data);
      
      const { data: updatedData, error: supabaseError } = await supabase
        .from('user_profile')
        .update({
          ...data,
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (supabaseError) {
        console.error('Error updating profile:', supabaseError);
        throw supabaseError;
      }
      
      console.log('Profile updated:', updatedData);
      setProfile(updatedData);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (data: Partial<UserProfile>) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Creating profile for user:', user.id, 'with data:', data);
      
      const { data: newData, error: supabaseError } = await supabase
        .from('user_profile')
        .insert([
          {
            user_id: user.id,
            user_username: user.email,
            ...data,
          },
        ])
        .select()
        .single();
      
      if (supabaseError) {
        console.error('Error creating profile:', supabaseError);
        throw supabaseError;
      }
      
      console.log('Profile created:', newData);
      setProfile(newData);
    } catch (err: any) {
      console.error('Failed to create profile:', err);
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch profile when user changes
  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
    }
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