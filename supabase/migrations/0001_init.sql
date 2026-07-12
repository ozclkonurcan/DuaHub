-- DuaHub — ilk şema (senkron tabloları + RLS)
-- Uygulama: Supabase Dashboard → SQL Editor → New query → bu dosyayı yapıştır → Run.
-- Yerel karşılığı: src/core/db/schema.ts (drizzle). İki şema birlikte evrilir.

-- ============ Profil ============
-- auth.users'a 1:1; kayıt anında trigger ile oluşur.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  is_premium boolean not null default false,
  ai_trial_remaining int not null default 10, -- tek seferlik Rehber tanıtım hakkı
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ Senkron tabloları ============
-- Ortak sözleşme (yereldeki user.db ile aynı): updated_at (LWW) + deleted_at (soft delete).
-- id'ler istemcide üretilir (uuid) — çevrimdışı yazma çakışmasız çalışsın diye.

create table public.prayer_log (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  date text not null, -- YYYY-MM-DD (kullanıcının yerel günü)
  prayer text not null check (prayer in ('fajr','dhuhr','asr','maghrib','isha')),
  status text not null check (status in ('on_time','late','missed')),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, date, prayer)
);

create table public.dhikr_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  dhikr_key text not null,
  count int not null,
  target int,
  started_at timestamptz not null,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.favorites (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  content_type text not null check (content_type in ('dua','ayah')),
  content_id text not null,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, content_type, content_id)
);

create table public.quran_progress (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  date text not null, -- YYYY-MM-DD
  last_surah int,
  last_ayah int,
  last_page int,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, date)
);

-- ============ İndeksler (senkron pull sorgusu: user + updated_at) ============
create index prayer_log_sync_idx on public.prayer_log (user_id, updated_at);
create index dhikr_sessions_sync_idx on public.dhikr_sessions (user_id, updated_at);
create index favorites_sync_idx on public.favorites (user_id, updated_at);
create index quran_progress_sync_idx on public.quran_progress (user_id, updated_at);

-- ============ RLS: herkes yalnızca kendi satırlarını görür/yazar ============
alter table public.profiles enable row level security;
alter table public.prayer_log enable row level security;
alter table public.dhikr_sessions enable row level security;
alter table public.favorites enable row level security;
alter table public.quran_progress enable row level security;

create policy "own profile read" on public.profiles
  for select using (auth.uid() = id);
create policy "own profile update" on public.profiles
  for update using (auth.uid() = id);
-- Not: is_premium ve ai_trial_remaining yalnızca sunucu tarafında (service role /
-- RevenueCat webhook) değişmeli — Phase 3'te kolon bazlı koruma trigger'ı eklenecek.

create policy "own rows" on public.prayer_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.dhikr_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.quran_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
