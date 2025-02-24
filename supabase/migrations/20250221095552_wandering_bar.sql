/*
  # Fix question bank schema

  1. Changes
    - Fix column name casing (Explanation -> explanation)
    - Add NOT NULL constraints to required fields
    - Add check constraints for valid values
*/

-- Drop the existing table
DROP TABLE IF EXISTS question_bank;

-- Recreate the table with proper constraints
CREATE TABLE question_bank (
  question_id SERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('Reading Comprehension', 'Science', 'Mathematics', 'Language Proficiency')),
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('Easy', 'Medium', 'Hard')),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  answer TEXT NOT NULL CHECK (answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
CREATE INDEX idx_question_bank_category ON question_bank(category);
CREATE INDEX idx_question_bank_difficulty ON question_bank(difficulty_level);

-- Insert sample questions
INSERT INTO question_bank (category, difficulty_level, question, option_a, option_b, option_c, option_d, answer, explanation)
VALUES
  (
    'Reading Comprehension',
    'Easy',
    'What is the main purpose of a thesis statement in an essay?',
    'To provide background information',
    'To state the main argument or point',
    'To list supporting details',
    'To conclude the essay',
    'B',
    'A thesis statement presents the main argument or central claim of an essay. It serves as a roadmap for readers, telling them what to expect from the rest of the paper.'
  ),
  (
    'Science',
    'Easy',
    'What is photosynthesis?',
    'Breaking down of food',
    'Process of making food using sunlight',
    'Release of energy',
    'Absorption of minerals',
    'B',
    'Photosynthesis is the process by which plants convert light energy into chemical energy to produce glucose using carbon dioxide and water.'
  ),
  (
    'Mathematics',
    'Easy',
    'Solve for x: 2x + 3 = 11',
    'x = 3',
    'x = 4',
    'x = 5',
    'x = 6',
    'B',
    'To solve: 2x + 3 = 11\nSubtract 3 from both sides: 2x = 8\nDivide both sides by 2: x = 4'
  ),
  (
    'Language Proficiency',
    'Easy',
    'Which of the following is a proper noun?',
    'book',
    'city',
    'Manila',
    'building',
    'C',
    'Manila is a proper noun because it is the specific name of a city. Proper nouns are always capitalized.'
  );