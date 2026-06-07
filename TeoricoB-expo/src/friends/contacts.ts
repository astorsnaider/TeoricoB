/**
 * Importación de contactos del móvil para encontrar amigos en Teoric.
 *
 * Estrategia (Duolingo-style):
 * - Pedimos permiso de contactos con expo-contacts.
 * - Leemos los emails de la libreta del usuario.
 * - Los normalizamos (lowercase + trim) y los hasheamos con SHA256 +
 *   sal pública 'teoric_v1:'.
 * - Enviamos solo los hashes al backend (RPC find_users_by_email_hashes).
 * - No se almacena nada — todo se procesa en memoria.
 *
 * Privacidad: nunca enviamos emails en plano. El email_hash en el backend
 * usa la misma fórmula para los emails de auth.users.email.
 */
import * as Contacts from 'expo-contacts';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { supabase } from '../api/supabase';
import { LeagueType } from '../types';

export interface ContactMatch {
  userId: string;
  username: string | null;
  name: string;
  avatarEmoji: string;
  league: LeagueType;
  /** Hash del email que matcheó, para mapear con el contacto local si interesa. */
  emailHash: string;
}

export type ContactsPermission = 'granted' | 'denied' | 'undetermined';

/** Hash determinista compartido con el backend (sha256, sal pública). */
export async function hashEmail(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `teoric_v1:${normalized}`,
    { encoding: Crypto.CryptoEncoding.HEX },
  );
}

export async function getContactsPermission(): Promise<ContactsPermission> {
  if (Platform.OS === 'web') return 'denied';
  const { status } = await Contacts.getPermissionsAsync();
  return status as ContactsPermission;
}

export async function requestContactsPermission(): Promise<ContactsPermission> {
  if (Platform.OS === 'web') return 'denied';
  const { status } = await Contacts.requestPermissionsAsync();
  return status as ContactsPermission;
}

/**
 * Lee los emails de la libreta y devuelve la lista normalizada
 * (deduplicada, lowercase). Solo Emails — no nombres ni teléfonos en esta fase.
 */
async function readContactEmails(): Promise<string[]> {
  if (Platform.OS === 'web') return [];
  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.Emails],
    pageSize: 0, // todos
  });
  const emails = new Set<string>();
  for (const c of data) {
    if (!c.emails) continue;
    for (const e of c.emails) {
      if (!e.email) continue;
      const clean = e.email.trim().toLowerCase();
      if (clean.length > 3 && clean.includes('@')) emails.add(clean);
    }
  }
  return [...emails];
}

interface MatchRow {
  user_id: string;
  username: string | null;
  display_name: string;
  avatar_emoji: string;
  league: LeagueType;
  email_hash: string;
}

/**
 * Punto de entrada: lee contactos → hashea → consulta backend.
 * Asume que ya tienes el permiso (lo gestiona la UI antes de llamar).
 */
export async function findFriendsInContacts(): Promise<ContactMatch[]> {
  const emails = await readContactEmails();
  if (emails.length === 0) return [];

  const hashes = await Promise.all(emails.map(hashEmail));

  // RPC batched. Si en el futuro hay > 1000 contactos, partimos en chunks.
  const CHUNK_SIZE = 500;
  const results: ContactMatch[] = [];
  for (let i = 0; i < hashes.length; i += CHUNK_SIZE) {
    const slice = hashes.slice(i, i + CHUNK_SIZE);
    const { data, error } = await (supabase as unknown as {
      rpc: (name: string, args: Record<string, unknown>) => Promise<{
        data: MatchRow[] | null;
        error: { message: string } | null;
      }>;
    }).rpc('find_users_by_email_hashes', { p_hashes: slice });
    if (error) {
      if (__DEV__) console.warn('[contacts] rpc error:', error.message);
      throw new Error(error.message);
    }
    for (const r of data ?? []) {
      results.push({
        userId: r.user_id,
        username: r.username,
        name: r.display_name,
        avatarEmoji: r.avatar_emoji,
        league: r.league,
        emailHash: r.email_hash,
      });
    }
  }

  // Dedupe por userId por si un mismo user matcheara con varios emails
  const byId = new Map<string, ContactMatch>();
  for (const m of results) if (!byId.has(m.userId)) byId.set(m.userId, m);
  return [...byId.values()];
}
