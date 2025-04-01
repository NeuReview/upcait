import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface SkillData {
  subject: string;
  [key: string]: any; // For multiple people's scores
}

interface SkillsStore {
  skillsData: SkillData[];
  loading: boolean;
  error: string | null;
  fetchSkillsData: () => Promise<void>;
}

// Default professional skills data
const defaultSkillsData: SkillData[] = [
  { 
    subject: 'Math', 
    'Student': 70, 
    'Class Average': 65, 
    'Target': 85 
  },
  { 
    subject: 'Science', 
    'Student': 75, 
    'Class Average': 60, 
    'Target': 80 
  },
  { 
    subject: 'Reading Comprehension', 
    'Student': 85, 
    'Class Average': 70, 
    'Target': 90 
  },
  { 
    subject: 'Language Proficiency', 
    'Student': 80, 
    'Class Average': 75, 
    'Target': 85 
  }
];

export const useSkillsStore = create<SkillsStore>((set) => ({
  skillsData: [],
  loading: false,
  error: null,

  fetchSkillsData: async () => {
    try {
      set({ loading: true, error: null });
      
      // In a real application, this would fetch from Supabase
      // For demonstration, we'll use the default data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set({ 
        skillsData: defaultSkillsData, 
        loading: false 
      });
    } catch (error: any) {
      console.error("Error fetching skills data:", error);
      set({ 
        error: error.message, 
        loading: false,
        skillsData: defaultSkillsData
      });
    }
  },
})); 