-- Enable RLS on the table
ALTER TABLE public.math_progress_report ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own progress records
CREATE POLICY "Users can insert their own progress" 
ON public.math_progress_report 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to view their own progress records
CREATE POLICY "Users can view their own progress" 
ON public.math_progress_report 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Verify that RLS is enabled on the table
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'math_progress_report'; 