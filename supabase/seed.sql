-- Skating School MVP Seed Script
-- Note: Replace the auth user UUIDs with actual IDs generated in your Supabase Auth dashboard later if needed.
-- Make sure to use proper hex formatted UUIDs.

/* 
INSERT INTO public.profiles (id, full_name, role) VALUES 
('YOUR-AUTH-UUID-1', 'Admin Alice', 'admin'),
('YOUR-AUTH-UUID-2', 'Instructor Sarah', 'instructor'),
('YOUR-AUTH-UUID-3', 'Instructor Mike', 'instructor');
*/

-- 2. Mock Levels (Using valid hex UUID format)
INSERT INTO public.levels (id, name) VALUES 
('11111111-0000-0000-0000-000000000001', 'Basic Skills 1'),
('11111111-0000-0000-0000-000000000002', 'Basic Skills 2');

-- 3. Mock Skills
-- Basic Skills 1
INSERT INTO public.skills (id, level_id, name) VALUES 
('51111111-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Sit and stand up on ice'),
('51111111-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'March forward across ice'),
('51111111-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'Two-foot glide'),
('51111111-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 'Dip in place');

-- Basic Skills 2
INSERT INTO public.skills (id, level_id, name) VALUES 
('52222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 'One-foot glide'),
('52222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'Backward wiggles'),
('52222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002', 'Snowplow stop');

-- 4. Mock Students
INSERT INTO public.students (id, name, age) VALUES 
('57777777-0000-0000-0000-000000000001', 'Emma Watson', 8),
('57777777-0000-0000-0000-000000000002', 'Noah Smith', 9),
('57777777-0000-0000-0000-000000000003', 'Olivia Jones', 7),
('57777777-0000-0000-0000-000000000004', 'Liam Brown', 10);

-- 5. Mock Classes
INSERT INTO public.classes (id, name, level_id, schedule_time) VALUES 
('c1111111-0000-0000-0000-000000000001', 'Sat 9AM Basics', '11111111-0000-0000-0000-000000000001', 'Saturday 9:00 AM'),
('c1111111-0000-0000-0000-000000000002', 'Sun 10AM Int', '11111111-0000-0000-0000-000000000002', 'Sunday 10:00 AM');

-- 6. Class Enrollments
INSERT INTO public.class_enrollments (class_id, student_id) VALUES 
('c1111111-0000-0000-0000-000000000001', '57777777-0000-0000-0000-000000000001'), -- Emma
('c1111111-0000-0000-0000-000000000001', '57777777-0000-0000-0000-000000000003'), -- Olivia
('c1111111-0000-0000-0000-000000000002', '57777777-0000-0000-0000-000000000002'), -- Noah
('c1111111-0000-0000-0000-000000000002', '57777777-0000-0000-0000-000000000004'); -- Liam
