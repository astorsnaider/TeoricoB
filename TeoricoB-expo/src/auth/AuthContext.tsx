/**
 * AuthContext — Estado global de autenticación.
 *
 * Modelo (estándar de la industria):
 * - Email + contraseña.
 * - Signup requiere verificación del email mediante código OTP de 6
 *   dígitos enviado al correo (en lugar de un link, para que funcione
 *   idéntico en iOS / Android / Web / Expo Go).
 * - Reset de contraseña por email (OTP).
 * - Apple/Google saltarán la verificación (sus identidades ya están
 *   verificadas por el proveedor) cuando se implementen.
 *
 * Filosofía "auth opcional pero promovida":
 * - La app sigue funcionando local-only si el usuario no inicia sesión.
 * - Onboarding ofrece crear cuenta como paso natural; se puede saltar.
 * - Cuando inicia sesión, su progreso local se sube y desde ese momento
 *   se sincroniza con la nube.
 * - signOut() cierra sesión pero NO borra progreso local en AsyncStorage.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../api/supabase';
import { ProfileRow } from '../types/database';
import { resetSyncStatus } from '../sync/syncEngine';

export type AuthMethod = 'password' | 'apple' | 'google';

interface AuthResult {
  ok: boolean;
  error?: string;
  /** True si el usuario necesita verificar su email antes de poder usar la cuenta. */
  needsEmailVerification?: boolean;
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
   * Registra una cuenta nueva con email y contraseña. Si el proyecto
   * Supabase exige verificación de email (recomendado), Supabase envía
   * un correo con un código OTP que el usuario debe verificar con
   * `verifyEmail()` antes de poder usar la cuenta.
   *
   * El `name` se guarda en raw_user_meta_data.name; el trigger
   * handle_new_user lo lee para crear `profiles.display_name`.
   */
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  /**
   * Inicia sesión con email y contraseña existentes. Si el email no
   * está confirmado y Supabase lo exige, devolverá needsEmailVerification.
   */
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
  /**
   * Verifica el código OTP de 6 dígitos enviado al email tras signUp.
   * Al éxito, la sesión se abre automáticamente.
   */
  verifyEmail: (email: string, token: string) => Promise<AuthResult>;
  /** Reenvía el código de verificación de email (para signups pendientes). */
  resendVerification: (email: string) => Promise<AuthResult>;
  /**
   * Envía un email con instrucciones para restablecer la contraseña.
   * El email lleva un código OTP que el usuario introduce, y luego
   * elige nueva contraseña con `updatePassword()`.
   */
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  /**
   * Verifica el OTP de reset de password. Una vez verificado, la sesión
   * temporal abierta permite llamar a updatePassword().
   */
  verifyPasswordResetCode: (email: string, token: string) => Promise<AuthResult>;
  /** Actualiza la contraseña del usuario actualmente autenticado. */
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  /**
   * Re-verifica la contraseña actual del usuario (re-login silencioso).
   * Se usa antes de operaciones sensibles (cambiar contraseña/email).
   */
  reauthenticate: (currentPassword: string) => Promise<AuthResult>;
  /**
   * Inicia el cambio de email: Supabase envía un código de 6 dígitos al
   * NUEVO email. Se confirma con `verifyEmailChange()`.
   */
  changeEmail: (newEmail: string) => Promise<AuthResult>;
  /** Verifica el código enviado al nuevo email para confirmar el cambio. */
  verifyEmailChange: (newEmail: string, token: string) => Promise<AuthResult>;
  /** Sign-in con Apple (stub hasta cuenta dev Apple). */
  signInWithApple: () => Promise<AuthResult>;
  /** Sign-in con Google (stub hasta config Google OAuth). */
  signInWithGoogle: () => Promise<AuthResult>;
  /** Cierra sesión. NO borra progreso local. */
  signOut: () => Promise<void>;
  /**
   * Borra todos los datos personales del usuario (RGPD Art. 17).
   * Se ejecuta la RPC delete_my_account en Supabase, después se cierra
   * sesión. El registro de auth.users queda con email pero sin datos
   * asociados; se elimina por completo en 30 días (proceso admin).
   */
  deleteAccount: () => Promise<AuthResult>;
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
  if (m.includes('email not confirmed') || m.includes('email_not_confirmed')) {
    return 'Tu email todavía no está verificado. Revisa tu correo (también la carpeta spam).';
  }
  if (m.includes('invalid login credentials')) {
    return 'Email o contraseña incorrectos. Si has olvidado tu contraseña, usa "¿Olvidaste tu contraseña?".';
  }
  if (m.includes('invalid token') || m.includes('otp_expired') || m.includes('token has expired') || m.includes('expired')) {
    return 'El código es incorrecto o ha caducado. Pide uno nuevo.';
  }
  if (m.includes('user already registered') || m.includes('already been registered')) {
    return 'Ya existe una cuenta con ese email. Prueba a iniciar sesión.';
  }
  if (m.includes('password') && (m.includes('short') || m.includes('weak') || m.includes('6 characters'))) {
    return 'La contraseña debe tener al menos 8 caracteres.';
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

  const signUp = useCallback(async (name: string, email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: 'Supabase no configurado' };
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    if (!cleanName) return { ok: false, error: 'El nombre no puede estar vacío.' };
    if (password.length < 8) return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' };

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { name: cleanName },
      },
    });

    if (error) return { ok: false, error: friendlyAuthError(error.message) };

    // Si Supabase exige verificación: no hay session todavía.
    // Si no la exige: la session viene en data.session y entras directo.
    if (data.session) {
      setSession(data.session);
      return { ok: true };
    }
    return { ok: true, needsEmailVerification: true };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: 'Supabase no configurado' };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      const msg = friendlyAuthError(error.message);
      const needsVerification = error.message.toLowerCase().includes('email not confirmed') ||
        error.message.toLowerCase().includes('email_not_confirmed');
      return { ok: false, error: msg, needsEmailVerification: needsVerification };
    }
    if (data?.session) setSession(data.session);
    return { ok: true };
  }, []);

  const verifyEmail = useCallback(async (email: string, token: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: 'Supabase no configurado' };
    }
    const cleanToken = token.replace(/\s+/g, '').trim();
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: cleanToken,
      type: 'signup',
    });
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    if (data?.session) setSession(data.session);
    return { ok: true };
  }, []);

  const resendVerification = useCallback(async (email: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: 'Supabase no configurado' };
    }
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
    });
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    return { ok: true };
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: 'Supabase no configurado' };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
    );
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    return { ok: true };
  }, []);

  const verifyPasswordResetCode = useCallback(async (email: string, token: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: 'Supabase no configurado' };
    }
    const cleanToken = token.replace(/\s+/g, '').trim();
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: cleanToken,
      type: 'recovery',
    });
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    if (data?.session) setSession(data.session);
    return { ok: true };
  }, []);

  const updatePassword = useCallback(async (newPassword: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: 'Supabase no configurado' };
    }
    if (newPassword.length < 8) return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    return { ok: true };
  }, []);

  const reauthenticate = useCallback(async (currentPassword: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { ok: false, error: 'Supabase no configurado' };
    const email = session?.user?.email;
    if (!email) return { ok: false, error: 'No hay sesión activa.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes('invalid login credentials')) {
        return { ok: false, error: 'La contraseña actual no es correcta.' };
      }
      return { ok: false, error: friendlyAuthError(error.message) };
    }
    return { ok: true };
  }, [session?.user?.email]);

  const changeEmail = useCallback(async (newEmail: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { ok: false, error: 'Supabase no configurado' };
    const clean = newEmail.trim().toLowerCase();
    if (!clean.includes('@')) return { ok: false, error: 'El email no parece válido.' };
    if (clean === session?.user?.email?.toLowerCase()) {
      return { ok: false, error: 'Ese ya es tu email actual.' };
    }
    const { error } = await supabase.auth.updateUser({ email: clean });
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    return { ok: true };
  }, [session?.user?.email]);

  const verifyEmailChange = useCallback(async (newEmail: string, token: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { ok: false, error: 'Supabase no configurado' };
    const cleanToken = token.replace(/\s+/g, '').trim();
    const { data, error } = await supabase.auth.verifyOtp({
      email: newEmail.trim().toLowerCase(),
      token: cleanToken,
      type: 'email_change',
    });
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    if (data?.session) setSession(data.session);
    return { ok: true };
  }, []);

  const signInWithApple = useCallback(async (): Promise<AuthResult> => {
    return { ok: false, error: 'Apple Sign-In no implementado todavía' };
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    return { ok: false, error: 'Google Sign-In no implementado todavía' };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    resetSyncStatus();
  }, []);

  const deleteAccount = useCallback(async (): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: 'Supabase no configurado' };
    }
    // IMPORTANTE: llamar siempre como `supabase.rpc(...)`. Extraer
    // `supabase.rpc` a variable suelta pierde el `this` binding y
    // explota en runtime. La función no está tipada en
    // Database.Functions todavía (lo añadimos cuando integremos
    // supabase gen types), por eso el cast.
    try {
      const { error } = await (supabase as unknown as {
        rpc: (name: string) => Promise<{ error: { message: string } | null }>;
      }).rpc('delete_my_account');
      if (error) return { ok: false, error: friendlyAuthError(error.message) };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error de red al borrar la cuenta';
      return { ok: false, error: msg };
    }
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    resetSyncStatus();
    return { ok: true };
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    isLoading,
    isConfigured: isSupabaseConfigured,
    signUp,
    signInWithPassword,
    verifyEmail,
    resendVerification,
    requestPasswordReset,
    verifyPasswordResetCode,
    updatePassword,
    reauthenticate,
    changeEmail,
    verifyEmailChange,
    signInWithApple,
    signInWithGoogle,
    signOut,
    deleteAccount,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
