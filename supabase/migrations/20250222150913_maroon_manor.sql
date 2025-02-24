/*
  # Add Mock Exams and Flashcards Tables

  1. New Tables
    - `mock_exams`
      - `exam_id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `duration_minutes` (integer)
      - `total_questions` (integer)
      - `created_at` (timestamptz)
    
    - `mock_exam_sections`
      - `section_id` (uuid, primary key)
      - `exam_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `duration_minutes` (integer)
      - `total_questions` (integer)
      - `order_index` (integer)
      - `created_at` (timestamptz)
    
    - `flashcard_decks`
      - `deck_id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `created_at` (timestamptz)
    
    - `flashcards`
      - `card_id` (uuid, primary key)
      - `deck_id` (uuid, foreign key)
      - `front` (text)
      - `back` (text)
      - `category` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
*/

-- Create mock_exams table
CREATE TABLE mock_exams (
  exam_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create mock_exam_sections table
CREATE TABLE mock_exam_sections (
  section_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES mock_exams(exam_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create flashcard_decks table
CREATE TABLE flashcard_decks (
  deck_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Reading Comprehension', 'Science', 'Mathematics', 'Language Proficiency')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create flashcards table
CREATE TABLE flashcards (
  card_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES flashcard_decks(deck_id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Reading Comprehension', 'Science', 'Mathematics', 'Language Proficiency')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exam_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can read mock exams" ON mock_exams FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can read mock exam sections" ON mock_exam_sections FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can read flashcard decks" ON flashcard_decks FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can read flashcards" ON flashcards FOR SELECT TO public USING (true);

-- Insert sample data for mock exams
INSERT INTO mock_exams (title, description, duration_minutes, total_questions)
VALUES
  (
    'UPCAT Full Mock Exam 1',
    'Comprehensive mock exam covering all UPCAT subjects',
    180,
    200
  ),
  (
    'UPCAT Quick Practice Test',
    'Short practice test for quick review',
    60,
    60
  );

-- Insert sample data for mock exam sections
INSERT INTO mock_exam_sections (exam_id, title, description, duration_minutes, total_questions, order_index)
SELECT
  exam_id,
  'Language Proficiency',
  'Tests your mastery of English and Filipino language skills',
  45,
  50,
  1
FROM mock_exams
WHERE title = 'UPCAT Full Mock Exam 1';

INSERT INTO mock_exam_sections (exam_id, title, description, duration_minutes, total_questions, order_index)
SELECT
  exam_id,
  'Reading Comprehension',
  'Evaluates your ability to understand and analyze written passages',
  45,
  50,
  2
FROM mock_exams
WHERE title = 'UPCAT Full Mock Exam 1';

-- Insert sample flashcard decks
INSERT INTO flashcard_decks (title, description, category)
VALUES
  (
    'Essential Math Concepts',
    'Key mathematical concepts and formulas for UPCAT',
    'Mathematics'
  ),
  (
    'Science Fundamentals',
    'Basic science concepts and principles',
    'Science'
  ),
  (
    'Reading Strategies',
    'Effective techniques for reading comprehension',
    'Reading Comprehension'
  );

-- Insert sample flashcards
INSERT INTO flashcards (deck_id, front, back, category)
SELECT
  deck_id,
  'What is the quadratic formula?',
  'x = (-b ± √(b² - 4ac)) / 2a\n\nUsed to solve quadratic equations in the form ax² + bx + c = 0',
  'Mathematics'
FROM flashcard_decks
WHERE title = 'Essential Math Concepts';

INSERT INTO flashcards (deck_id, front, back, category)
SELECT
  deck_id,
  'What is Newton''s First Law of Motion?',
  'An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force.',
  'Science'
FROM flashcard_decks
WHERE title = 'Science Fundamentals';

INSERT INTO flashcards (deck_id, front, back, category)
SELECT
  deck_id,
  'What are the main types of context clues?',
  '1. Definition/Explanation\n2. Synonym/Restatement\n3. Antonym/Contrast\n4. Example\n5. General Context',
  'Reading Comprehension'
FROM flashcard_decks
WHERE title = 'Reading Strategies';