-- 004: Privacy-preserving department aggregates.
-- Goal: each user can only SEE their own OKRs/tasks/events,
-- BUT the Overview page can still show org-wide *counts* per department.
--
-- We achieve this by:
--   1. Locking RLS back to owner-only (in case 004_shared_read.sql was run earlier).
--   2. Adding a SECURITY DEFINER function that returns ONLY aggregate counts,
--      not row contents. Authenticated users can call it to populate the
--      Departments grid without seeing anyone else's data.

-- =========================================================
-- 1. Restore owner-only RLS (idempotent — safe to run twice)
-- =========================================================
do $$
declare
  t text;
begin
  foreach t in array array['objectives','key_results','tasks','events','announcements'] loop
    -- drop any policies created earlier (shared-read or otherwise)
    execute format('drop policy if exists "obj_select_all"   on public.%I', t);
    execute format('drop policy if exists "obj_insert_self"  on public.%I', t);
    execute format('drop policy if exists "obj_update_self"  on public.%I', t);
    execute format('drop policy if exists "obj_delete_self"  on public.%I', t);
    execute format('drop policy if exists "kr_select_all"    on public.%I', t);
    execute format('drop policy if exists "kr_insert_self"   on public.%I', t);
    execute format('drop policy if exists "kr_update_self"   on public.%I', t);
    execute format('drop policy if exists "kr_delete_self"   on public.%I', t);
    execute format('drop policy if exists "task_select_all"  on public.%I', t);
    execute format('drop policy if exists "task_insert_self" on public.%I', t);
    execute format('drop policy if exists "task_update_self" on public.%I', t);
    execute format('drop policy if exists "task_delete_self" on public.%I', t);
    execute format('drop policy if exists "event_select_all" on public.%I', t);
    execute format('drop policy if exists "event_insert_self"on public.%I', t);
    execute format('drop policy if exists "event_update_self"on public.%I', t);
    execute format('drop policy if exists "event_delete_self"on public.%I', t);
    execute format('drop policy if exists "ann_select_all"   on public.%I', t);
    execute format('drop policy if exists "ann_insert_self"  on public.%I', t);
    execute format('drop policy if exists "ann_update_self"  on public.%I', t);
    execute format('drop policy if exists "ann_delete_self"  on public.%I', t);
  end loop;
exception when undefined_table then null;
end $$;

-- Re-create owner-only "for all" policies
drop policy if exists "obj_owner"   on public.objectives;
create policy "obj_owner"   on public.objectives  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "kr_owner"    on public.key_results;
create policy "kr_owner"    on public.key_results for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "task_owner"  on public.tasks;
create policy "task_owner"  on public.tasks       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "event_owner" on public.events;
create policy "event_owner" on public.events      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='announcements') then
    execute 'alter table public.announcements enable row level security';
    execute 'drop policy if exists "ann_owner" on public.announcements';
    execute 'create policy "ann_owner" on public.announcements for all using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  end if;
end $$;

-- =========================================================
-- 2. Aggregate-only RPC for the Departments grid
-- =========================================================
-- Returns one row per department with the org-wide counts.
-- SECURITY DEFINER means it bypasses RLS, but it ONLY exposes counts —
-- no titles, descriptions, owners, etc. leak across users.
create or replace function public.department_stats(p_quarter int, p_year int)
returns table (
  department text,
  objectives_count bigint,
  tasks_count bigint
)
language sql
security definer
set search_path = public
as $$
  with depts(department) as (
    values ('IT'), ('Finance'), ('Marketing'), ('Sales'), ('HR')
  )
  select
    d.department,
    (select count(*) from public.objectives o
       where o.department = d.department
         and o.quarter    = p_quarter
         and o.year       = p_year) as objectives_count,
    (select count(*) from public.tasks t
       where t.department = d.department) as tasks_count
  from depts d
  order by d.department;
$$;

revoke all on function public.department_stats(int, int) from public;
grant execute on function public.department_stats(int, int) to authenticated;
