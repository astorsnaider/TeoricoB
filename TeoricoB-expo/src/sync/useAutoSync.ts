/**
 * useAutoSync — conecta el store Zustand con Supabase.
 *
 * Comportamiento:
 * - Al login: ejecuta initialSync() que decide entre pull (descargar
 *   estado remoto) o push (subir estado local) según cuál tenga más
 *   progreso. Heurística simple "more-progress wins" por user.xp.
 * - Mientras hay sesión: cualquier cambio en el slice persistido del
 *   store dispara schedulePush() con debounce 5s.
 * - Al logout: flush del push pendiente antes de cortar.
 *
 * Este hook se monta UNA vez en AppContent (después de AuthProvider).
 * Si el usuario no está autenticado, el hook no hace nada — la app
 * sigue funcionando local-only.
 */
import { useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useStore } from '../store/useStore';
import { schedulePush, pullProgress, flushPendingPush, SyncedState } from './syncEngine';

/** Extrae el subset del store que se sincroniza con Supabase. */
function extractSyncedState(state: ReturnType<typeof useStore.getState>): SyncedState {
  return {
    user: state.user as unknown as SyncedState['user'],
    isOnboardingComplete: state.isOnboardingComplete,
    tutorialSeen: state.tutorialSeen,
    disclaimerAccepted: state.disclaimerAccepted,
    dailyChallenge: state.dailyChallenge,
    dailyQuests: state.dailyQuests,
    notifications: state.notifications,
    isDarkMode: state.isDarkMode,
    soundsEnabled: state.soundsEnabled,
  };
}

/**
 * Decide si reemplazar el state local con el remoto. Heurística:
 * "el que tenga más XP gana". Empate → más reciente gana (asumimos
 * que `updated_at` del remoto refleja la última escritura).
 *
 * Esto evita: usuario se loguea en dispositivo B con menos progreso
 * y borra accidentalmente el progreso real del dispositivo A.
 */
function shouldOverwriteLocal(remoteState: SyncedState, localXP: number): boolean {
  const remoteXP = Number(remoteState.user?.xp ?? 0);
  return remoteXP > localXP;
}

export function useAutoSync(): void {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const initialSyncDoneRef = useRef<string | null>(null);

  // ── Initial sync al login ─────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      initialSyncDoneRef.current = null;
      return;
    }

    // Evita re-sync si ya lo hicimos para este user
    if (initialSyncDoneRef.current === authUser.id) return;
    initialSyncDoneRef.current = authUser.id;

    (async () => {
      const localXP = useStore.getState().user.xp;
      const result = await pullProgress();

      if (!result.ok) {
        if (__DEV__) console.warn('[autosync] pullProgress fallo:', result.error);
        return;
      }

      if (result.state) {
        if (shouldOverwriteLocal(result.state, localXP)) {
          // Reemplaza state local con el remoto (más progreso)
          if (__DEV__) console.log('[autosync] pull: estado remoto tiene más progreso, reemplazando local');
          // El state_blob contiene el slice persistido completo del store.
          // Cast vía unknown porque SyncedState es un subset tipado más
          // laxo; en runtime se reconstruye el shape completo del store.
          useStore.setState((current) => ({
            ...current,
            ...(result.state as unknown as Partial<typeof current>),
          }));
          return;
        }
        if (__DEV__) console.log('[autosync] pull: estado local tiene más progreso, subiendo local');
      } else {
        if (__DEV__) console.log('[autosync] pull: no hay estado remoto, subiendo local');
      }

      // Push del local (más progreso o primera sync del usuario)
      const syncedState = extractSyncedState(useStore.getState());
      schedulePush(syncedState);
    })();
  }, [authUser, authLoading]);

  // ── Push debounced en cada cambio del store ────────────────────────
  useEffect(() => {
    if (!authUser) return;

    // Subscribe a cambios del slice persistido
    const unsub = useStore.subscribe((state, prevState) => {
      // Comparación shallow del slice persistido. Si cambia algo,
      // schedulePush() consolida con debounce 5s.
      if (
        state.user !== prevState.user ||
        state.isOnboardingComplete !== prevState.isOnboardingComplete ||
        state.tutorialSeen !== prevState.tutorialSeen ||
        state.disclaimerAccepted !== prevState.disclaimerAccepted ||
        state.dailyChallenge !== prevState.dailyChallenge ||
        state.dailyQuests !== prevState.dailyQuests ||
        state.notifications !== prevState.notifications ||
        state.isDarkMode !== prevState.isDarkMode ||
        state.soundsEnabled !== prevState.soundsEnabled
      ) {
        schedulePush(extractSyncedState(state));
      }
    });

    return () => {
      unsub();
      // Flush al desmontar (logout, cierre)
      flushPendingPush().catch(() => undefined);
    };
  }, [authUser]);
}
