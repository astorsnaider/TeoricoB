/**
 * Fallback web del scheduler. `expo-notifications` no funciona en
 * navegador (las Web Notifications usan otra API que requeriría un
 * service worker para programación). En web hacemos no-op para no
 * romper el resto del código.
 *
 * Metro resuelve este `.web.ts` automáticamente en bundles web.
 */
import type { NotificationsConfig } from '../types';

export async function requestPermissions(): Promise<boolean> {
  return false;
}

export async function cancelAll(): Promise<void> {
  return;
}

export async function cancelOne(_identifier: string): Promise<void> {
  return;
}

export async function scheduleDailyReminder(_hour: number, _minute: number, _streak: number): Promise<void> {
  return;
}

export async function scheduleStreakDangerDaily(_streak: number): Promise<void> {
  return;
}

export async function scheduleHeartsFull(_minutesUntilFull: number): Promise<void> {
  return;
}

export async function scheduleNewQuestsDaily(): Promise<void> {
  return;
}

export async function syncNotifications(_opts: {
  config: NotificationsConfig;
  streak: number;
  minutesUntilHeartsFull: number;
}): Promise<void> {
  return;
}

export async function presentSocialNow(_title: string, _body: string): Promise<void> {
  return;
}

export async function scheduleFriendStreakDangerDaily(_atRiskCount: number): Promise<void> {
  return;
}
