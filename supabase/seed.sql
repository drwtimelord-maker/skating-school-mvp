-- Skating School MVP Seed Script
-- Note: Replace the UUIDs with actual auth.user IDs generated in your Supabase Auth dashboard later!
-- For now, these are placeholder UUIDs for demonstration.

-- 1. Insert placeholder auth users (if this script is ran outside supabase platform bounds, usually auth users are made via signup)
-- We'll assume these UUIDs exist in auth.users or we'll bypass the FK constraint conceptually for this seed example.
-- To make this run cleanly in Supabase, you must create 3 users in the dashboard, then swap these IDs.
-- Let's define the IDs as variables or just hardcode placeholders that would match real users.
-- e.g., Admin: 'd0fc2e97-48f1-4db8-bdfc-b6f123456789'

-- We can't safely insert into auth.users directly via SQL in Supabase without full triggers.
-- Assuming profiles have valid auth IDs:

/* 
INSERT INTO public.profiles (id, full_name, role) VALUES 
('YOUR-AUTH-UUID-1', 'Admin Alice', 'admin'),
('YOUR-AUTH-UUID-2', 'Instructor Sarah', 'instructor'),
('YOUR-AUTH-UUID-3', 'Instructor Mike', 'instructor');
*/

-- 2. Mock Levels
INSERT INTO public.levels (id, name) VALUES 
('L1000000-0000-0000-0000-000000000001', 'Basic Skills 1'),
('L1000000-0000-0000-0000-000000000002', 'Basic Skills 2');

-- 3. Mock Skills
-- Basic Skills 1
INSERT INTO public.skills (id, level_id, name) VALUES 
('S1000001-0000-0000-0000-000000000000', 'L1000000-0000-0000-0000-000000000001', 'Sit and stand up on ice'),
('S1000002-0000-0000-0000-000000000000', 'L1000000-0000-0000-0000-000000000001', 'March forward across ice'),
('S1000003-0000-0000-0000-000000000000', 'L1000000-0000-0000-0000-000000000001', 'Two-foot glide'),
('S1000004-0000-0000-0000-000000000000', 'L1000000-0000-0000-0000-000000000001', 'Dip in place');

-- Basic Skills 2
INSERT INTO public.skills (id, level_id, name) VALUES 
('S2000001-0000-0000-0000-000000000000', 'L1000000-0000-0000-0000-000000000002', 'One-foot glide'),
('S2000002-0000-0000-0000-000000000000', 'L1000000-0000-0000-0000-000000000002', 'Backward wiggles'),
('S2000003-0000-0000-0000-000000000000', 'L1000000-0000-0000-0000-000000000002', 'Snowplow stop');

-- 4. Mock Students
INSERT INTO public.students (id, name, age) VALUES 
('ST000001-0000-0000-0000-000000000000', 'Emma Watson', 8),
('ST000002-0000-0000-0000-000000000000', 'Noah Smith', 9),
('ST000003-0000-0000-0000-000000000000', 'Olivia Jones', 7),
('ST000004-0000-0000-0000-000000000000', 'Liam Brown', 10);

-- 5. Mock Classes
INSERT INTO public.classes (id, name, level_id, schedule_time) VALUES 
('C1000001-0000-0000-0000-000000000000', 'Sat 9AM Basics', 'L1000000-0000-0000-0000-000000000001', 'Saturday 9:00 AM'),
('C1000002-0000-0000-0000-000000000000', 'Sun 10AM Int', 'L1000000-0000-0000-0000-000000000002', 'Sunday 10:00 AM');

-- 6. Class Enrollments
INSERT INTO public.class_enrollments (class_id, student_id) VALUES 
('C1000001-0000-0000-0000-000000000000', 'ST000001-0000-0000-0000-000000000000'), -- Emma
('C1000001-0000-0000-0000-000000000000', 'ST000003-0000-0000-0000-000000000000'), -- Olivia
('C1000002-0000-0000-0000-000000000000', 'ST000002-0000-0000-0000-000000000000'), -- Noah
('C1000002-0000-0000-0000-000000000000', 'ST000004-0000-0000-0000-000000000000'); -- Liam

-- Note: Class Instructors, Feedback Reports, and Feedback Skill Results 
-- will require real instructor_id UUIDs from your auth.users instances.
-- They can be added after registering users!
