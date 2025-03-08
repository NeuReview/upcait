/*
  # Add User Statistics for Leaderboard

  1. New Tables
    - `user_statistics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `questions_answered` (integer)
      - `correct_answers` (integer)
      - `accuracy_percentage` (decimal)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for:
      - Public read access for leaderboard
      - Authenticated users can update their own stats
*/

CREATE TABLE user_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    accuracy_percentage DECIMAL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- Allow public to read statistics for leaderboard
CREATE POLICY "Anyone can read user statistics"
    ON user_statistics
    FOR SELECT
    TO public
    USING (true);

-- Allow users to update their own statistics
CREATE POLICY "Users can update own statistics"
    ON user_statistics
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create trigger to update accuracy percentage
CREATE OR REPLACE FUNCTION calculate_accuracy_percentage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.questions_answered > 0 THEN
        NEW.accuracy_percentage = (NEW.correct_answers::DECIMAL / NEW.questions_answered::DECIMAL) * 100;
    ELSE
        NEW.accuracy_percentage = 0;
    END IF;
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_accuracy_percentage
    BEFORE INSERT OR UPDATE ON user_statistics
    FOR EACH ROW
    EXECUTE FUNCTION calculate_accuracy_percentage();