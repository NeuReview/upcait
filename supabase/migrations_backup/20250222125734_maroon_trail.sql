/*
  # Add sample questions to question bank

  1. Changes
    - Adds sample questions for all categories:
      - Reading Comprehension
      - Science
      - Mathematics
      - Language Proficiency
    - Each category has questions of varying difficulty levels
*/

INSERT INTO question_bank (category, difficulty_level, question, option_a, option_b, option_c, option_d, answer, explanation)
VALUES
  -- Reading Comprehension Questions
  (
    'Reading Comprehension',
    'Easy',
    'What is the main idea of a paragraph called?',
    'Supporting detail',
    'Topic sentence',
    'Conclusion',
    'Introduction',
    'B',
    'The topic sentence contains the main idea of a paragraph and is usually found at the beginning.'
  ),
  (
    'Reading Comprehension',
    'Medium',
    'Which of the following best describes the purpose of a conclusion paragraph?',
    'Introduce new ideas',
    'Present evidence',
    'Summarize main points',
    'Add supporting details',
    'C',
    'A conclusion paragraph summarizes the main points discussed in the text and reinforces the central message.'
  ),

  -- Science Questions
  (
    'Science',
    'Easy',
    'What is the process by which plants make their own food?',
    'Respiration',
    'Photosynthesis',
    'Digestion',
    'Absorption',
    'B',
    'Photosynthesis is the process where plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.'
  ),
  (
    'Science',
    'Medium',
    'Which of the following is NOT a type of chemical bond?',
    'Ionic bond',
    'Covalent bond',
    'Magnetic bond',
    'Hydrogen bond',
    'C',
    'Magnetic bond is not a type of chemical bond. The main types of chemical bonds are ionic, covalent, and hydrogen bonds.'
  ),

  -- Mathematics Questions
  (
    'Mathematics',
    'Easy',
    'What is the value of x in the equation: x + 5 = 12?',
    '5',
    '7',
    '12',
    '17',
    'B',
    'To solve for x, subtract 5 from both sides: x + 5 - 5 = 12 - 5, therefore x = 7'
  ),
  (
    'Mathematics',
    'Medium',
    'What is the area of a circle with radius 4 units?',
    '16π square units',
    '8π square units',
    '4π square units',
    '12π square units',
    'A',
    'The area of a circle is πr². With radius = 4, area = π(4)² = 16π square units'
  ),

  -- Language Proficiency Questions
  (
    'Language Proficiency',
    'Easy',
    'Which of the following is a proper noun?',
    'city',
    'Manila',
    'building',
    'country',
    'B',
    'Manila is a proper noun because it is the specific name of a city. Proper nouns are always capitalized.'
  ),
  (
    'Language Proficiency',
    'Medium',
    'Identify the correct sentence:',
    'Their going to the store.',
    'There going to the store.',
    'They''re going to the store.',
    'Theyre going to the store.',
    'C',
    'They''re is the correct contraction of "they are". "Their" is possessive, and "there" indicates location.'
  );