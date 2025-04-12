-- Enable RLS on the table
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.user_profile
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.user_profile
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.user_profile
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Verify that RLS is enabled on the table
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'user_profile'; 