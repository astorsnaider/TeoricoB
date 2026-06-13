/**
 * useCohort — liga semanal por cohortes (estilo Duolingo).
 *
 * Llama a la RPC `sync_league()` que (1) finaliza la cohorte de la semana
 * pasada si quedó pendiente y aplica ascensos/descensos, (2) me asigna a
 * una cohorte de la semana actual, (3) snapshotea mi score y (4) devuelve
 * el estado completo de mi cohorte como jsonb.
 *
 * - Sin sesión: { available: false }.
 * - Con sesión: sync al montar + cada 60s + refresh() manual.
 * - Aplica la liga competitiva del servidor al store (autoritativa) y
 *   expone `lastResult` (para el modal/recompensa de cierre de semana).
 */
import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../api/supabase';
import { useAuth } from '../auth/AuthContext';
import { useStore } from '../store/useStore';
import { LeagueType } from '../types';

export interface CohortMember {
  userId: string;
  name: string;
  avatarEmoji: string;
  profilePhotoUrl: string | null;
  score: number;
  rank: number;
  isMe: boolean;
}

export interface CohortResult {
  result: 'promoted' | 'relegated' | 'stayed';
  weekStart: string;
}

export interface CohortState {
  available: boolean;
  loading: boolean;
  league: LeagueType | null;
  weekEnd: string | null;       // ISO de cuándo termina la semana
  promoteCount: number;
  relegateCount: number;
  members: CohortMember[];
  lastResult: CohortResult | null;
  error: string | null;
  refresh: () => void;
}

interface RawCohort {
  league: string;
  week_start: string;
  week_end: string;
  promote: number;
  relegate: number;
  cohort_size: number;
  last_result: { result: string; week_start: string } | null;
  members: {
    user_id: string;
    name: string;
    avatar_emoji: string;
    profile_photo_url: string | null;
    score: number;
    rank: number;
    is_me: boolean;
  }[];
}

const REFRESH_MS = 60_000;

export function useCohort(): CohortState {
  const { user } = useAuth();
  const applyServerLeague = useStore(s => s.applyServerLeague);
  const [raw, setRaw] = useState<RawCohort | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data, error: rpcError } = await (supabase as unknown as {
          rpc: (name: string, args?: Record<string, unknown>) => Promise<{
            data: RawCohort | null; error: { message: string } | null;
          }>;
        }).rpc('sync_league');
        if (cancelled) return;
        setLoading(false);
        if (rpcError) { setError(rpcError.message); return; }
        if (data) {
          setRaw(data);
          applyServerLeague(data.league as LeagueType);
        }
      } catch (e) {
        if (cancelled) return;
        setLoading(false);
        const msg = e instanceof Error ? e.message : 'Error de red';
        if (__DEV__) console.warn('[cohort] sync error:', msg);
        setError(msg);
      }
    })();

    return () => { cancelled = true; };
  }, [user, tick, applyServerLeague]);

  // Auto-refresh cada 60s
  useEffect(() => {
    if (!user) return;
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [user, refresh]);

  const members: CohortMember[] = (raw?.members ?? []).map(m => ({
    userId: m.user_id,
    name: m.name,
    avatarEmoji: m.avatar_emoji,
    profilePhotoUrl: m.profile_photo_url,
    score: m.score,
    rank: Number(m.rank),
    isMe: m.is_me,
  }));

  const lastResult: CohortResult | null = raw?.last_result
    ? { result: raw.last_result.result as CohortResult['result'], weekStart: raw.last_result.week_start }
    : null;

  return {
    available: Boolean(isSupabaseConfigured && user),
    loading,
    league: (raw?.league as LeagueType) ?? null,
    weekEnd: raw?.week_end ?? null,
    promoteCount: raw?.promote ?? 7,
    relegateCount: raw?.relegate ?? 5,
    members,
    lastResult,
    error,
    refresh,
  };
}
