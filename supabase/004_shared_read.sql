-- Shared-read, owner-write policies.
-- Any authenticated user can SEE all OKRs / KRs / tasks / events / announcements / sticky notes
-- but only the owner can INSERT / UPDATE / DELETE their own rows.

-- =========================
-- Objectives
-- =========================
drop policy if exists "obj_owner"        on public.objectives;
drop policy if exists "obj_select_all"   on public.objectives;
drop policy if exists "obj_insert_self"  on public.objectives;
drop policy if exists "obj_update_self"  on public.objectives;
drop policy if exists "obj_delete_self"  on public.objectives;

create policy "obj_select_all" on public.objectives
  for select using (auth.role() = 'authenticated');
create policy "obj_insert_self" on public.objectives
  for insert with check (auth.uid() = user_id);
create policy "obj_update_self" on public.objectives
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "obj_delete_self" on public.objectives
  for delete using (auth.uid() = user_id);

-- =========================
-- Key results
-- =========================
drop policy if exists "kr_owner"       on public.key_results;
drop policy if exists "kr_select_all"  on public.key_results;
drop policy if exists "kr_insert_self" on public.key_results;
drop policy if exists "kr_update_self" on public.key_results;
drop policy if exists "kr_delete_self" on public.key_results;

create policy "kr_select_all" on public.key_results
  for select using (auth.role() = 'authenticated');
create policy "kr_insert_self" on public.key_results
  for insert with check (auth.uid() = user_id);
create policy "kr_update_self" on public.key_results
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "kr_delete_self" on public.key_results
  for delete using (auth.uid() = user_id);

-- =========================
-- Tasks
-- =========================
drop policy if exists "task_owner"       on public.tasks;
drop policy if exists "task_select_all"  on public.tasks;
drop policy if exists "task_insert_self" on public.tasks;
drop policy if exists "task_update_self" on public.tasks;
drop policy if exists "task_delete_self" on public.tasks;

create policy "task_select_all" on public.tasks
  for select using (auth.role() = 'authenticated');
create policy "task_insert_self" on public.tasks
  for insert with check (auth.uid() = user_id);
create policy "task_update_self" on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "task_delete_self" on public.tasks
  for delete using (auth.uid() = user_id);

-- =========================
-- Events (calendar)
-- =========================
drop policy if exists "event_owner"       on public.events;
drop policy if exists "event_select_all"  on public.events;
drop policy if exists "event_insert_self" on public.events;
drop policy if exists "event_update_self" on public.events;
drop policy if exists "event_delete_self" on public.events;

create policy "event_select_all" on public.events
  for select using (auth.role() = 'authenticated');
create policy "event_insert_self" on public.events
  for insert with check (auth.uid() = user_id);
create policy "event_update_self" on public.events
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "event_delete_self" on public.events
  for delete using (auth.uid() = user_id);

-- =========================
-- Announcements (if the table exists)
-- =========================
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='announcements') then
    execute 'alter table public.announcements enable row level security';
    execute 'drop policy if exists "ann_owner"       on public.announcements';
    execute 'drop policy if exists "ann_select_all"  on public.announcements';
    execute 'drop policy if exists "ann_insert_self" on public.announcements';
    execute 'drop policy if exists "ann_update_self" on public.announcements';
    execute 'drop policy if exists "ann_delete_self" on public.announcements';
    execute 'create policy "ann_select_all"  on public.announcements for select using (auth.role() = ''authenticated'')';
    execute 'create policy "ann_insert_self" on public.announcements for insert with check (auth.uid() = user_id)';
    execute 'create policy "ann_update_self" on public.announcements for update using (auth.uid() = user_id) with check (auth.uid() = user_id)';
    execute 'create policy "ann_delete_self" on public.announcements for delete using (auth.uid() = user_id)';
  end if;
end $$;

-- =========================
-- Sticky notes — keep PRIVATE per user (no shared read)
-- =========================
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='sticky_notes') then
    execute 'alter table public.sticky_notes enable row level security';
    execute 'drop policy if exists "sticky_owner" on public.sticky_notes';
    execute 'create policy "sticky_owner" on public.sticky_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  end if;
end $$;
