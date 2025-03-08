-- First, let's verify our table structure
DO $$ 
BEGIN
  -- Drop existing questions if any have wrong data
  DELETE FROM question_bank 
  WHERE difficulty_level NOT IN ('Easy', 'Medium', 'Hard')
  OR category NOT IN ('Reading Comprehension', 'Science', 'Mathematics', 'Language Proficiency')
  OR answer NOT IN ('A', 'B', 'C', 'D');

  -- Insert sample questions with correct data
  INSERT INTO question_bank (category, difficulty_level, question, option_a, option_b, option_c, option_d, answer, explanation)
  VALUES
    (
      'Reading Comprehension',
      'Medium',
      'What is the main purpose of a thesis statement?',
      'To provide background information',
      'To state the main argument',
      'To list supporting details',
      'To conclude the essay',
      'B',
      'A thesis statement presents the main argument or central claim of an essay.'
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
      'Photosynthesis is the process where plants convert light energy into chemical energy.'
    ),
    (
      'Mathematics',
      'Medium',
      'What is the area of a circle with radius 5 units?',
      '25π square units',
      '10π square units',
      '15π square units',
      '20π square units',
      'A',
      'The area of a circle is πr². With radius = 5, area = π(5)² = 25π square units'
    ),
    (
      'Language Proficiency',
      'Easy',
      'Which sentence uses the correct form of "their"?',
      'There going to the park.',
      'Their going to the park.',
      'They''re going to the park.',
      'Theyre going to the park.',
      'C',
      'They''re is the correct contraction of "they are".'
    );
END $$;

-- Verify the data
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM question_bank;
    RAISE NOTICE 'Total questions in bank: %', v_count;
    
    -- Log category distribution
    FOR v_count IN (
        SELECT category, COUNT(*) 
        FROM question_bank 
        GROUP BY category
    ) LOOP
        RAISE NOTICE 'Questions per category: %', v_count;
    END LOOP;
END $$;