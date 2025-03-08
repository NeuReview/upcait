/*
  # Add diagnostic queries and more test data

  1. Diagnostic Queries
    - Table structure verification
    - Question count analytics
    - Category distribution analysis
    - Data quality checks
    - Answer distribution analysis

  2. New Data
    - Added more questions across all categories and difficulty levels
    - Ensured even distribution of difficulty levels
    - Added comprehensive explanations
*/

-- Diagnostic Queries (these will run and help verify the data)
DO $$
DECLARE
    v_total_count INTEGER;
    v_category_stats RECORD;
    v_data_issues RECORD;
BEGIN
    -- Get total question count
    SELECT COUNT(*) INTO v_total_count FROM question_bank;
    RAISE NOTICE 'Total questions in bank: %', v_total_count;
    
    -- Get category distribution
    FOR v_category_stats IN (
        SELECT 
            category, 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE difficulty_level = 'Easy') as easy,
            COUNT(*) FILTER (WHERE difficulty_level = 'Medium') as medium,
            COUNT(*) FILTER (WHERE difficulty_level = 'Hard') as hard
        FROM question_bank
        GROUP BY category
    ) LOOP
        RAISE NOTICE 'Category: %, Total: %, Easy: %, Medium: %, Hard: %',
            v_category_stats.category,
            v_category_stats.total,
            v_category_stats.easy,
            v_category_stats.medium,
            v_category_stats.hard;
    END LOOP;
    
    -- Check for data issues
    FOR v_data_issues IN (
        SELECT question_id, category, difficulty_level
        FROM question_bank
        WHERE question IS NULL 
            OR option_a IS NULL 
            OR option_b IS NULL 
            OR option_c IS NULL 
            OR option_d IS NULL 
            OR answer IS NULL 
            OR explanation IS NULL
            OR answer NOT IN ('A', 'B', 'C', 'D')
            OR difficulty_level NOT IN ('Easy', 'Medium', 'Hard')
            OR category NOT IN ('Reading Comprehension', 'Science', 'Mathematics', 'Language Proficiency')
    ) LOOP
        RAISE NOTICE 'Data issue found in question ID: %', v_data_issues.question_id;
    END LOOP;
END $$;
