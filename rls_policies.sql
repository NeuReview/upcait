-- Enable Row Level Security on the lang_prof_progress_report_quizzes table if not already enabled
ALTER TABLE public.lang_prof_progress_report_quizzes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own language proficiency records
CREATE POLICY "Users can insert their own language proficiency records" 
ON public.lang_prof_progress_report_quizzes 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to select their own records
CREATE POLICY "Users can view their own language proficiency records" 
ON public.lang_prof_progress_report_quizzes 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Add a policy for updating if needed
CREATE POLICY "Users can update their own language proficiency records" 
ON public.lang_prof_progress_report_quizzes 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Check if RLS is enabled on the table
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'lang_prof_progress_report_quizzes';

-- Check if required columns have proper types
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM 
  information_schema.columns 
WHERE 
  table_name = 'lang_prof_progress_report_quizzes' 
  AND table_schema = 'public'; 