/**
 * Cliente Supabase único para Teoric.
 *
 * - Las credenciales se leen de variables EXPO_PUBLIC_* (visibles en cliente
 *   por diseño — son la anon key, no la service key).
 * - Usa AsyncStorage para persistir la sesión en mobile/web.
 * - Si no hay credenciales configuradas (primer arranque del proyecto sin
 *   .env), se devuelve un cliente "stub" que no rompe la app pero loguea
 *   un warning. Esto permite seguir desarrollando UI offline.
 *
 * Configuración:
 *   crea un .env.local en la raíz del proyecto Expo con:
 *     EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
 *     EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJh...
 *   ver docs/SUPABASE_SETUP.md para los pasos completos.
 */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let _client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (_client) return _client;

  if (!isSupabaseConfigured) {
    if (__DEV__) {
      console.warn(
        '[supabase] EXPO_PUBLIC_SUPABASE_URL / ANON_KEY no configuradas. ' +
          'La app funciona en modo local-only. Configura .env.local para activar sincronización.',
      );
    }
    // Cliente "vacío" apuntando a placeholder. Las llamadas reales
    // fallarán con un error de red, lo que evita falsos positivos.
    _client = createClient<Database>('https://placeholder.supabase.co', 'placeholder', {
      auth: { storage: AsyncStorage, persistSession: false, autoRefreshToken: false },
    });
    return _client;
  }

  _client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // RN no usa URL hash flow
    },
  });

  return _client;
}

/** Atajo para imports cortos. */
export const supabase = getSupabase();
