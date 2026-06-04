/**
 * syncEngine — Sincronización del estado de usuario entre dispositivo y
 * Supabase.
 *
 * Modelo: el estado de Zustand persiste localmente en AsyncStorage
 * (offline-first) y, cuando hay sesión iniciada, una copia se sube a la
 * tabla `user_progress` (campos extraídos como columnas indexadas + el
 * blob JSONB completo).
 *
 * Estrategia de conflictos: **last-write-wins** por timestamp `updated_at`.
 * Suficiente para una app single-user multi-device como Teoric.
 *
 * Push: debounce 5 s. Cada vez que el state cambia, se programa un push.
 *   Si llegan más cambios en esa ventana, se reagenda y consolida.
 *
 * Pull: solo al login o al `refresh` manual desde Ajustes. Compara
 *   `updated_at` remoto vs local; si remoto es más reciente, sobrescribe.
 *
 * Las funciones aquí son puras — el reactivado (subscribirse al store y
 * disparar pushes) lo hará `useAutoSync` en una iteración posterior.
 */
import { supabase, isSupabaseConfigured } from '../api/supabase';
import { LeagueName, UserProgressInsert } from '../types/database';

/** Forma de los campos del store que se sincronizan. */
export interface SyncedState {
  user: {
    xp: number;
    weeklyXP: number;
    streak: number;
    hearts: number;
    gems: number;
    league: string;
    lastActiveDate: string;
    totalCorrect: number;
    totalAnswered: number;
    // El resto del UserState va al state_blob entero.
    [key: string]: unknown;
  };
  isOnboardingComplete?: boolean;
  tutorialSeen?: boolean;
  disclaimerAccepted?: boolean;
  dailyChallenge?: unknown;
  dailyQuests?: unknown;
  notifications?: unknown;
  isDarkMode?: boolean;
  soundsEnabled?: boolean;
}

export interface PushResult {
  ok: boolean;
  error?: string;
  updatedAt?: string;
}

export interface PullResult {
  ok: boolean;
  error?: string;
  /** state remoto si existe y es más reciente que el local. */
  state?: SyncedState;
  remoteUpdatedAt?: string;
}

/**
 * Normaliza league a uno de los valores válidos. Si llega algo raro,
 * defaultea a 'Bronce' para no romper la columna.
 */
function safeLeague(value: unknown): LeagueName {
  const valid: LeagueName[] = [
    'Bronce', 'Plata', 'Oro', 'Zafiro', 'Rubí', 'Esmeralda', 'Amatista', 'Diamante',
  ];
  return valid.includes(value as LeagueName) ? (value as LeagueName) : 'Bronce';
}

/**
 * Sube el state actual del store a Supabase. Hace UPSERT sobre
 * `user_progress` con el `user_id` del autenticado.
 *
 * Si no hay sesión o Supabase no está configurado, no hace nada y
 * devuelve { ok: false } silenciosamente — no es un error.
 */
export async function pushProgress(state: SyncedState): Promise<PushResult> {
  if (!isSupabaseConfigured) return { ok: false, error: 'no-config' };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { ok: false, error: 'no-session' };

  const u = state.user;
  const row: UserProgressInsert = {
    user_id: session.user.id,
    xp: u.xp ?? 0,
    weekly_xp: u.weeklyXP ?? 0,
    streak: u.streak ?? 0,
    hearts: u.hearts ?? 5,
    gems: u.gems ?? 0,
    league: safeLeague(u.league),
    last_active_date: u.lastActiveDate?.slice(0, 10) || null,
    total_correct: u.totalCorrect ?? 0,
    total_answered: u.totalAnswered ?? 0,
    // Blob completo
    state_blob: state as unknown as Record<string, unknown>,
    schema_version: 1,
  };

  const { data, error } = await supabase
    .from('user_progress')
    .upsert(row, { onConflict: 'user_id' })
    .select('updated_at')
    .single();

  if (error) {
    if (__DEV__) console.warn('[sync] pushProgress error:', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true, updatedAt: data?.updated_at };
}

/**
 * Descarga el state remoto si existe. Devuelve null si no hay row aún
 * (usuario recién creado, sin progreso subido).
 */
export async function pullProgress(): Promise<PullResult> {
  if (!isSupabaseConfigured) return { ok: false, error: 'no-config' };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { ok: false, error: 'no-session' };

  const { data, error } = await supabase
    .from('user_progress')
    .select('state_blob, updated_at')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) {
    if (__DEV__) console.warn('[sync] pullProgress error:', error.message);
    return { ok: false, error: error.message };
  }

  if (!data || !data.state_blob || Object.keys(data.state_blob).length === 0) {
    // Usuario nuevo o sin sync previo
    return { ok: true };
  }

  return {
    ok: true,
    state: data.state_blob as unknown as SyncedState,
    remoteUpdatedAt: data.updated_at,
  };
}

// ─── Estado de sync observable ────────────────────────────────────────
// Permite que la UI (Profile, banner, etc.) refleje en tiempo real qué
// está pasando con la sincronización: cambios pendientes, subida en
// curso, último éxito o error.

export type SyncStatus =
  | { kind: 'idle' }                             // ningún cambio pendiente
  | { kind: 'pending' }                          // hay cambios esperando al debounce
  | { kind: 'syncing' }                          // push en marcha
  | { kind: 'synced'; at: number }               // último push correcto (ms)
  | { kind: 'error'; message: string; at: number };

let _status: SyncStatus = { kind: 'idle' };
const _listeners = new Set<(s: SyncStatus) => void>();

function setStatus(s: SyncStatus): void {
  _status = s;
  _listeners.forEach(l => l(s));
}

export function getSyncStatus(): SyncStatus { return _status; }

export function subscribeSyncStatus(cb: (s: SyncStatus) => void): () => void {
  _listeners.add(cb);
  return () => { _listeners.delete(cb); };
}

/** Útil al hacer signOut: limpia el estado para que la UI no muestre
 *  un "sincronizado hace X seg" de la sesión anterior. */
export function resetSyncStatus(): void {
  setStatus({ kind: 'idle' });
}

// ─── Debounced push ───────────────────────────────────────────────────

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pendingState: SyncedState | null = null;
const PUSH_DEBOUNCE_MS = 5000;

async function runPush(state: SyncedState): Promise<void> {
  setStatus({ kind: 'syncing' });
  const result = await pushProgress(state);
  if (result.ok) {
    setStatus({ kind: 'synced', at: Date.now() });
  } else if (result.error === 'no-session' || result.error === 'no-config') {
    // Estado intermedio benigno: no era esperable subir nada.
    setStatus({ kind: 'idle' });
  } else {
    setStatus({ kind: 'error', message: result.error ?? 'Error desconocido', at: Date.now() });
  }
}

/**
 * Programa un push debounced. Si se llama varias veces seguidas, solo
 * el último state se sube tras la ventana de quietud.
 */
export function schedulePush(state: SyncedState): void {
  pendingState = state;
  setStatus({ kind: 'pending' });
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    const snapshot = pendingState;
    pushTimer = null;
    pendingState = null;
    if (snapshot) {
      runPush(snapshot).catch(() => undefined);
    }
  }, PUSH_DEBOUNCE_MS);
}

/**
 * Fuerza un flush del push pendiente ya, sin esperar al debounce.
 * Útil al cerrar la app o al cerrar sesión.
 */
export async function flushPendingPush(): Promise<void> {
  if (!pushTimer || !pendingState) return;
  clearTimeout(pushTimer);
  const snapshot = pendingState;
  pushTimer = null;
  pendingState = null;
  await runPush(snapshot).catch(() => undefined);
}
