-- Add department & make end_at truly optional on events
alter table public.events add column if not exists department text;
