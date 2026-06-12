/**
 * Scheduler de notificaciones locales para Teoric.
 *
 * Encapsula `expo-notifications` con un API simple por tipo. Cada tipo
 * tiene su propio identifier para poder cancelarlas selectivamente sin
 * tocar las demás.
 *
 * Para web existe `scheduler.web.ts` con stubs (early return). Metro lo
 * resuelve automáticamente cuando el bundle es para web.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { NotificationsConfig } from '../types';

// ── Identifiers (para poder cancelarlas selectivamente) ───────────────
// Mantenemos prefijo "teoricob" en runtime IDs para no invalidar las
// notificaciones programadas en dispositivos de testers actuales.
// En el próximo bump destructivo se migrará a "teoric.*".
const ID_DAILY_REMINDER       = 'teoricob.reminder.daily';
const ID_STREAK_DANGER        = 'teoricob.streak.danger';
const ID_HEARTS_FULL          = 'teoricob.hearts.full';
const ID_NEW_QUESTS           = 'teoricob.quests.new';
const ID_FRIEND_STREAK_DANGER = 'teoricob.friend.streak.danger';

let configured = false;

async function ensureChannel() {
  if (configured) return;
  configured = true;
  // En Android se requiere un canal explícito desde 8.0
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Teoric',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#E63946',
    });
  }
  // Mostrar la notificación cuando la app está en foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestPermissions(): Promise<boolean> {
  await ensureChannel();
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  if (settings.canAskAgain === false) return false;
  const req = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  return !!req.granted;
}

export async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => undefined);
}

export async function cancelOne(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined);
}

/**
 * Programa el recordatorio diario a la hora indicada. Si ya existía uno
 * con el mismo identifier, lo reemplaza (cancel + schedule).
 */
export async function scheduleDailyReminder(hour: number, minute: number, streak: number): Promise<void> {
  await ensureChannel();
  await cancelOne(ID_DAILY_REMINDER);
  const body = streak > 0
    ? `Tu racha de ${streak} días depende de ti. ¿Vamos con la lección de hoy?`
    : 'Es un buen momento para una lección corta y empezar tu racha.';
  await Notifications.scheduleNotificationAsync({
    identifier: ID_DAILY_REMINDER,
    content: {
      title: '🚗 ¿Estudiamos hoy?',
      body,
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/**
 * Aviso "racha en peligro" a las 22:00 si no estudió hoy y tiene racha ≥ 3.
 * Se reprograma cada día — usamos DAILY como trigger para no tener que
 * tocarla manualmente cada día.
 */
export async function scheduleStreakDangerDaily(streak: number): Promise<void> {
  await ensureChannel();
  await cancelOne(ID_STREAK_DANGER);
  if (streak < 3) return;
  await Notifications.scheduleNotificationAsync({
    identifier: ID_STREAK_DANGER,
    content: {
      title: '🔥 Tu racha está en peligro',
      body: `Te quedan pocas horas para no perder tu racha de ${streak} días. ¡Aún hay tiempo!`,
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 22,
      minute: 0,
    },
  });
}

/**
 * Notificación puntual "vidas llenas" en N minutos. Si N ≤ 0 se cancela
 * la anterior y no se programa nueva.
 */
export async function scheduleHeartsFull(minutesUntilFull: number): Promise<void> {
  await ensureChannel();
  await cancelOne(ID_HEARTS_FULL);
  if (minutesUntilFull <= 0) return;
  const seconds = Math.max(60, Math.round(minutesUntilFull * 60));
  await Notifications.scheduleNotificationAsync({
    identifier: ID_HEARTS_FULL,
    content: {
      title: '❤️ Vidas al máximo',
      body: 'Ya puedes seguir practicando sin límite.',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    },
  });
}

/**
 * Recordatorio diario a las 00:01 de que hay misiones nuevas.
 */
export async function scheduleNewQuestsDaily(): Promise<void> {
  await ensureChannel();
  await cancelOne(ID_NEW_QUESTS);
  await Notifications.scheduleNotificationAsync({
    identifier: ID_NEW_QUESTS,
    content: {
      title: '🎯 ¡Nuevas misiones!',
      body: 'Hoy puedes ganar hasta 45 gemas completando los retos del día.',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 0,
      minute: 1,
    },
  });
}

/**
 * Notificación social INMEDIATA (solicitud de amistad, amigo te supera).
 * Sin identifier fijo → cada una se apila. Se dispara en ~1s.
 */
export async function presentSocialNow(title: string, body: string): Promise<void> {
  await ensureChannel();
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: 'default' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      repeats: false,
    },
  });
}

/**
 * Aviso diario ~21:00 si alguna racha de amistad está en peligro (viva pero
 * aún no contada hoy). `atRiskCount` = nº de amigos con racha en riesgo.
 */
export async function scheduleFriendStreakDangerDaily(atRiskCount: number): Promise<void> {
  await ensureChannel();
  await cancelOne(ID_FRIEND_STREAK_DANGER);
  if (atRiskCount <= 0) return;
  const body = atRiskCount === 1
    ? 'Una de tus rachas de amistad se romperá esta noche. ¡Estudiad los dos hoy!'
    : `${atRiskCount} rachas de amistad se romperán esta noche. ¡No las dejes caer!`;
  await Notifications.scheduleNotificationAsync({
    identifier: ID_FRIEND_STREAK_DANGER,
    content: { title: '🔥 Racha de amistad en peligro', body, sound: 'default' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
    },
  });
}

/**
 * Sincroniza TODO el plan de notificaciones según la configuración actual
 * y el estado del usuario. Llamar después de cualquier cambio en la
 * config o cuando cambia el estado relevante (streak, hearts).
 */
export async function syncNotifications(opts: {
  config: NotificationsConfig;
  streak: number;
  minutesUntilHeartsFull: number;
}): Promise<void> {
  if (!opts.config.enabled) {
    await cancelAll();
    return;
  }
  if (opts.config.reminderEnabled) {
    await scheduleDailyReminder(opts.config.reminderHour, opts.config.reminderMinute, opts.streak);
  } else {
    await cancelOne(ID_DAILY_REMINDER);
  }
  if (opts.config.streakDangerEnabled) {
    await scheduleStreakDangerDaily(opts.streak);
  } else {
    await cancelOne(ID_STREAK_DANGER);
  }
  if (opts.config.heartsFullEnabled) {
    await scheduleHeartsFull(opts.minutesUntilHeartsFull);
  } else {
    await cancelOne(ID_HEARTS_FULL);
  }
  if (opts.config.questsEnabled) {
    await scheduleNewQuestsDaily();
  } else {
    await cancelOne(ID_NEW_QUESTS);
  }
}
