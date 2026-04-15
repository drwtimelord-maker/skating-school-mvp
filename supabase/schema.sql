-- Skating School MVP Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PRE-CLEANUP: Drop existing tables to avoid "already exists" errors during manual execution
-- (WARNING: This deletes existing MVP data, which is safely restored via seed.sql)
drop table if exists public.feedback_skill_results cascade;
drop table if exists public.feedback_reports cascade;
drop table if exists public.class_enrollments cascade;
drop table if exists public.class_instructors cascade;
drop table if exists public.classes cascade;
drop table if exists public.students cascade;
drop table if exists public.skills cascade;
drop table if exists public.levels cascade;
drop table if exists public.profiles cascade;

drop type if exists user_role cascade;
create type user_role as enum ('instructor', 'admin', 'parent');

-- 1. PROFILES
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  full_name text not null,
  role user_role not null default 'instructor',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. LEVELS
create table public.levels (
  id uuid default gen_random_uuid() primary key,
  name text not null
);

-- 3. SKILLS
create table public.skills (
  id uuid default gen_random_uuid() primary key,
  level_id uuid references public.levels(id) on delete cascade not null,
  name text not null
);

-- 4. STUDENTS
create table public.students (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  age integer not null,
  parent_id uuid references public.profiles(id)
);

-- 5. CLASSES
create table public.classes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  level_id uuid references public.levels(id) not null,
  schedule_time text not null
);

-- 6. CLASS INSTRUCTORS
create table public.class_instructors (
  class_id uuid references public.classes(id) on delete cascade not null,
  instructor_id uuid references public.profiles(id) on delete cascade not null,
  primary key (class_id, instructor_id)
);

-- 7. CLASS ENROLLMENTS
create table public.class_enrollments (
  class_id uuid references public.classes(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  primary key (class_id, student_id)
);

-- 8. FEEDBACK REPORTS
create table public.feedback_reports (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) not null,
  class_id uuid references public.classes(id) not null,
  instructor_id uuid references public.profiles(id) not null,
  session_date date not null default current_date,
  comments text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. FEEDBACK SKILL RESULTS
create table public.feedback_skill_results (
  id uuid default gen_random_uuid() primary key,
  report_id uuid references public.feedback_reports(id) on delete cascade not null,
  skill_id uuid references public.skills(id) not null,
  pass_status text not null check (pass_status in ('pass', 'not_yet'))
);

-- ========== ROW LEVEL SECURITY (RLS) ==========
-- Simple RLS: All authenticated users can read.
-- Instructors can insert/update feedback. (Kept extremely simple for MVP)

alter table public.profiles enable row level security;
alter table public.levels enable row level security;
alter table public.skills enable row level security;
alter table public.students enable row level security;
alter table public.classes enable row level security;
alter table public.class_instructors enable row level security;
alter table public.class_enrollments enable row level security;
alter table public.feedback_reports enable row level security;
alter table public.feedback_skill_results enable row level security;

-- Read policies
create policy "Allow insert for auth users" on public.profiles for insert with check (auth.role() = 'authenticated' and auth.uid() = id);
create policy "Allow read access to all authenticated users" on public.profiles for select using (auth.role() = 'authenticated');
create policy "Allow read access to all authenticated users" on public.levels for select using (auth.role() = 'authenticated');
create policy "Allow read access to all authenticated users" on public.skills for select using (auth.role() = 'authenticated');
create policy "Allow read access to all authenticated users" on public.students for select using (auth.role() = 'authenticated');
create policy "Allow read access to all authenticated users" on public.classes for select using (auth.role() = 'authenticated');
create policy "Allow read access to all authenticated users" on public.class_instructors for select using (auth.role() = 'authenticated');
create policy "Allow read access to all authenticated users" on public.class_enrollments for select using (auth.role() = 'authenticated');
create policy "Allow read access to all authenticated users" on public.feedback_reports for select using (auth.role() = 'authenticated');
create policy "Allow read access to all authenticated users" on public.feedback_skill_results for select using (auth.role() = 'authenticated');

-- Write policies (MVP standard: authenticated users can insert feedback)
create policy "Allow insert for auth users" on public.feedback_reports for insert with check (auth.role() = 'authenticated');
create policy "Allow update for auth users" on public.feedback_reports for update using (auth.role() = 'authenticated');

create policy "Allow insert for auth users" on public.feedback_skill_results for insert with check (auth.role() = 'authenticated');
create policy "Allow update for auth users" on public.feedback_skill_results for update using (auth.role() = 'authenticated');

-- Write policies for levels/skills management (admin via app)
create policy "Allow insert for auth users" on public.levels for insert with check (auth.role() = 'authenticated');
create policy "Allow delete for auth users" on public.levels for delete using (auth.role() = 'authenticated');

create policy "Allow insert for auth users" on public.skills for insert with check (auth.role() = 'authenticated');
create policy "Allow delete for auth users" on public.skills for delete using (auth.role() = 'authenticated');
