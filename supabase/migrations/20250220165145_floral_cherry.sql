/*
  # Create Question Bank Table

  1. New Tables
    - `question_bank`
      - `question_id` (serial, primary key)
      - `category` (text)
      - `difficulty_level` (text)
      - `question` (text)
      - `option_a` (text)
      - `option_b` (text)
      - `option_c` (text)
      - `option_d` (text)
      - `answer` (text)
      - `Explanation` (text)

  2. Security
    - Enable RLS on `question_bank` table
    - Add policy for authenticated users to read questions
*/

-- Create question bank table
CREATE TABLE IF NOT EXISTS question_bank (
  question_id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  answer TEXT NOT NULL,
  Explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read questions
CREATE POLICY "Anyone can read questions"
  ON question_bank
  FOR SELECT
  TO public
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_question_bank_category ON question_bank(category);
CREATE INDEX IF NOT EXISTS idx_question_bank_difficulty ON question_bank(difficulty_level);