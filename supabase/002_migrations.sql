-- Run this after schema.sql has been applied.
-- Safe to run multiple times.

-- 1. Objectives: add due_date
alter table public.objectives add column if not exists due_date timestamptz;

-- 2. Tasks: allow a "review" status (in addition to todo / in_progress / done)
alter table public.tasks drop constraint if exists tasks_status_check;
alter table public.tasks
  add constraint tasks_status_check
  check (status in ('todo', 'in_progress', 'review', 'done'));

-- 3. Announcements
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  department text,
  title text not null,
  body text,
  created_at timestamptz default now()
);
alter table public.announcements enable row level security;
drop policy if exists "announcements readable to all" on public.announcements;
drop policy if exists "announcements insert own" on public.announcements;
drop policy if exists "announcements update own" on public.announcements;
drop policy if exists "announcements delete own" on public.announcements;
create policy "announcements readable to all"
  on public.announcements for select to authenticated using (true);
create policy "announcements insert own"
  on public.announcements for insert to authenticated with check (auth.uid() = user_id);
create policy "announcements update own"
  on public.announcements for update to authenticated using (auth.uid() = user_id);
create policy "announcements delete own"
  on public.announcements for delete to authenticated using (auth.uid() = user_id);

-- 4. Sticky notes (personal)
create table if not exists public.sticky_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  body text not null,
  created_at timestamptz default now()
);
alter table public.sticky_notes enable row level security;
drop policy if exists "sticky select own" on public.sticky_notes;
drop policy if exists "sticky insert own" on public.sticky_notes;
drop policy if exists "sticky update own" on public.sticky_notes;
drop policy if exists "sticky delete own" on public.sticky_notes;
create policy "sticky select own"
  on public.sticky_notes for select to authenticated using (auth.uid() = user_id);
create policy "sticky insert own"
  on public.sticky_notes for insert to authenticated with check (auth.uid() = user_id);
create policy "sticky update own"
  on public.sticky_notes for update to authenticated using (auth.uid() = user_id);
create policy "sticky delete own"
  on public.sticky_notes for delete to authenticated using (auth.uid() = user_id);
