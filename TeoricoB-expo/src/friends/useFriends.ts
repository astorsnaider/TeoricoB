/**
 * useFriends — capa cliente del sistema de amistades.
 *
 * Backend (Supabase RPC, ver supabase/schema.sql §14 y §15):
 * - get_my_friends() → lista amigos aceptados + solicitudes pendientes.
 * - set_username(p_username) → escoger / cambiar mi @username.
 * - search_users_by_username(p_query) → autocompletado por prefijo.
 * - request_friendship_by_username(p_username) → enviar petición o
 *   auto-aceptar si el otro ya te pidió.
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
  username: string | null;
  avatarEmoji: string;
  profilePhotoUrl: string | null;
  xp: number;
  weeklyXP: number;
  streak: number;
  league: LeagueType;
  status: 'pending' | 'accepted';
  /** True si la solicitud me llegó a mí (yo debo decidir). */
  isIncoming: boolean;
  /** Racha de amistad compartida (días seguidos en que ambos estudian). 0 si rota. */
  friendStreak: number;
  /** True si la racha de amistad está viva pero aún no se ha contado hoy. */
  streakAtRisk: boolean;
}

export interface UserSearchResult {
  userId: string;
  username: string;
  name: string;
  avatarEmoji: string;
  league: LeagueType;
}

interface RpcRow {
  user_id: string;
  name: string;
  username: string | null;
  avatar_emoji: string;
  profile_photo_url: string | null;
  xp: number;
  weekly_xp: number;
  streak: number;
  league: LeagueType;
  status: 'pending' | 'accepted';
  is_incoming: boolean;
  friend_streak?: number;
  streak_at_risk?: boolean;
}

interface SearchRpcRow {
  user_id: string;
  username: string;
  display_name: string;
  avatar_emoji: string;
  league: LeagueType;
}

export interface FriendsState {
  available: boolean;
  loading: boolean;
  /** Mi @username público (null si aún no he escogido uno). */
  myUsername: string | null;
  /** Cuándo podré cambiar el username otra vez (ISO). null si nunca lo he
   *  fijado o ya pasaron los 14 días de cooldown. */
  nextUsernameChangeAt: string | null;
  /** Días enteros restantes hasta poder cambiar. 0 si ya puedo. */
  usernameCooldownDays: number;
  /** Solo amistades aceptadas. */
  friends: FriendEntry[];
  /** Solicitudes que ME han enviado (yo decido). */
  incoming: FriendEntry[];
  /** Solicitudes que YO envié (esperando respuesta). */
  outgoing: FriendEntry[];
  error: string | null;
  refresh: () => void;
  setUsername: (username: string) => Promise<{ ok: boolean; username?: string; error?: string }>;
  searchUsers: (query: string) => Promise<UserSearchResult[]>;
  addFriendByUsername: (username: string) => Promise<{ ok: boolean; status?: 'pending' | 'accepted'; error?: string }>;
  acceptFriend: (otherUserId: string) => Promise<{ ok: boolean; error?: string }>;
  rejectFriend: (otherUserId: string) => Promise<{ ok: boolean; error?: string }>;
  /** Elimina una amistad aceptada o cancela una solicitud enviada. */
  removeFriend: (otherUserId: string) => Promise<{ ok: boolean; error?: string }>;
}

const REFRESH_MS = 60_000;

function friendlyError(raw: string): string {
  switch (raw) {
    case 'USERNAME_NOT_FOUND':  return 'Ese usuario no existe.';
    case 'USERNAME_TOO_SHORT':  return 'El nombre debe tener al menos 3 caracteres.';
    case 'USERNAME_TOO_LONG':   return 'El nombre no puede superar los 20 caracteres.';
    case 'USERNAME_BAD_CHARS':  return 'Solo letras minúsculas, números y guion bajo.';
    case 'USERNAME_TAKEN':      return 'Ese nombre ya está en uso, prueba otro.';
    case 'USERNAME_RESERVED':   return 'Ese nombre está reservado.';
    case 'USERNAME_COOLDOWN':   return 'Solo puedes cambiar tu username cada 14 días.';
    case 'CANNOT_ADD_SELF':     return 'No puedes añadirte a ti mismo.';
    case 'ALREADY_FRIENDS':     return 'Ya sois amigos.';
    case 'ALREADY_REQUESTED':   return 'Ya enviaste la solicitud, está pendiente.';
    case 'BLOCKED':             return 'No es posible establecer amistad con esa cuenta.';
    case 'NO_PENDING_REQUEST':  return 'Esa solicitud ya no está disponible.';
    case 'No autenticado.':     return 'Inicia sesión para gestionar amigos.';
    default:                    return raw;
  }
}

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
  const { user, profile, refreshProfile } = useAuth();
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
        username: r.username,
        avatarEmoji: r.avatar_emoji,
        profilePhotoUrl: r.profile_photo_url,
        xp: r.xp,
        weeklyXP: r.weekly_xp,
        streak: r.streak,
        league: r.league,
        status: r.status,
        isIncoming: r.is_incoming,
        friendStreak: r.friend_streak ?? 0,
        streakAtRisk: r.streak_at_risk ?? false,
      }));
      setRows(mapped);
    })();

    return () => { cancelled = true; };
  }, [user, tick]);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [user, refresh]);

  const setUsername = useCallback(async (username: string) => {
    if (!isSupabaseConfigured || !user) {
      return { ok: false, error: 'Inicia sesión para gestionar amigos.' };
    }
    const { data, error: rpcError } = await callRpc<string>('set_username', { p_username: username });
    if (rpcError) return { ok: false, error: friendlyError(rpcError.message) };
    if (refreshProfile) await refreshProfile();
    return { ok: true, username: data ?? undefined };
  }, [user, refreshProfile]);

  const searchUsers = useCallback(async (query: string): Promise<UserSearchResult[]> => {
    const clean = query.trim().toLowerCase();
    if (clean.length < 2) return [];
    const { data, error: rpcError } = await callRpc<SearchRpcRow[]>('search_users_by_username', { p_query: clean });
    if (rpcError || !data) return [];
    return data.map(r => ({
      userId: r.user_id,
      username: r.username,
      name: r.display_name,
      avatarEmoji: r.avatar_emoji,
      league: r.league,
    }));
  }, []);

  const addFriendByUsername = useCallback(async (username: string) => {
    if (!isSupabaseConfigured || !user) {
      return { ok: false, error: 'Inicia sesión para gestionar amigos.' };
    }
    const { data, error: rpcError } = await callRpc<{ other_user_id: string; status: 'pending' | 'accepted' }[]>(
      'request_friendship_by_username',
      { p_username: username },
    );
    if (rpcError) return { ok: false, error: friendlyError(rpcError.message) };
    const status = data?.[0]?.status;
    refresh();
    return { ok: true, status };
  }, [user, refresh]);

  const acceptFriend = useCallback(async (otherUserId: string) => {
    const { error: rpcError } = await callRpc<null>('respond_friendship', {
      p_other_user_id: otherUserId, p_accept: true,
    });
    if (rpcError) return { ok: false, error: friendlyError(rpcError.message) };
    refresh();
    return { ok: true };
  }, [refresh]);

  const rejectFriend = useCallback(async (otherUserId: string) => {
    const { error: rpcError } = await callRpc<null>('respond_friendship', {
      p_other_user_id: otherUserId, p_accept: false,
    });
    if (rpcError) return { ok: false, error: friendlyError(rpcError.message) };
    refresh();
    return { ok: true };
  }, [refresh]);

  const removeFriend = useCallback(async (otherUserId: string) => {
    const { error: rpcError } = await callRpc<null>('remove_friendship', {
      p_other_user_id: otherUserId,
    });
    if (rpcError) return { ok: false, error: friendlyError(rpcError.message) };
    refresh();
    return { ok: true };
  }, [refresh]);

  const friends = rows.filter(r => r.status === 'accepted');
  const incoming = rows.filter(r => r.status === 'pending' && r.isIncoming);
  const outgoing = rows.filter(r => r.status === 'pending' && !r.isIncoming);

  // Cooldown: 14 días desde el último cambio.
  const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;
  let nextUsernameChangeAt: string | null = null;
  let usernameCooldownDays = 0;
  if (profile?.username_updated_at) {
    const next = new Date(profile.username_updated_at).getTime() + COOLDOWN_MS;
    if (next > Date.now()) {
      nextUsernameChangeAt = new Date(next).toISOString();
      usernameCooldownDays = Math.ceil((next - Date.now()) / (24 * 60 * 60 * 1000));
    }
  }

  return {
    available: Boolean(isSupabaseConfigured && user),
    loading,
    myUsername: profile?.username ?? null,
    nextUsernameChangeAt,
    usernameCooldownDays,
    friends,
    incoming,
    outgoing,
    error,
    refresh,
    setUsername,
    searchUsers,
    addFriendByUsername,
    acceptFriend,
    rejectFriend,
    removeFriend,
  };
}
