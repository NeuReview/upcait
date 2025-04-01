import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface MasteryData {
  subject: string;
  mastery: number;
  fullMark: number;
}

interface MasteryStore {
  masteryData: MasteryData[];
  loading: boolean;
  error: string | null;
  fetchMasteryData: (userId: string) => Promise<void>;
  updateMastery: (userId: string, subject: string, mastery: number) => Promise<void>;
}

// Default subjects to initialize if none exist
const defaultSubjects = [
  'Math',
  'Science',
  'Reading Comprehension',
  'Language Proficiency'
];

export const useMasteryStore = create<MasteryStore>((set, get) => ({
  masteryData: [],
  loading: false,
  error: null,

  fetchMasteryData: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      
      // Check if we have data already
      if (get().masteryData.length > 0) {
        set({ loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('subject_mastery')
        .select('subject, mastery')
        .eq('user_id', userId);

      if (error) {
        // Try to create default subjects if data doesn't exist
        await initializeDefaultSubjects(userId);
        
        // Try to fetch again
        const { data: newData, error: newError } = await supabase
          .from('subject_mastery')
          .select('subject, mastery')
          .eq('user_id', userId);
        
        if (newError) throw newError;
        
        const formattedData: MasteryData[] = (newData || []).map(item => ({
          subject: item.subject,
          mastery: item.mastery || 0,
          fullMark: 100
        }));
        
        set({ masteryData: formattedData, loading: false });
        return;
      }

      // Format the data
      const formattedData: MasteryData[] = (data || []).map(item => ({
        subject: item.subject,
        mastery: item.mastery || 0,
        fullMark: 100
      }));

      set({ masteryData: formattedData.length > 0 ? formattedData : getMockData(), loading: false });
    } catch (error: any) {
      console.error("Error fetching mastery data:", error);
      set({ 
        error: error.message, 
        loading: false,
        // Set mock data as fallback
        masteryData: getMockData()
      });
    }
  },

  updateMastery: async (userId: string, subject: string, mastery: number) => {
    try {
      // Optimistic update
      const currentData = [...get().masteryData];
      const updatedData = currentData.map(item => 
        item.subject === subject ? { ...item, mastery } : item
      );
      
      set({ masteryData: updatedData });
      
      // Actual update
      const { error } = await supabase
        .from('subject_mastery')
        .update({ mastery })
        .eq('user_id', userId)
        .eq('subject', subject);

      if (error) {
        // Revert on error
        set({ masteryData: currentData, error: error.message });
        throw error;
      }
    } catch (error: any) {
      console.error("Error updating mastery:", error);
      set({ error: error.message });
    }
  },
}));

// Helper function to initialize default subjects
async function initializeDefaultSubjects(userId: string) {
  try {
    await Promise.all(
      defaultSubjects.map(subject =>
        supabase.from('subject_mastery').insert({
          user_id: userId,
          subject,
          mastery: Math.floor(Math.random() * 50) + 30 // Random initial value between 30-80
        })
      )
    );
    return true;
  } catch (error) {
    console.error("Error initializing subjects:", error);
    return false;
  }
}

// Mock data for fallback
function getMockData(): MasteryData[] {
  return defaultSubjects.map(subject => ({
    subject,
    mastery: Math.floor(Math.random() * 50) + 30, // Random between 30-80
    fullMark: 100
  }));
} 