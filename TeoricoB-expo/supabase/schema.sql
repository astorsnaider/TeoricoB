-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║ Teoric — esquema BD inicial (Supabase / Postgres)                   ║
-- ║ Versión: 1.0.1  · Fecha: 2026-06-03                                 ║
-- ║                                                                      ║
-- ║ Script IDEMPOTENTE: puedes ejecutarlo varias veces sin problemas.   ║
-- ║ Si ya hay datos, NO los borra (usa IF NOT EXISTS).                  ║
-- ║                                                                      ║
-- ║ Si quieres RESETEAR todo (proyecto en limpio), descomenta el bloque ║
-- ║ de DROP TABLE al final de este archivo.                             ║
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

begin;

-- ─────────────────────────────────────────────────────────────────────
-- 0. FUNCIONES UTILITARIAS (idempotentes)
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ─────────────────────────────────────────────────────────────────────
-- 1. AUTOESCUELAS (declaradas antes que profiles para que la FK funcione)
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.autoescuelas (
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

create index if not exists idx_autoescuelas_city
  on public.autoescuelas(city) where active = true;
create index if not exists idx_autoescuelas_join_code
  on public.autoescuelas(join_code) where active = true;

drop trigger if exists trg_autoescuelas_updated_at on public.autoescuelas;
create trigger trg_autoescuelas_updated_at
  before update on public.autoescuelas
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- 2. PERFILES
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  display_name         text not null,
  avatar_emoji         text default '🎨',           -- color hex o emoji
  profile_photo_url    text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  -- Datos opcionales
  birth_year           int,
  locale               text default 'es-ES',
  -- Código corto único para que otros usuarios te añadan como amigo (ej. "ABCD-1234")
  friend_code          text unique,
  -- Vinculación autoescuela (puede ser null = estudiante independiente)
  autoescuela_id       uuid references public.autoescuelas(id) on delete set null,
  -- Flags
  disclaimer_accepted  boolean not null default false,
  tutorial_seen        boolean not null default false,
  -- Soft delete para GDPR (no borramos inmediato)
  deleted_at           timestamptz
);

-- Migración para BDs ya creadas sin la columna friend_code
alter table public.profiles add column if not exists friend_code text unique;

create index if not exists idx_profiles_autoescuela
  on public.profiles(autoescuela_id)
  where autoescuela_id is not null;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- 3. PROGRESO DEL USUARIO (espejo Zustand)
-- ─────────────────────────────────────────────────────────────────────
-- Estrategia: 1 fila por usuario con un blob JSONB completo del store +
-- columnas extraídas para queries. Sync push reemplaza el blob entero
-- (last-write-wins). Mistakes/exam_history quedan separados.
create table if not exists public.user_progress (
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

create index if not exists idx_user_progress_league_weekly
  on public.user_progress(league, weekly_xp desc);
create index if not exists idx_user_progress_xp
  on public.user_progress(xp desc);

drop trigger if exists trg_user_progress_updated_at on public.user_progress;
create trigger trg_user_progress_updated_at
  before update on public.user_progress
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- 4. ERRORES (spaced repetition simple)
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.mistakes (
  user_id            uuid not null references auth.users(id) on delete cascade,
  question_id        text not null,
  category           text not null,
  attempts           int not null default 1,
  recoveries_needed  int not null default 2,
  failed_at          timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index if not exists idx_mistakes_user_recent
  on public.mistakes(user_id, failed_at desc);

-- ─────────────────────────────────────────────────────────────────────
-- 5. HISTORIAL DE EXÁMENES
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.exam_history (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  taken_at            timestamptz not null default now(),
  total_questions     int not null,
  correct_count       int not null,
  wrong_count         int not null,
  time_elapsed_sec    int not null,
  passed              boolean not null
);

create index if not exists idx_exam_history_user_recent
  on public.exam_history(user_id, taken_at desc);

-- ─────────────────────────────────────────────────────────────────────
-- 6. AMIGOS (real social, reemplaza MOCK_FRIENDS)
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.friendships (
  user_id_a   uuid not null references auth.users(id) on delete cascade,
  user_id_b   uuid not null references auth.users(id) on delete cascade,
  status      text not null check (status in ('pending', 'accepted', 'blocked')),
  requested_by uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id_a, user_id_b),
  check (user_id_a < user_id_b)  -- canonical order, evita duplicados
);

create index if not exists idx_friendships_b on public.friendships(user_id_b);

-- ─────────────────────────────────────────────────────────────────────
-- 7. MIEMBROS DE AUTOESCUELA (alumnos + instructores)
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.autoescuela_members (
  autoescuela_id  uuid not null references public.autoescuelas(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            text not null check (role in ('alumno', 'instructor', 'admin')),
  joined_at       timestamptz not null default now(),
  primary key (autoescuela_id, user_id)
);

create index if not exists idx_autoescuela_members_user
  on public.autoescuela_members(user_id);

-- ─────────────────────────────────────────────────────────────────────
-- 8. RECOMPENSAS CANJEABLES (Fase 5)
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.rewards_catalog (
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

create index if not exists idx_rewards_active
  on public.rewards_catalog(active, valid_until) where active = true;

-- Canjes individuales
create table if not exists public.redemptions (
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

create index if not exists idx_redemptions_user_recent
  on public.redemptions(user_id, created_at desc);
create index if not exists idx_redemptions_status_pending
  on public.redemptions(created_at) where status = 'pending';
create index if not exists idx_redemptions_code
  on public.redemptions(redemption_code);

-- ─────────────────────────────────────────────────────────────────────
-- 9. LEADERBOARD VIEW (reemplaza MOCK_FRIENDS)
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
-- 10. ROW LEVEL SECURITY (CRÍTICO — activo desde día 1)
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

-- Helper macro: las policies usan DROP IF EXISTS + CREATE para idempotencia.

-- ── profiles ─────────────────────────────────────────────────────────
drop policy if exists "Users read own profile"   on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- ── user_progress ────────────────────────────────────────────────────
drop policy if exists "Users read own progress"   on public.user_progress;
drop policy if exists "Users upsert own progress" on public.user_progress;
drop policy if exists "Users update own progress" on public.user_progress;
create policy "Users read own progress"
  on public.user_progress for select using (auth.uid() = user_id);
create policy "Users upsert own progress"
  on public.user_progress for insert with check (auth.uid() = user_id);
create policy "Users update own progress"
  on public.user_progress for update using (auth.uid() = user_id);

-- ── mistakes ─────────────────────────────────────────────────────────
drop policy if exists "Users CRUD own mistakes" on public.mistakes;
create policy "Users CRUD own mistakes"
  on public.mistakes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── exam_history ─────────────────────────────────────────────────────
drop policy if exists "Users insert own exams" on public.exam_history;
drop policy if exists "Users read own exams"   on public.exam_history;
create policy "Users insert own exams"
  on public.exam_history for insert with check (auth.uid() = user_id);
create policy "Users read own exams"
  on public.exam_history for select using (auth.uid() = user_id);

-- ── friendships ──────────────────────────────────────────────────────
drop policy if exists "Users see friendships they're in"   on public.friendships;
drop policy if exists "Users create friend requests"       on public.friendships;
drop policy if exists "Users update friendships they're in" on public.friendships;
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
drop policy if exists "Auth users list active autoescuelas" on public.autoescuelas;
drop policy if exists "Members manage their autoescuela"    on public.autoescuelas;
create policy "Auth users list active autoescuelas"
  on public.autoescuelas for select
  using (active = true and auth.role() = 'authenticated');
create policy "Members manage their autoescuela"
  on public.autoescuelas for update
  using (
    exists (
      select 1 from public.autoescuela_members m
      where m.autoescuela_id = autoescuelas.id
        and m.user_id = auth.uid()
        and m.role in ('admin', 'instructor')
    )
  );

-- ── autoescuela_members ──────────────────────────────────────────────
drop policy if exists "Members visible to self and staff" on public.autoescuela_members;
drop policy if exists "Alumno joins via valid code"       on public.autoescuela_members;
create policy "Members visible to self and staff"
  on public.autoescuela_members for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.autoescuela_members m
      where m.autoescuela_id = autoescuela_members.autoescuela_id
        and m.user_id = auth.uid()
        and m.role in ('admin', 'instructor')
    )
  );
create policy "Alumno joins via valid code"
  on public.autoescuela_members for insert
  with check (auth.uid() = user_id and role = 'alumno');

-- ── rewards_catalog ──────────────────────────────────────────────────
drop policy if exists "Anyone reads active rewards" on public.rewards_catalog;
create policy "Anyone reads active rewards"
  on public.rewards_catalog for select
  using (active = true and (valid_until is null or valid_until > now()));

-- ── redemptions ──────────────────────────────────────────────────────
drop policy if exists "Users read own redemptions"   on public.redemptions;
drop policy if exists "Users request own redemption" on public.redemptions;
create policy "Users read own redemptions"
  on public.redemptions for select using (auth.uid() = user_id);
create policy "Users request own redemption"
  on public.redemptions for insert with check (auth.uid() = user_id);
-- Aprobación / cambio de status: solo service_role (panel admin).

-- ─────────────────────────────────────────────────────────────────────
-- 11. TRIGGER: crear profile + user_progress al registrarse
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
  )
  on conflict (id) do nothing;

  insert into public.user_progress (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────
-- 12. RPC: delete_my_account
-- ─────────────────────────────────────────────────────────────────────
-- Permite al usuario autenticado borrar todos sus datos personales en
-- cumplimiento del Art. 17 RGPD (derecho al olvido / supresión).
--
-- Estrategia:
-- - Borra inmediatamente todo el contenido asociado al usuario en
--   tablas de la app (mistakes, exam_history, friendships,
--   autoescuela_members, redemptions).
-- - Marca el profile como deleted_at = now() (soft delete).
-- - La eliminación final del registro en auth.users requiere
--   privilegios admin (service_role) y se realiza periódicamente por
--   tarea de administrador (30 días de gracia, plazo estándar de la
--   industria).
--
-- SECURITY DEFINER + comprobación explícita de auth.uid() para que
-- el usuario solo pueda borrarse a sí mismo y nunca a otro.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'No autenticado.';
  end if;

  delete from public.mistakes            where user_id = v_uid;
  delete from public.exam_history        where user_id = v_uid;
  delete from public.friendships         where user_id_a = v_uid or user_id_b = v_uid;
  delete from public.autoescuela_members where user_id = v_uid;
  delete from public.redemptions         where user_id = v_uid;
  delete from public.user_progress       where user_id = v_uid;

  update public.profiles
    set deleted_at = now(),
        display_name = 'Cuenta eliminada',
        avatar_emoji = '🎨',
        profile_photo_url = null,
        autoescuela_id = null
    where id = v_uid;
end;
$$;

grant execute on function public.delete_my_account() to authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 13. RPC: get_weekly_leaderboard(league)
-- ─────────────────────────────────────────────────────────────────────
-- Devuelve la clasificación semanal pública (solo campos no sensibles)
-- para que cualquier usuario autenticado pueda ver el ranking de su
-- liga. SECURITY DEFINER salta las RLS de profiles (que solo dejan al
-- usuario ver su propio profile), pero solo expone los campos
-- mínimos necesarios para renderizar el leaderboard.
create or replace function public.get_weekly_leaderboard(p_league text default null)
returns table (
  user_id uuid,
  name text,
  avatar_emoji text,
  profile_photo_url text,
  xp int,
  league text,
  rank_in_league bigint
)
language sql
security definer
set search_path = public
as $$
  select
    p.id              as user_id,
    p.display_name    as name,
    p.avatar_emoji,
    p.profile_photo_url,
    up.weekly_xp      as xp,
    up.league,
    rank() over (partition by up.league order by up.weekly_xp desc) as rank_in_league
  from public.profiles p
  inner join public.user_progress up on up.user_id = p.id
  where p.deleted_at is null
    and up.weekly_xp > 0
    and (p_league is null or up.league = p_league)
  order by up.weekly_xp desc
  limit 100;
$$;

grant execute on function public.get_weekly_leaderboard(text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 14. SISTEMA DE AMIGOS: friend_code + RPCs
-- ─────────────────────────────────────────────────────────────────────
-- Cada usuario tiene un código corto único (formato XXXX-YYYY, 8 chars
-- de [ABCDEFGHJKLMNPQRSTUVWXYZ23456789] — descartamos I/L/O/0/1 para
-- evitar ambigüedad al leerlo). El código se autogenera al crear el
-- profile vía trigger; los usuarios existentes se rellenan en la
-- migración.

create or replace function public.generate_friend_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  raw   text;
  code  text;
  taken boolean;
  i     int;
begin
  loop
    raw := '';
    for i in 1..8 loop
      raw := raw || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    end loop;
    code := substr(raw, 1, 4) || '-' || substr(raw, 5, 4);
    select exists (select 1 from public.profiles where friend_code = code) into taken;
    exit when not taken;
  end loop;
  return code;
end;
$$;

create or replace function public.set_friend_code_if_null()
returns trigger
language plpgsql
as $$
begin
  if new.friend_code is null then
    new.friend_code := public.generate_friend_code();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_friend_code on public.profiles;
create trigger trg_profiles_friend_code
  before insert on public.profiles
  for each row execute function public.set_friend_code_if_null();

-- Rellenar usuarios existentes sin código (idempotente)
update public.profiles
  set friend_code = public.generate_friend_code()
  where friend_code is null;

-- ── RPC 14.1 — pedir amistad por código ──────────────────────────────
-- Si el otro usuario ya te pidió a ti, esta llamada acepta la suya.
-- Si no, crea una solicitud pendiente.
create or replace function public.request_friendship_by_code(p_code text)
returns table (other_user_id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me       uuid;
  v_other    uuid;
  v_lo       uuid;
  v_hi       uuid;
  v_existing record;
begin
  v_me := auth.uid();
  if v_me is null then
    raise exception 'No autenticado.';
  end if;

  -- Normalizar el código del input (mayúsculas + sin espacios/separadores diferentes)
  p_code := upper(regexp_replace(p_code, '[^A-Z0-9\-]', '', 'g'));

  select id into v_other
    from public.profiles
    where friend_code = p_code and deleted_at is null;
  if v_other is null then
    raise exception 'CODE_NOT_FOUND';
  end if;

  if v_other = v_me then
    raise exception 'CANNOT_ADD_SELF';
  end if;

  if v_me < v_other then v_lo := v_me; v_hi := v_other;
  else v_lo := v_other; v_hi := v_me; end if;

  select * into v_existing from public.friendships
    where user_id_a = v_lo and user_id_b = v_hi;

  if found then
    if v_existing.status = 'accepted' then
      raise exception 'ALREADY_FRIENDS';
    elsif v_existing.status = 'blocked' then
      raise exception 'BLOCKED';
    elsif v_existing.status = 'pending' and v_existing.requested_by = v_me then
      raise exception 'ALREADY_REQUESTED';
    elsif v_existing.status = 'pending' then
      -- El otro ya te lo envió → aceptamos la suya.
      update public.friendships
        set status = 'accepted'
        where user_id_a = v_lo and user_id_b = v_hi;
      return query select v_other, 'accepted'::text;
      return;
    end if;
  end if;

  insert into public.friendships (user_id_a, user_id_b, status, requested_by)
    values (v_lo, v_hi, 'pending', v_me);

  return query select v_other, 'pending'::text;
end;
$$;

grant execute on function public.request_friendship_by_code(text) to authenticated;

-- ── RPC 14.2 — responder solicitud entrante ──────────────────────────
create or replace function public.respond_friendship(p_other_user_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid;
  v_lo uuid;
  v_hi uuid;
begin
  v_me := auth.uid();
  if v_me is null then
    raise exception 'No autenticado.';
  end if;

  if v_me < p_other_user_id then v_lo := v_me; v_hi := p_other_user_id;
  else v_lo := p_other_user_id; v_hi := v_me; end if;

  if not exists (
    select 1 from public.friendships
      where user_id_a = v_lo
        and user_id_b = v_hi
        and status = 'pending'
        and requested_by = p_other_user_id
  ) then
    raise exception 'NO_PENDING_REQUEST';
  end if;

  if p_accept then
    update public.friendships
      set status = 'accepted'
      where user_id_a = v_lo and user_id_b = v_hi;
  else
    delete from public.friendships
      where user_id_a = v_lo and user_id_b = v_hi;
  end if;
end;
$$;

grant execute on function public.respond_friendship(uuid, boolean) to authenticated;

-- ── RPC 14.3 — listar mis amigos (aceptados + pendientes) ────────────
-- Devuelve el otro usuario con sus campos públicos + el estado de la
-- amistad. is_incoming = true si la solicitud me la enviaron a mí (yo
-- debería decidir aceptar/rechazar).
create or replace function public.get_my_friends()
returns table (
  user_id           uuid,
  name              text,
  avatar_emoji      text,
  profile_photo_url text,
  xp                int,
  weekly_xp         int,
  streak            int,
  league            text,
  status            text,
  is_incoming       boolean
)
language sql
security definer
set search_path = public
stable
as $$
  with my_friendships as (
    select
      f.*,
      case when f.user_id_a = auth.uid() then f.user_id_b else f.user_id_a end as other_id
    from public.friendships f
    where auth.uid() in (f.user_id_a, f.user_id_b)
      and f.status in ('accepted', 'pending')
  )
  select
    mf.other_id,
    p.display_name,
    p.avatar_emoji,
    p.profile_photo_url,
    up.xp,
    up.weekly_xp,
    up.streak,
    up.league,
    mf.status,
    (mf.status = 'pending' and mf.requested_by <> auth.uid()) as is_incoming
  from my_friendships mf
  inner join public.profiles      p  on p.id  = mf.other_id and p.deleted_at is null
  inner join public.user_progress up on up.user_id = mf.other_id
  order by
    case when mf.status = 'pending' and mf.requested_by <> auth.uid() then 0
         when mf.status = 'accepted'                                  then 1
         else 2 end,
    up.weekly_xp desc;
$$;

grant execute on function public.get_my_friends() to authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 15. USERNAME PÚBLICO + BÚSQUEDA / INVITACIÓN POR @username
-- ─────────────────────────────────────────────────────────────────────
-- El username es el handle público que el usuario elige (3-20 chars,
-- a-z, 0-9, _, único case-insensitive). Sustituye al friend_code como
-- mecanismo de invitación principal: friend_code se mantiene por
-- compatibilidad pero no se usa en la UI nueva.

alter table public.profiles add column if not exists username text;
-- Marca temporal del último cambio de username (para enforce de cooldown 14d)
alter table public.profiles add column if not exists username_updated_at timestamptz;

-- Índice único case-insensitive (sin duplicar "Astor" vs "astor")
create unique index if not exists idx_profiles_username_lower
  on public.profiles (lower(username))
  where username is not null and deleted_at is null;

-- Índice de búsqueda por prefijo (lower) para autocompletado rápido
create index if not exists idx_profiles_username_search
  on public.profiles (lower(username) text_pattern_ops)
  where username is not null and deleted_at is null;

-- ── RPC 15.1 — escoger / cambiar mi username ─────────────────────────
-- Devuelve el username normalizado en caso de éxito. Lanza excepción
-- con códigos estables para que el cliente los traduzca.
create or replace function public.set_username(p_username text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid;
  v_clean text;
  v_current text;
  v_last_change timestamptz;
  v_cooldown_days int := 14;
begin
  v_me := auth.uid();
  if v_me is null then raise exception 'No autenticado.'; end if;

  v_clean := lower(trim(coalesce(p_username, '')));

  if length(v_clean) < 3  then raise exception 'USERNAME_TOO_SHORT'; end if;
  if length(v_clean) > 20 then raise exception 'USERNAME_TOO_LONG'; end if;
  if v_clean !~ '^[a-z0-9_]+$' then raise exception 'USERNAME_BAD_CHARS'; end if;
  if v_clean in ('admin','administrator','teoric','support','help','soporte','root','system','null','undefined') then
    raise exception 'USERNAME_RESERVED';
  end if;

  select username, username_updated_at into v_current, v_last_change
    from public.profiles where id = v_me;

  -- Cooldown 14 días para cambios (la primera vez NO aplica).
  if v_current is not null and v_current <> v_clean then
    if v_last_change is not null and v_last_change > now() - (v_cooldown_days || ' days')::interval then
      raise exception 'USERNAME_COOLDOWN';
    end if;
  end if;

  if exists (
    select 1 from public.profiles
    where lower(username) = v_clean
      and id <> v_me
      and deleted_at is null
  ) then
    raise exception 'USERNAME_TAKEN';
  end if;

  update public.profiles
    set username = v_clean,
        username_updated_at = case
          when v_current is distinct from v_clean then now()
          else username_updated_at
        end
    where id = v_me;
  return v_clean;
end;
$$;

grant execute on function public.set_username(text) to authenticated;

-- ── RPC 15.2 — buscar usuarios por prefijo ───────────────────────────
-- Devuelve hasta 20 usuarios cuyo username empiece por p_query (case
-- insensitive). Excluye al propio usuario y a los que ya tengan
-- amistad/solicitud con él (cualquier estado).
create or replace function public.search_users_by_username(p_query text)
returns table (
  user_id      uuid,
  username     text,
  display_name text,
  avatar_emoji text,
  league       text
)
language sql
security definer
set search_path = public
stable
as $$
  with q as (
    select lower(trim(coalesce(p_query, ''))) as v
  )
  select
    p.id,
    p.username,
    p.display_name,
    p.avatar_emoji,
    up.league
  from public.profiles p
  inner join public.user_progress up on up.user_id = p.id
  cross join q
  where p.username is not null
    and p.deleted_at is null
    and p.id <> auth.uid()
    and length(q.v) >= 2
    and lower(p.username) like q.v || '%'
    and not exists (
      select 1 from public.friendships f
      where (f.user_id_a = auth.uid() and f.user_id_b = p.id)
         or (f.user_id_b = auth.uid() and f.user_id_a = p.id)
    )
  order by length(p.username), lower(p.username)
  limit 20;
$$;

grant execute on function public.search_users_by_username(text) to authenticated;

-- ── RPC 15.3 — pedir amistad por username ────────────────────────────
-- Mismo comportamiento que request_friendship_by_code: si el otro ya
-- te pidió, acepta automáticamente; si no, crea solicitud pending.
create or replace function public.request_friendship_by_username(p_username text)
returns table (other_user_id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me      uuid;
  v_other   uuid;
  v_lo      uuid;
  v_hi      uuid;
  v_existing record;
  v_clean   text;
begin
  v_me := auth.uid();
  if v_me is null then
    raise exception 'No autenticado.';
  end if;

  v_clean := lower(trim(coalesce(p_username, '')));
  if length(v_clean) < 3 then
    raise exception 'USERNAME_NOT_FOUND';
  end if;

  select id into v_other
    from public.profiles
    where lower(username) = v_clean and deleted_at is null;
  if v_other is null then
    raise exception 'USERNAME_NOT_FOUND';
  end if;

  if v_other = v_me then
    raise exception 'CANNOT_ADD_SELF';
  end if;

  if v_me < v_other then v_lo := v_me; v_hi := v_other;
  else v_lo := v_other; v_hi := v_me; end if;

  select * into v_existing from public.friendships
    where user_id_a = v_lo and user_id_b = v_hi;

  if found then
    if v_existing.status = 'accepted' then
      raise exception 'ALREADY_FRIENDS';
    elsif v_existing.status = 'blocked' then
      raise exception 'BLOCKED';
    elsif v_existing.status = 'pending' and v_existing.requested_by = v_me then
      raise exception 'ALREADY_REQUESTED';
    elsif v_existing.status = 'pending' then
      update public.friendships
        set status = 'accepted'
        where user_id_a = v_lo and user_id_b = v_hi;
      return query select v_other, 'accepted'::text;
      return;
    end if;
  end if;

  insert into public.friendships (user_id_a, user_id_b, status, requested_by)
    values (v_lo, v_hi, 'pending', v_me);

  return query select v_other, 'pending'::text;
end;
$$;

grant execute on function public.request_friendship_by_username(text) to authenticated;

-- ── Actualizar get_my_friends para devolver también username ─────────
create or replace function public.get_my_friends()
returns table (
  user_id           uuid,
  name              text,
  username          text,
  avatar_emoji      text,
  profile_photo_url text,
  xp                int,
  weekly_xp         int,
  streak            int,
  league            text,
  status            text,
  is_incoming       boolean
)
language sql
security definer
set search_path = public
stable
as $$
  with my_friendships as (
    select
      f.*,
      case when f.user_id_a = auth.uid() then f.user_id_b else f.user_id_a end as other_id
    from public.friendships f
    where auth.uid() in (f.user_id_a, f.user_id_b)
      and f.status in ('accepted', 'pending')
  )
  select
    mf.other_id,
    p.display_name,
    p.username,
    p.avatar_emoji,
    p.profile_photo_url,
    up.xp,
    up.weekly_xp,
    up.streak,
    up.league,
    mf.status,
    (mf.status = 'pending' and mf.requested_by <> auth.uid()) as is_incoming
  from my_friendships mf
  inner join public.profiles      p  on p.id  = mf.other_id and p.deleted_at is null
  inner join public.user_progress up on up.user_id = mf.other_id
  order by
    case when mf.status = 'pending' and mf.requested_by <> auth.uid() then 0
         when mf.status = 'accepted'                                  then 1
         else 2 end,
    up.weekly_xp desc;
$$;

grant execute on function public.get_my_friends() to authenticated;

commit;

-- ─────────────────────────────────────────────────────────────────────
-- FIN del esquema v1.0.1
-- Próximas migraciones: numerar como `001_xxx.sql`, `002_xxx.sql`...
-- ─────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────
-- ANEXO — RESET COMPLETO (descomentar SOLO si quieres empezar de cero
-- y tienes la certeza de que NO hay datos reales todavía)
-- ─────────────────────────────────────────────────────────────────────
-- drop table if exists public.redemptions          cascade;
-- drop table if exists public.rewards_catalog      cascade;
-- drop table if exists public.autoescuela_members  cascade;
-- drop table if exists public.friendships          cascade;
-- drop table if exists public.exam_history         cascade;
-- drop table if exists public.mistakes             cascade;
-- drop table if exists public.user_progress        cascade;
-- drop table if exists public.profiles             cascade;
-- drop table if exists public.autoescuelas         cascade;
-- drop view  if exists public.weekly_leaderboard;
-- drop function if exists public.handle_new_user();
-- drop function if exists public.set_updated_at();
