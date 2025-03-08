/*
  # Add sample questions to question bank

  1. Changes
    - Add initial set of sample questions for each category and difficulty level
    - Ensure proper data formatting and consistency
    - Add meaningful explanations for each question

  2. Security
    - No changes to security policies (using existing RLS)
*/

-- Add sample questions for Reading Comprehension
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
    'Reading Comprehension',
    'Medium',
    'Which of the following best describes the authors tone in a persuasive essay?',
    'Emotional and dramatic',
    'Objective and analytical',
    'Casual and conversational',
    'Personal and reflective',
    'B',
    'In a persuasive essay, an objective and analytical tone helps establish credibility and makes the argument more convincing through logical reasoning.'
  );

-- Add sample questions for Science
INSERT INTO question_bank (category, difficulty_level, question, option_a, option_b, option_c, option_d, answer, explanation)
VALUES
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
    'Science',
    'Medium',
    'Which of the following is NOT a function of the cell membrane?',
    'Protein synthesis',
    'Selective permeability',
    'Protection',
    'Transport of materials',
    'A',
    'Protein synthesis occurs in the ribosomes, not in the cell membrane. The cell membrane is responsible for controlling what enters and exits the cell.'
  );

-- Add sample questions for Mathematics
INSERT INTO question_bank (category, difficulty_level, question, option_a, option_b, option_c, option_d, answer, explanation)
VALUES
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
    'Mathematics',
    'Medium',
    'What is the area of a triangle with base 6 units and height 8 units?',
    '24 square units',
    '48 square units',
    '14 square units',
    '16 square units',
    'A',
    'Area of a triangle = (1/2) × base × height\n= (1/2) × 6 × 8\n= 24 square units'
  );

-- Add sample questions for Language Proficiency
INSERT INTO question_bank (category, difficulty_level, question, option_a, option_b, option_c, option_d, answer, explanation)
VALUES
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
  ),
  (
    'Language Proficiency',
    'Medium',
    'Choose the correct form of the verb: The team _____ to win the championship.',
    'hope',
    'hopes',
    'hoping',
    'hoped',
    'B',
    'The verb should be "hopes" because "team" is a collective noun treated as singular in this context, requiring a singular verb form.'
  );