/**
 * AuthContext — Estado global de autenticación.
 *
 * Filosofía "auth opcional":
 * - La app sigue funcionando local-only si el usuario no inicia sesión.
 * - Cuando inicia sesión, su progreso local se sube y desde ese momento
 *   se sincroniza con la nube.
 * - Cierre de sesión: la sesión Supabase se cierra. El progreso local en
 *   AsyncStorage NO se borra (el usuario puede seguir usando la app).
 *
 * Métodos de autenticación soportados:
 * - Email + magic link (implementado, no requiere config extra).
 * - Apple Sign-In (stub — requiere expo-apple-authentication + cuenta dev Apple).
 * - Google Sign-In (stub — requiere @react-native-google-signin/google-signin).
 *
 * Cuando se tenga cuenta Apple Developer y se quiera publicar en iOS,
 * implementar los métodos signInWithApple / signInWithGoogle.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../api/supabase';
import { ProfileRow } from '../types/database';

export type AuthMethod = 'magic_link' | 'apple' | 'google';

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
  /** Envía un email con magic link al usuario. */
  signInWithMagicLink: (email: string) => Promise<SignInResult>;
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

  const signInWithMagicLink = useCallback(async (email: string): Promise<SignInResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: 'Supabase no configurado' };
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        // En web abre desde el email, lleva al user a la app.
        // En mobile, configurar deep link en app.json y cambiar esta URL.
        emailRedirectTo: undefined,
      },
    });
    if (error) return { ok: false, error: error.message };
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
    signInWithMagicLink,
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
