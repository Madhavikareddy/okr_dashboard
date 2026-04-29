-- Quarterly Nexus Hub schema
-- Run this in the Supabase SQL editor.

-- Profiles (1-1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  email text,
  department text check (department in ('IT','Finance','Marketing','Sales','HR')),
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.objectives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  description text,
  department text not null,
  quarter int not null check (quarter between 1 and 4),
  year int not null,
  status text not null default 'on_track' check (status in ('on_track','at_risk','off_track','done')),
  progress int not null default 0 check (progress between 0 and 100),
  created_at timestamptz default now()
);

create table if not exists public.key_results (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid not null references public.objectives on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  target numeric not null default 100,
  current numeric not null default 0,
  unit text default '%',
  created_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  description text,
  department text,
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  status text not null default 'todo' check (status in ('todo','in_progress','done')),
  due_date date,
  objective_id uuid references public.objectives on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  department text,
  created_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.objectives enable row level security;
alter table public.key_results enable row level security;
alter table public.tasks enable row level security;
alter table public.events enable row level security;

-- Profiles: each user reads/updates their own; everyone can read team list
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (auth.role() = 'authenticated');
drop policy if exists "profiles_modify_self" on public.profiles;
create policy "profiles_modify_self" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- Owner-only access for the rest
do $$ begin
  perform 1;
exception when others then null; end $$;

drop policy if exists "obj_owner" on public.objectives;
create policy "obj_owner" on public.objectives for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "kr_owner" on public.key_results;
create policy "kr_owner" on public.key_results for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "task_owner" on public.tasks;
create policy "task_owner" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "event_owner" on public.events;
create policy "event_owner" on public.events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, department)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'department', 'IT')
  ) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
