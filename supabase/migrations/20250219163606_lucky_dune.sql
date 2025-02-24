/*
  # Enable authentication permissions

  1. Security
    - Enable RLS on auth.users table
    - Add policies for authenticated users to:
      - Read their own data
      - Update their own data
      - Delete their own account
    - Add policy for public registration
*/

-- Enable RLS on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can read own data"
  ON auth.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON auth.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to delete their own account
CREATE POLICY "Users can delete own account"
  ON auth.users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Allow public registration
CREATE POLICY "Allow public registration"
  ON auth.users
  FOR INSERT
  TO anon
  WITH CHECK (true);