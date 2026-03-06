-- Run this in Supabase SQL Editor
create extension if not exists pgcrypto;

create table if not exists public.tamper_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  data_hash text not null,
  canonical_size integer not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tamper_records_user_created_at
  on public.tamper_records(user_id, created_at desc);

alter table public.tamper_records enable row level security;

drop policy if exists "Users can read own records" on public.tamper_records;
create policy "Users can read own records"
  on public.tamper_records
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own records" on public.tamper_records;
create policy "Users can insert own records"
  on public.tamper_records
  for insert
  with check (auth.uid() = user_id);
