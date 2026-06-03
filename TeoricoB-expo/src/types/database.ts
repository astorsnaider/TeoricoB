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

export interface Database {
  public: {
    Tables: {
      profiles:            { Row: ProfileRow;            Insert: Partial<ProfileRow>            & { id: string; display_name: string }; Update: Partial<ProfileRow> };
      user_progress:       { Row: UserProgressRow;       Insert: Partial<UserProgressRow>       & { user_id: string };                  Update: Partial<UserProgressRow> };
      mistakes:            { Row: MistakeRow;            Insert: MistakeRow;                                                            Update: Partial<MistakeRow> };
      exam_history:        { Row: ExamHistoryRow;        Insert: Omit<ExamHistoryRow, 'id' | 'taken_at'> & { id?: string; taken_at?: string }; Update: Partial<ExamHistoryRow> };
      friendships:         { Row: FriendshipRow;         Insert: FriendshipRow;                                                         Update: Partial<FriendshipRow> };
      autoescuelas:        { Row: AutoescuelaRow;        Insert: Partial<AutoescuelaRow>        & { name: string; city: string };       Update: Partial<AutoescuelaRow> };
      autoescuela_members: { Row: AutoescuelaMemberRow;  Insert: AutoescuelaMemberRow;                                                  Update: Partial<AutoescuelaMemberRow> };
      rewards_catalog:     { Row: RewardCatalogRow;      Insert: Partial<RewardCatalogRow>      & { partner_name: string; title: string; description: string; reward_type: RewardType }; Update: Partial<RewardCatalogRow> };
      redemptions:         { Row: RedemptionRow;         Insert: Partial<RedemptionRow>         & { user_id: string; reward_id: string }; Update: Partial<RedemptionRow> };
    };
    Views: {
      weekly_leaderboard: { Row: WeeklyLeaderboardRow };
    };
  };
}
