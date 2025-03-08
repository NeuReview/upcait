-- Insert sample profiles
INSERT INTO profiles (id, user_id, full_name, school, year_level)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Juan Dela Cruz', 'UP Diliman', 'Grade 12'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'Maria Santos', 'Philippine Science High School', 'Grade 12'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000003', 'Pedro Penduko', 'Manila Science High School', 'Grade 11'),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000004', 'Ana Reyes', 'Quezon City Science High School', 'Grade 12'),
  ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000005', 'Miguel Garcia', 'UP Rural High School', 'Grade 11');

-- Insert sample user statistics
INSERT INTO user_statistics (user_id, questions_answered, correct_answers)
VALUES
  ('00000000-0000-0000-0000-000000000001', 500, 450),  -- 90% accuracy
  ('00000000-0000-0000-0000-000000000002', 300, 285),  -- 95% accuracy
  ('00000000-0000-0000-0000-000000000003', 1000, 850), -- 85% accuracy
  ('00000000-0000-0000-0000-000000000004', 250, 225),  -- 90% accuracy
  ('00000000-0000-0000-0000-000000000005', 750, 600);  -- 80% accuracy