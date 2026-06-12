/**
 * useFriendNotifications — dispara notificaciones locales sociales a partir
 * del estado de amigos (useFriends). Se monta UNA vez en App.tsx.
 *
 * - Solicitud nueva: cuando aumenta el nº de solicitudes entrantes.
 * - Amigo te supera: cuando un amigo que estaba por debajo de tu XP semanal
 *   pasa por encima.
 * - Racha de amistad en peligro: reprograma el aviso diario ~21h según
 *   cuántas rachas estén en riesgo.
 *
 * Las líneas base (seen*) viven en refs de sesión: en el primer fetch tras
 * abrir la app se fija el baseline sin notificar (evita spam al arrancar).
 */
import { useEffect, useRef } from 'react';
import { useFriends } from './useFriends';
import { useStore } from '../store/useStore';
import { presentSocialNow, scheduleFriendStreakDangerDaily } from '../notifications/scheduler';

export function useFriendNotifications() {
  const { available, friends, incoming } = useFriends();
  const myWeeklyXP = useStore(s => s.user.weeklyXP);
  const cfg = useStore(s => s.notifications);

  const seenIncoming = useRef<number | null>(null);
  const seenFriendXP = useRef<Record<string, number> | null>(null);

  // ── Solicitudes entrantes ───────────────────────────────────────────
  useEffect(() => {
    if (!available) return;
    const prev = seenIncoming.current;
    const now = incoming.length;
    if (cfg.enabled && cfg.friendRequestEnabled && prev !== null && now > prev) {
      const delta = now - prev;
      presentSocialNow(
        '👋 Nueva solicitud de amistad',
        delta === 1
          ? 'Alguien quiere ser tu amigo en Teoric.'
          : `${delta} personas quieren ser tus amigos en Teoric.`,
      ).catch(() => undefined);
    }
    seenIncoming.current = now;
  }, [available, incoming.length, cfg.enabled, cfg.friendRequestEnabled]);

  // ── Amigo te supera en XP semanal ───────────────────────────────────
  useEffect(() => {
    if (!available) return;
    const prev = seenFriendXP.current;
    const curr: Record<string, number> = {};
    for (const f of friends) curr[f.userId] = f.weeklyXP;
    if (cfg.enabled && cfg.friendPassedEnabled && prev) {
      for (const f of friends) {
        const before = prev[f.userId];
        if (before === undefined) continue;
        // Estaba a mi altura o por debajo, y ahora me supera.
        if (before <= myWeeklyXP && f.weeklyXP > myWeeklyXP) {
          presentSocialNow(
            '📈 Te han adelantado',
            `${f.name} te ha superado en XP esta semana. ¿Le devuelves el golpe?`,
          ).catch(() => undefined);
        }
      }
    }
    seenFriendXP.current = curr;
  }, [available, friends, myWeeklyXP, cfg.enabled, cfg.friendPassedEnabled]);

  // ── Racha de amistad en peligro (aviso diario) ──────────────────────
  useEffect(() => {
    if (!available) return;
    const atRisk = (cfg.enabled && cfg.friendStreakDangerEnabled)
      ? friends.filter(f => f.streakAtRisk).length
      : 0;
    scheduleFriendStreakDangerDaily(atRisk).catch(() => undefined);
  }, [available, friends, cfg.enabled, cfg.friendStreakDangerEnabled]);
}
