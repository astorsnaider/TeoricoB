/**
 * Tipos TypeScript espejo del esquema Supabase (supabase/schema.sql).
 *
 * Cuando cambies el esquema SQL, actualiza este archivo a mano. En el
 * futuro lo generaremos automáticamente con `supabase gen types`.
 */

export type LeagueName =
  | 'Bronce' | 'Plata' | 'Oro' | 'Zafiro'
  | 'Rubí' | 'Esmeralda' | 'Amatista' | 'Diamante';

export type AutoescuelaPlan = 'trial' | 'basic' | 'pro' | 'enterprise';
export type AutoescuelaRole = 'alumno' | 'instructor' | 'admin';
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';
export type RewardType = 'food' | 'test_drive' | 'discount' | 'merch' | 'experience';
export type RedemptionStatus = 'pending' | 'approved' | 'redeemed' | 'rejected' | 'expired';

// ─── Row types (lo que devuelve Supabase) ─────────────────────────────

export interface ProfileRow {
  id: string;
  display_name: string;
  avatar_emoji: string;
  profile_photo_url: string | null;
  created_at: string;
  updated_at: string;
  birth_year: number | null;
  locale: string;
  autoescuela_id: string | null;
  disclaimer_accepted: boolean;
  tutorial_seen: boolean;
  deleted_at: string | null;
}

// NOTA: tipos Insert/Update declarados con `type` (no `interface`)
// intencionalmente. Los type literals son estructuralmente asignables a
// Record<string, unknown> (el constraint que pide @supabase/supabase-js
// en GenericTable.Insert), mientras que las interfaces nombradas NO lo
// son. Si conviertes esto a `interface`, el tipado del cliente colapsa
// a `never` y todos los upsert/select fallan en compilación.
export type UserProgressInsert = {
  user_id: string;
  xp?: number;
  weekly_xp?: number;
  weekly_reset_at?: string;
  streak?: number;
  hearts?: number;
  gems?: number;
  league?: LeagueName;
  last_active_date?: string | null;
  total_correct?: number;
  total_answered?: number;
  state_blob?: Record<string, unknown>;
  schema_version?: number;
  updated_at?: string;
};

export type ProfileInsert = {
  id: string;
  display_name: string;
  avatar_emoji?: string;
  profile_photo_url?: string | null;
  birth_year?: number | null;
  locale?: string;
  autoescuela_id?: string | null;
  disclaimer_accepted?: boolean;
  tutorial_seen?: boolean;
};

export interface UserProgressRow {
  user_id: string;
  xp: number;
  weekly_xp: number;
  weekly_reset_at: string;
  streak: number;
  hearts: number;
  gems: number;
  league: LeagueName;
  last_active_date: string | null;
  total_correct: number;
  total_answered: number;
  state_blob: Record<string, unknown>;
  schema_version: number;
  updated_at: string;
}

export interface MistakeRow {
  user_id: string;
  question_id: string;
  category: string;
  attempts: number;
  recoveries_needed: number;
  failed_at: string;
}

export interface ExamHistoryRow {
  id: string;
  user_id: string;
  taken_at: string;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  time_elapsed_sec: number;
  passed: boolean;
}

export interface FriendshipRow {
  user_id_a: string;
  user_id_b: string;
  status: FriendshipStatus;
  requested_by: string;
  created_at: string;
}

export interface AutoescuelaRow {
  id: string;
  name: string;
  city: string;
  province: string | null;
  country: string;
  cif: string | null;
  email_contact: string | null;
  phone: string | null;
  join_code: string;
  plan: AutoescuelaPlan;
  trial_ends_at: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AutoescuelaMemberRow {
  autoescuela_id: string;
  user_id: string;
  role: AutoescuelaRole;
  joined_at: string;
}

export interface RewardCatalogRow {
  id: string;
  partner_name: string;
  title: string;
  description: string;
  image_url: string | null;
  reward_type: RewardType;
  requirements: {
    min_streak?: number;
    min_xp?: number;
    exam_passed?: boolean;
    autoescuela_id?: string;
    [key: string]: unknown;
  };
  max_redemptions_per_user: number;
  total_stock: number | null;
  remaining_stock: number | null;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  created_at: string;
}

export interface RedemptionRow {
  id: string;
  user_id: string;
  reward_id: string;
  redemption_code: string;
  status: RedemptionStatus;
  comprobante_url: string | null;
  rejection_reason: string | null;
  created_at: string;
  approved_at: string | null;
  redeemed_at: string | null;
}

export interface WeeklyLeaderboardRow {
  user_id: string;
  name: string;
  avatar_emoji: string;
  profile_photo_url: string | null;
  xp: number;
  league: LeagueName;
  autoescuela_id: string | null;
  rank_in_league: number;
}

// ─── Database "shape" (lo que consume @supabase/supabase-js) ──────────
// Estructura mínima para tipar el cliente. Cuando integremos
// `supabase gen types`, esto se autogenera.

// `Loose<T>` añade un index signature al tipo. Es necesario para que
// las interfaces nombradas satisfagan `Record<string, unknown>`, que es
// el constraint de `GenericTable.Row` en @supabase/postgrest-js. Sin
// esto, todos los upsert/select fallan en compilación con `never`.
// Las interfaces siguen estrictas en su uso normal; solo aquí se
// "afloran" para Postgrest.
type Loose<T> = T & Record<string, unknown>;

type AnyRecord = Record<string, unknown>;

export interface Database {
  public: {
    Tables: {
      profiles:            { Row: Loose<ProfileRow>;           Insert: ProfileInsert;        Update: ProfileInsert;       Relationships: [] };
      user_progress:       { Row: Loose<UserProgressRow>;      Insert: UserProgressInsert;   Update: UserProgressInsert;  Relationships: [] };
      mistakes:            { Row: Loose<MistakeRow>;           Insert: Loose<MistakeRow>;    Update: AnyRecord;           Relationships: [] };
      exam_history:        { Row: Loose<ExamHistoryRow>;       Insert: AnyRecord;            Update: AnyRecord;           Relationships: [] };
      friendships:         { Row: Loose<FriendshipRow>;        Insert: Loose<FriendshipRow>; Update: AnyRecord;           Relationships: [] };
      autoescuelas:        { Row: Loose<AutoescuelaRow>;       Insert: AnyRecord;            Update: AnyRecord;           Relationships: [] };
      autoescuela_members: { Row: Loose<AutoescuelaMemberRow>; Insert: Loose<AutoescuelaMemberRow>; Update: AnyRecord;    Relationships: [] };
      rewards_catalog:     { Row: Loose<RewardCatalogRow>;     Insert: AnyRecord;            Update: AnyRecord;           Relationships: [] };
      redemptions:         { Row: Loose<RedemptionRow>;        Insert: AnyRecord;            Update: AnyRecord;           Relationships: [] };
    };
    Views: {
      weekly_leaderboard: { Row: Loose<WeeklyLeaderboardRow>; Relationships: [] };
    };
    Functions: Record<never, never>;
  };
}
