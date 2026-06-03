-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║ TeoricoB — esquema BD inicial (Supabase / Postgres)                 ║
-- ║ Versión: 1.0  · Fecha: 2026-06-03                                   ║
-- ╚══════════════════════════════════════════════════════════════════════╝
--
-- Filosofía:
-- - Auth: gestionado por Supabase (`auth.users`). Aquí solo extendemos.
-- - Progreso del usuario: JSONB en `user_progress` (espejo del store
--   Zustand). Campos extraídos como columnas indexadas para queries
--   rápidas (xp, streak, league, weekly_xp, last_active_date).
-- - Listas separadas (mistakes, exam_history) en sus propias tablas
--   para queries y leaderboards eficientes.
-- - RLS activo en TODAS las tablas desde el inicio.
-- - Schema preparado para autoescuelas (Fase 4) y recompensas (Fase 5)
--   aunque las features se activan después.
--
-- ─────────────────────────────────────────────────────────────────────
-- 1. PERFILES
-- ─────────────────────────────────────────────────────────────────────
create table public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  display_name         text not null,
  avatar_emoji         text default '🎨',           -- color hex o emoji
  profile_photo_url    text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  -- Datos opcionales
  birth_year           int,
  locale               text default 'es-ES',
  -- Vinculación autoescuela (puede ser null = estudiante independiente)
  autoescuela_id       uuid references public.autoescuelas(id) on delete set null,
  -- Flags
  disclaimer_accepted  boolean not null default false,
  tutorial_seen        boolean not null default false,
  -- Soft delete para GDPR (no borramos inmediato)
  deleted_at           timestamptz
);

create index idx_profiles_autoescuela on public.profiles(autoescuela_id)
  where autoescuela_id is not null;

-- Trigger updated_at
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- 2. PROGRESO DEL USUARIO (espejo Zustand)
-- ─────────────────────────────────────────────────────────────────────
-- Estrategia: 1 fila por usuario con un blob JSONB completo del store +
-- columnas extraídas para queries. Sync push reemplaza el blob entero
-- (last-write-wins). Mistakes/exam_history quedan separados.
create table public.user_progress (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  -- Campos extraídos del state (para leaderboards y queries)
  xp                 int not null default 0,
  weekly_xp          int not null default 0,
  weekly_reset_at    timestamptz not null default now(),
  streak             int not null default 0,
  hearts             int not null default 5,
  gems               int not null default 0,
  league             text not null default 'Bronce',
  last_active_date   date,
  -- Stats agregadas
  total_correct      int not null default 0,
  total_answered     int not null default 0,
  -- Blob completo del store Zustand persistido (lo que esté allí)
  state_blob         jsonb not null default '{}'::jsonb,
  -- Versionado del schema para migraciones futuras
  schema_version     int not null default 1,
  updated_at         timestamptz not null default now()
);

create index idx_user_progress_league_weekly on public.user_progress(league, weekly_xp desc);
create index idx_user_progress_xp on public.user_progress(xp desc);

create trigger trg_user_progress_updated_at
  before update on public.user_progress
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- 3. ERRORES (spaced repetition simple)
-- ─────────────────────────────────────────────────────────────────────
create table public.mistakes (
  user_id            uuid not null references auth.users(id) on delete cascade,
  question_id        text not null,
  category           text not null,
  attempts           int not null default 1,
  recoveries_needed  int not null default 2,
  failed_at          timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index idx_mistakes_user_recent on public.mistakes(user_id, failed_at desc);

-- ─────────────────────────────────────────────────────────────────────
-- 4. HISTORIAL DE EXÁMENES
-- ─────────────────────────────────────────────────────────────────────
create table public.exam_history (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  taken_at            timestamptz not null default now(),
  total_questions     int not null,
  correct_count       int not null,
  wrong_count         int not null,
  time_elapsed_sec    int not null,
  passed              boolean not null
);

create index idx_exam_history_user_recent on public.exam_history(user_id, taken_at desc);

-- ─────────────────────────────────────────────────────────────────────
-- 5. AMIGOS (real social, reemplaza MOCK_FRIENDS)
-- ─────────────────────────────────────────────────────────────────────
create table public.friendships (
  user_id_a   uuid not null references auth.users(id) on delete cascade,
  user_id_b   uuid not null references auth.users(id) on delete cascade,
  status      text not null check (status in ('pending', 'accepted', 'blocked')),
  requested_by uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id_a, user_id_b),
  check (user_id_a < user_id_b)  -- canonical order, evita duplicados
);

create index idx_friendships_b on public.friendships(user_id_b);

-- ─────────────────────────────────────────────────────────────────────
-- 6. AUTOESCUELAS (Fase 4 — diseñado desde ya)
-- ─────────────────────────────────────────────────────────────────────
create table public.autoescuelas (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  city            text not null,
  province        text,
  country         text not null default 'ES',
  cif             text unique,
  email_contact   text,
  phone           text,
  -- Código alfanumérico corto que el instructor pasa al alumno para vincularse
  join_code       text not null unique default upper(substring(md5(random()::text) from 1 for 6)),
  -- Plan comercial
  plan            text not null default 'trial' check (plan in ('trial', 'basic', 'pro', 'enterprise')),
  trial_ends_at   timestamptz,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_autoescuelas_city on public.autoescuelas(city) where active = true;
create index idx_autoescuelas_join_code on public.autoescuelas(join_code) where active = true;

create trigger trg_autoescuelas_updated_at
  before update on public.autoescuelas
  for each row execute function public.set_updated_at();

-- Roles dentro de una autoescuela
create table public.autoescuela_members (
  autoescuela_id  uuid not null references public.autoescuelas(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            text not null check (role in ('alumno', 'instructor', 'admin')),
  joined_at       timestamptz not null default now(),
  primary key (autoescuela_id, user_id)
);

create index idx_autoescuela_members_user on public.autoescuela_members(user_id);

-- ─────────────────────────────────────────────────────────────────────
-- 7. RECOMPENSAS CANJEABLES (Fase 5 — diseñado desde ya)
-- ─────────────────────────────────────────────────────────────────────
create table public.rewards_catalog (
  id                       uuid primary key default gen_random_uuid(),
  partner_name             text not null,       -- "McDonalds", "Concesionario Toyota Valencia"
  title                    text not null,        -- "McFlurry gratis"
  description              text not null,
  image_url                text,
  reward_type              text not null check (reward_type in ('food', 'test_drive', 'discount', 'merch', 'experience')),
  -- Requisitos JSON: { min_streak: 100, exam_passed: true, autoescuela_id: null }
  requirements             jsonb not null default '{}'::jsonb,
  max_redemptions_per_user int not null default 1,
  total_stock              int,                  -- null = ilimitado
  remaining_stock          int,
  valid_from               timestamptz not null default now(),
  valid_until              timestamptz,
  active                   boolean not null default true,
  created_at               timestamptz not null default now()
);

create index idx_rewards_active on public.rewards_catalog(active, valid_until) where active = true;

-- Canjes individuales
create table public.redemptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  reward_id           uuid not null references public.rewards_catalog(id) on delete restrict,
  -- Código alfanumérico único para mostrar al partner
  redemption_code     text not null unique default upper(substring(md5(random()::text) from 1 for 10)),
  status              text not null default 'pending' check (status in ('pending', 'approved', 'redeemed', 'rejected', 'expired')),
  -- Comprobante DGT subido (Supabase Storage URL)
  comprobante_url     text,
  rejection_reason    text,
  created_at          timestamptz not null default now(),
  approved_at         timestamptz,
  redeemed_at         timestamptz
);

create index idx_redemptions_user_recent on public.redemptions(user_id, created_at desc);
create index idx_redemptions_status_pending on public.redemptions(created_at) where status = 'pending';
create index idx_redemptions_code on public.redemptions(redemption_code);

-- ─────────────────────────────────────────────────────────────────────
-- 8. LEADERBOARD VIEW (reemplaza MOCK_FRIENDS)
-- ─────────────────────────────────────────────────────────────────────
create or replace view public.weekly_leaderboard as
  select
    p.id              as user_id,
    p.display_name    as name,
    p.avatar_emoji,
    p.profile_photo_url,
    up.weekly_xp      as xp,
    up.league,
    p.autoescuela_id,
    rank() over (partition by up.league order by up.weekly_xp desc) as rank_in_league
  from public.profiles p
  inner join public.user_progress up on up.user_id = p.id
  where p.deleted_at is null and up.weekly_xp > 0;

-- ─────────────────────────────────────────────────────────────────────
-- 9. ROW LEVEL SECURITY (CRÍTICO — activo desde día 1)
-- ─────────────────────────────────────────────────────────────────────
alter table public.profiles            enable row level security;
alter table public.user_progress       enable row level security;
alter table public.mistakes            enable row level security;
alter table public.exam_history        enable row level security;
alter table public.friendships         enable row level security;
alter table public.autoescuelas        enable row level security;
alter table public.autoescuela_members enable row level security;
alter table public.rewards_catalog     enable row level security;
alter table public.redemptions         enable row level security;

-- ── profiles ─────────────────────────────────────────────────────────
create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
-- Instructores ven perfiles de SUS alumnos (limitado a display_name + avatar)
-- → se hará vía función SECURITY DEFINER en Fase 4. Por ahora cerrado.

-- ── user_progress ────────────────────────────────────────────────────
create policy "Users read own progress"
  on public.user_progress for select using (auth.uid() = user_id);
create policy "Users upsert own progress"
  on public.user_progress for insert with check (auth.uid() = user_id);
create policy "Users update own progress"
  on public.user_progress for update using (auth.uid() = user_id);

-- ── mistakes ─────────────────────────────────────────────────────────
create policy "Users CRUD own mistakes"
  on public.mistakes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── exam_history ─────────────────────────────────────────────────────
create policy "Users insert own exams"
  on public.exam_history for insert with check (auth.uid() = user_id);
create policy "Users read own exams"
  on public.exam_history for select using (auth.uid() = user_id);

-- ── friendships ──────────────────────────────────────────────────────
create policy "Users see friendships they're in"
  on public.friendships for select
  using (auth.uid() in (user_id_a, user_id_b));
create policy "Users create friend requests"
  on public.friendships for insert
  with check (auth.uid() = requested_by and auth.uid() in (user_id_a, user_id_b));
create policy "Users update friendships they're in"
  on public.friendships for update
  using (auth.uid() in (user_id_a, user_id_b));

-- ── autoescuelas ─────────────────────────────────────────────────────
-- Cualquier autenticado lee el catálogo activo (para el selector).
create policy "Auth users list active autoescuelas"
  on public.autoescuelas for select
  using (active = true and auth.role() = 'authenticated');
-- Solo admins/instructores de la autoescuela la actualizan.
create policy "Members manage their autoescuela"
  on public.autoescuelas for update
  using (
    exists (
      select 1 from public.autoescuela_members m
      where m.autoescuela_id = id
        and m.user_id = auth.uid()
        and m.role in ('admin', 'instructor')
    )
  );

-- ── autoescuela_members ──────────────────────────────────────────────
-- Alumno ve su propia membresía. Instructor/admin de la autoescuela ve todas.
create policy "Members visible to self and staff"
  on public.autoescuela_members for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.autoescuela_members m
      where m.autoescuela_id = autoescuela_id
        and m.user_id = auth.uid()
        and m.role in ('admin', 'instructor')
    )
  );
create policy "Alumno joins via valid code"
  on public.autoescuela_members for insert
  with check (auth.uid() = user_id and role = 'alumno');
-- Staff lo gestiona vía RPC con SECURITY DEFINER (Fase 4).

-- ── rewards_catalog ──────────────────────────────────────────────────
create policy "Anyone reads active rewards"
  on public.rewards_catalog for select
  using (active = true and (valid_until is null or valid_until > now()));

-- ── redemptions ──────────────────────────────────────────────────────
create policy "Users read own redemptions"
  on public.redemptions for select using (auth.uid() = user_id);
create policy "Users request own redemption"
  on public.redemptions for insert with check (auth.uid() = user_id);
-- Aprobación / cambio de status: solo service_role (panel admin).

-- ─────────────────────────────────────────────────────────────────────
-- 10. TRIGGER: crear profile + user_progress al registrarse
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, 'Usuario'), '@', 1)
    )
  );
  insert into public.user_progress (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────
-- FIN del esquema v1.0
-- Próximas migraciones: numerar como `001_schema.sql`, `002_xxx.sql`...
-- ─────────────────────────────────────────────────────────────────────
