/**
 * useLeaderboard — clasificación semanal real desde Supabase.
 *
 * Llama a la función RPC `get_weekly_leaderboard(league)` que devuelve
 * todos los jugadores activos de la misma liga ordenados por XP
 * semanal. Solo expone campos públicos (name, avatar, xp, rank).
 *
 * Comportamiento:
 * - Sin sesión iniciada: devuelve { available: false }. Las pantallas
 *   pueden mostrar un fallback (banner CTA "Inicia sesión para ver
 *   la liga real") o caer al ranking simulado del store.
 * - Con sesión: hace fetch al montar y cuando cambia `league`. Refresca
 *   automáticamente cada 60 s mientras la pantalla está montada.
 *   Expone `refresh()` para pull-to-refresh manual.
 */
import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../api/supabase';
import { useAuth } from '../auth/AuthContext';
import { LeagueType, LeagueStanding } from '../types';

interface LeaderboardState {
  available: boolean;
  loading: boolean;
  standings: LeagueStanding[];
  error: string | null;
  refresh: () => void;
}

interface RpcRow {
  user_id: string;
  name: string;
  avatar_emoji: string;
  profile_photo_url: string | null;
  xp: number;
  league: string;
  rank_in_league: number;
}

const REFRESH_MS = 60_000;

export function useLeaderboard(league: LeagueType | undefined): LeaderboardState {
  const { user } = useAuth();
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!isSupabaseConfigured || !user || !league) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    type RpcResult = { data: RpcRow[] | null; error: { message: string } | null };
    const rpc = supabase.rpc as unknown as (
      name: string,
      args: Record<string, unknown>,
    ) => Promise<RpcResult>;

    rpc('get_weekly_leaderboard', { p_league: league }).then(({ data, error }) => {
      if (cancelled) return;
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      const rows = (data ?? []) as RpcRow[];
      const mapped: LeagueStanding[] = rows.map(row => ({
        name: row.name,
        avatarEmoji: row.avatar_emoji,
        xp: row.xp,
        rank: Number(row.rank_in_league),
        isCurrentUser: row.user_id === user.id,
      }));
      setStandings(mapped);
    });

    return () => {
      cancelled = true;
    };
  }, [user, league, tick]);

  // Auto-refresh cada 60s mientras la pantalla esté montada
  useEffect(() => {
    if (!user) return;
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [user, refresh]);

  return {
    available: Boolean(isSupabaseConfigured && user),
    loading,
    standings,
    error,
    refresh,
  };
}
