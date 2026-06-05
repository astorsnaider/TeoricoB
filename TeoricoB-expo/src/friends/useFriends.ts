/**
 * useFriends — capa cliente del sistema de amistades.
 *
 * Backend (Supabase RPC, ver supabase/schema.sql §14):
 * - get_my_friends() → lista amigos aceptados + solicitudes pendientes.
 * - request_friendship_by_code(code) → enviar petición o auto-aceptar
 *   si el otro ya te pidió.
 * - respond_friendship(uuid, accept) → aceptar/rechazar pendientes.
 *
 * Auto-refresh cada 60s mientras el hook está montado; refresh() manual
 * disponible para llamar tras aceptar/añadir.
 *
 * Si no hay sesión Supabase, retorna available=false con listas vacías
 * — la UI debe mostrar fallback ("Inicia sesión para usar amigos").
 */
import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../api/supabase';
import { useAuth } from '../auth/AuthContext';
import { LeagueType } from '../types';

export interface FriendEntry {
  userId: string;
  name: string;
  avatarEmoji: string;
  profilePhotoUrl: string | null;
  xp: number;
  weeklyXP: number;
  streak: number;
  league: LeagueType;
  status: 'pending' | 'accepted';
  /** True si la solicitud me llegó a mí (yo debo decidir). */
  isIncoming: boolean;
}

interface RpcRow {
  user_id: string;
  name: string;
  avatar_emoji: string;
  profile_photo_url: string | null;
  xp: number;
  weekly_xp: number;
  streak: number;
  league: LeagueType;
  status: 'pending' | 'accepted';
  is_incoming: boolean;
}

export interface FriendsState {
  available: boolean;
  loading: boolean;
  /** Mi propio friend_code para compartir (ej. "ABCD-1234"). */
  myCode: string | null;
  /** Solo amistades aceptadas. */
  friends: FriendEntry[];
  /** Solicitudes que ME han enviado (yo decido). */
  incoming: FriendEntry[];
  /** Solicitudes que YO envié (esperando respuesta). */
  outgoing: FriendEntry[];
  error: string | null;
  refresh: () => void;
  addFriendByCode: (code: string) => Promise<{ ok: boolean; status?: 'pending' | 'accepted'; error?: string }>;
  acceptFriend: (otherUserId: string) => Promise<{ ok: boolean; error?: string }>;
  rejectFriend: (otherUserId: string) => Promise<{ ok: boolean; error?: string }>;
}

const REFRESH_MS = 60_000;

function friendlyError(raw: string): string {
  switch (raw) {
    case 'CODE_NOT_FOUND':    return 'Ese código no existe o esa cuenta fue eliminada.';
    case 'CANNOT_ADD_SELF':   return 'No puedes añadirte a ti mismo.';
    case 'ALREADY_FRIENDS':   return 'Ya sois amigos.';
    case 'ALREADY_REQUESTED': return 'Ya enviaste la solicitud, está pendiente de respuesta.';
    case 'BLOCKED':           return 'No es posible establecer amistad con esa cuenta.';
    case 'NO_PENDING_REQUEST': return 'Esa solicitud ya no está disponible.';
    case 'No autenticado.':   return 'Inicia sesión para gestionar amigos.';
    default:                   return raw;
  }
}

// Wrapper que mantiene el `this` binding al llamar supabase.rpc
async function callRpc<T>(name: string, args: Record<string, unknown> = {}): Promise<{ data: T | null; error: { message: string } | null }> {
  try {
    return await (supabase as unknown as {
      rpc: (name: string, args: Record<string, unknown>) => Promise<{
        data: T | null;
        error: { message: string } | null;
      }>;
    }).rpc(name, args);
  } catch (e) {
    return { data: null, error: { message: e instanceof Error ? e.message : 'Error de red' } };
  }
}

export function useFriends(): FriendsState {
  const { user, profile } = useAuth();
  const [rows, setRows] = useState<FriendEntry[]>([]);
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
      const { data, error: rpcError } = await callRpc<RpcRow[]>('get_my_friends');
      if (cancelled) return;
      setLoading(false);
      if (rpcError) {
        if (__DEV__) console.warn('[friends] fetch error:', rpcError.message);
        setError(friendlyError(rpcError.message));
        return;
      }
      const mapped: FriendEntry[] = (data ?? []).map(r => ({
        userId: r.user_id,
        name: r.name,
        avatarEmoji: r.avatar_emoji,
        profilePhotoUrl: r.profile_photo_url,
        xp: r.xp,
        weeklyXP: r.weekly_xp,
        streak: r.streak,
        league: r.league,
        status: r.status,
        isIncoming: r.is_incoming,
      }));
      setRows(mapped);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, tick]);

  // Auto-refresh cada 60s
  useEffect(() => {
    if (!user) return;
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [user, refresh]);

  const addFriendByCode = useCallback(async (code: string) => {
    if (!isSupabaseConfigured || !user) {
      return { ok: false, error: 'Inicia sesión para gestionar amigos.' };
    }
    const { data, error: rpcError } = await callRpc<{ other_user_id: string; status: 'pending' | 'accepted' }[]>(
      'request_friendship_by_code',
      { p_code: code },
    );
    if (rpcError) {
      return { ok: false, error: friendlyError(rpcError.message) };
    }
    // data es un array de 1 fila (returns table)
    const status = data?.[0]?.status;
    refresh();
    return { ok: true, status };
  }, [user, refresh]);

  const acceptFriend = useCallback(async (otherUserId: string) => {
    const { error: rpcError } = await callRpc<null>('respond_friendship', {
      p_other_user_id: otherUserId,
      p_accept: true,
    });
    if (rpcError) return { ok: false, error: friendlyError(rpcError.message) };
    refresh();
    return { ok: true };
  }, [refresh]);

  const rejectFriend = useCallback(async (otherUserId: string) => {
    const { error: rpcError } = await callRpc<null>('respond_friendship', {
      p_other_user_id: otherUserId,
      p_accept: false,
    });
    if (rpcError) return { ok: false, error: friendlyError(rpcError.message) };
    refresh();
    return { ok: true };
  }, [refresh]);

  const friends = rows.filter(r => r.status === 'accepted');
  const incoming = rows.filter(r => r.status === 'pending' && r.isIncoming);
  const outgoing = rows.filter(r => r.status === 'pending' && !r.isIncoming);

  return {
    available: Boolean(isSupabaseConfigured && user),
    loading,
    myCode: profile?.friend_code ?? null,
    friends,
    incoming,
    outgoing,
    error,
    refresh,
    addFriendByCode,
    acceptFriend,
    rejectFriend,
  };
}
