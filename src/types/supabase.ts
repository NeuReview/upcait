export type Database = {
  public: {
    Tables: {
      question_bank: {
        Row: {
          question_id: number;
          category: string;
          difficulty_level: string;
          question: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          answer: string;
          explanation: string;
          created_at: string;
        };
        Insert: {
          question_id?: number;
          category: string;
          difficulty_level: string;
          question: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          answer: string;
          explanation: string;
          created_at?: string;
        };
        Update: {
          question_id?: number;
          category?: string;
          difficulty_level?: string;
          question?: string;
          option_a?: string;
          option_b?: string;
          option_c?: string;
          option_d?: string;
          answer?: string;
          explanation?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          school: string | null;
          year_level: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          school?: string | null;
          year_level?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          school?: string | null;
          year_level?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};