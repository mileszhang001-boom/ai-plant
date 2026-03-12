-- ===== PlantOS Supabase Setup =====
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Plants table
create table if not exists plants (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  species text not null,
  fun_name text not null,
  personality text not null default '',
  current_hp integer not null default 50,
  current_metrics jsonb not null default '{"water":50,"light":50,"nutrition":50,"pest":50}',
  current_action jsonb not null default '{"type":"none","label":"","icon":""}',
  created_at timestamptz not null default now(),
  last_scanned_at timestamptz not null default now()
);

-- 2. Scan records table
create table if not exists scan_records (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  plant_id uuid not null references plants(id) on delete cascade,
  hp integer not null,
  metrics jsonb not null default '{"water":50,"light":50,"nutrition":50,"pest":50}',
  scanned_at timestamptz not null default now(),
  ai_raw_response jsonb
);

-- 3. Match logs table
create table if not exists match_logs (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  scan_id uuid not null,
  ai_suggestion uuid,
  ai_confidence real not null default 0,
  user_confirmed uuid,
  is_new_plant boolean not null default false,
  created_at timestamptz not null default now()
);

-- ===== RLS Policies =====

alter table plants enable row level security;
alter table scan_records enable row level security;
alter table match_logs enable row level security;

-- Plants: users can only CRUD their own
create policy "Users can view own plants" on plants for select using (auth.uid() = user_id);
create policy "Users can insert own plants" on plants for insert with check (auth.uid() = user_id);
create policy "Users can update own plants" on plants for update using (auth.uid() = user_id);
create policy "Users can delete own plants" on plants for delete using (auth.uid() = user_id);

-- Scan records: users can only CRUD their own
create policy "Users can view own scan_records" on scan_records for select using (auth.uid() = user_id);
create policy "Users can insert own scan_records" on scan_records for insert with check (auth.uid() = user_id);

-- Match logs: users can only CRUD their own
create policy "Users can view own match_logs" on match_logs for select using (auth.uid() = user_id);
create policy "Users can insert own match_logs" on match_logs for insert with check (auth.uid() = user_id);

-- ===== Storage Bucket =====

insert into storage.buckets (id, name, public)
values ('plant-photos', 'plant-photos', true)
on conflict (id) do nothing;

-- Storage policies: authenticated users can upload, anyone can read (public bucket)
create policy "Authenticated users can upload photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'plant-photos');

create policy "Authenticated users can update photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'plant-photos');

create policy "Anyone can view photos"
  on storage.objects for select
  to public
  using (bucket_id = 'plant-photos');
