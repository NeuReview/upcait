import { supabase } from './supabase';

// Define types for progress records
interface ScienceProgressRecord {
  userId: string;
  questionId: string;
  isCorrect: boolean;
  timestamp: string;
}

interface ProgressStats {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
}

// Science progress service na may fallback sa localStorage
export const scienceProgressService = {
  // Track science progress sa local storage at Supabase kung available
  async recordProgress(userId: string, questionId: string, isCorrect: boolean) {
    try {
      // Always record to local storage first
      this.addToLocalStorage(userId, questionId, isCorrect);
      
      // Attempt to save to Supabase (but don't rely on it)
      try {
        const { error } = await supabase
          .from('science_progress_report')
          .insert({
            user_id: userId,
            question_uuid: questionId, 
            correct_question: isCorrect ? 1 : 0
          });
          
        if (error) {
          console.log('Supabase insert failed, using local storage only:', error);
          return { success: false, source: 'localStorage' };
        }
        
        return { success: true, source: 'supabase' };
      } catch (error) {
        console.error('Supabase error:', error);
        return { success: false, source: 'localStorage' };
      }
    } catch (error) {
      console.error('Error recording science progress:', error);
      return { success: false, source: null };
    }
  },
  
  // Idagdag ang record sa localStorage
  addToLocalStorage(userId: string, questionId: string, isCorrect: boolean) {
    try {
      // Get existing records
      const records = this.getLocalStorageRecords();
      
      // Add new record
      records.push({
        userId,
        questionId,
        isCorrect,
        timestamp: new Date().toISOString()
      });
      
      // Save back to localStorage
      localStorage.setItem('scienceProgress', JSON.stringify(records));
      
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },
  
  // Kunin lahat ng records mula sa localStorage
  getLocalStorageRecords(): ScienceProgressRecord[] {
    try {
      const storedData = localStorage.getItem('scienceProgress');
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },
  
  // Kunin ang progress stats para sa specific user
  getProgressStats(userId: string): ProgressStats {
    const records = this.getLocalStorageRecords();
    const userRecords = records.filter((record: ScienceProgressRecord) => record.userId === userId);
    
    const totalQuestions = userRecords.length;
    const correctAnswers = userRecords.filter((r: ScienceProgressRecord) => r.isCorrect).length;
    
    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
    };
  },
  
  // Sync localStorage data sa Supabase (optional, para sa future implementation)
  async syncToSupabase(userId: string) {
    const records = this.getLocalStorageRecords();
    const userRecords = records.filter((record: ScienceProgressRecord) => record.userId === userId);
    
    let successCount = 0;
    
    for (const record of userRecords) {
      try {
        const { error } = await supabase
          .from('science_progress_report')
          .insert({
            user_id: record.userId,
            question_uuid: record.questionId,
            correct_question: record.isCorrect ? 1 : 0,
            created_at: record.timestamp
          });
          
        if (!error) {
          successCount++;
        }
      } catch (error) {
        console.error('Error syncing record to Supabase:', error);
      }
    }
    
    return {
      total: userRecords.length,
      synced: successCount
    };
  }
}; 