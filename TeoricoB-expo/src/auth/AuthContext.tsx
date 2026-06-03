/**
 * AuthContext — Estado global de autenticación.
 *
 * Filosofía "auth opcional pero promovida":
 * - La app sigue funcionando local-only si el usuario no inicia sesión.
 * - Al onboarding se le ofrece crear cuenta como paso natural.
 * - Cuando inicia sesión, su progreso local se sube y desde ese momento
 *   se sincroniza con la nube.
 * - Cierre de sesión: la sesión Supabase se cierra. El progreso local en
 *   AsyncStorage NO se borra (el usuario puede seguir usando la app).
 *
 * Métodos de autenticación soportados:
 * - Email + OTP code (6 dígitos). Mejor UX en mobile que magic link
 *   porque no depende de deep links: el usuario lee el código en el
 *   email y lo escribe en la app. Funciona idéntico en iOS / Android /
 *   Web / Expo Go.
 * - Apple Sign-In (stub — requiere expo-apple-authentication + cuenta dev Apple).
 * - Google Sign-In (stub — requiere OAuth flow + redirect).
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../api/supabase';
import { ProfileRow } from '../types/database';

export type AuthMethod = 'otp' | 'apple' | 'google';

interface SignInResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  /** Sesión actual de Supabase (null si no autenticado). */
  session: Session | null;
  /** Usuario autenticado (null si no autenticado). */
  user: User | null;
  /** Perfil extendido del usuario (null hasta que se cargue). */
  profile: ProfileRow | null;
  /** True mientras se restaura la sesión persistida al arrancar. */
  isLoading: boolean;
  /** True si Supabase está configurado (env presentes). */
  isConfigured: boolean;
  /**
   * Pide a Supabase que envíe un código OTP de 6 dígitos al email del
   * usuario. Crea cuenta si no existe.
   */
  requestOtp: (email: string) => Promise<SignInResult>;
  /**
   * Verifica el código OTP de 6 dígitos contra el email. Al éxito,
   * abre sesión automáticamente y onAuthStateChange dispara la
   * actualización de session/user/profile.
   */
  verifyOtp: (email: string, token: string) => Promise<SignInResult>;
  /** Sign-in con Apple (stub hasta cuenta dev Apple). */
  signInWithApple: () => Promise<SignInResult>;
  /** Sign-in con Google (stub hasta config Google OAuth). */
  signInWithGoogle: () => Promise<SignInResult>;
  /** Cierra sesión. NO borra progreso local. */
  signOut: () => Promise<void>;
  /** Recarga el profile desde la BD (tras updates externos). */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Convierte mensajes de error técnicos de Supabase en algo que el
 * usuario final entienda y sepa qué hacer.
 */
function friendlyAuthError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes('rate limit')) {
    return 'Has pedido demasiados códigos en poco tiempo. Espera unos minutos antes de intentarlo otra vez.';
  }
  if (m.includes('invalid login credentials') || m.includes('invalid token') || m.includes('otp_expired') || m.includes('expired')) {
    return 'El código es incorrecto o ha caducado. Pide uno nuevo.';
  }
  if (m.includes('email') && m.includes('invalid')) {
    return 'El email no parece válido. Revísalo y vuelve a intentarlo.';
  }
  if (m.includes('network') || m.includes('failed to fetch')) {
    return 'No hay conexión a internet. Comprueba tu red y vuelve a intentarlo.';
  }
  if (m.includes('signup') && m.includes('disabled')) {
    return 'No se permiten cuentas nuevas en este momento. Si ya tenías cuenta, prueba a iniciar sesión.';
  }
  // Fallback: dejamos el mensaje original pero con prefijo amable
  return raw;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurar sesión al arrancar
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setIsLoading(false);
    });

    // Suscripción a cambios de auth (login/logout/refresh)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Cargar profile cuando hay sesión
  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }

    let cancelled = false;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          if (__DEV__) console.warn('[auth] error loading profile:', error.message);
          setProfile(null);
        } else {
          setProfile(data);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user]);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    if (!error) setProfile(data);
  }, [session?.user]);

  const requestOtp = useCallback(async (email: string): Promise<SignInResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: 'Supabase no configurado' };
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        // NO mandamos emailRedirectTo: con shouldCreateUser=true y sin
        // redirect, Supabase mete `{{ .Token }}` en el email si el
        // template lo usa. El usuario ve el código de 6 dígitos.
        // shouldCreateUser=true → si la cuenta no existe, la crea; si
        // existe, es un login. El usuario no distingue ambos casos.
        shouldCreateUser: true,
      },
    });
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    return { ok: true };
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string): Promise<SignInResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: 'Supabase no configurado' };
    }
    const cleanToken = token.replace(/\s+/g, '').trim();
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: cleanToken,
      type: 'email',
    });
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    // Forzamos actualización inmediata del estado (no esperamos al listener)
    if (data?.session) setSession(data.session);
    return { ok: true };
  }, []);

  const signInWithApple = useCallback(async (): Promise<SignInResult> => {
    // TODO: implementar con expo-apple-authentication cuando exista cuenta dev.
    return { ok: false, error: 'Apple Sign-In no implementado todavía' };
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<SignInResult> => {
    // TODO: implementar con OAuth flow + redirect cuando esté configurado.
    return { ok: false, error: 'Google Sign-In no implementado todavía' };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    isLoading,
    isConfigured: isSupabaseConfigured,
    requestOtp,
    verifyOtp,
    signInWithApple,
    signInWithGoogle,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
