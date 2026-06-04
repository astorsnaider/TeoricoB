/**
 * AuthScreen — pantalla modal de autenticación con email + contraseña.
 *
 * Modos:
 * - login: email + contraseña. Si la cuenta no está verificada, redirige
 *   automáticamente a verify-signup.
 * - signup: nombre + email + contraseña. Tras submit, redirige a
 *   verify-signup con el email para introducir el código.
 * - verify-signup: input código 6 dígitos. Al verificar, sesión abierta.
 * - forgot-email: pide email para reset.
 * - forgot-code: pide código 6 dígitos del email de reset.
 * - forgot-new-password: nueva contraseña + confirmación.
 *
 * Diseño: SafeArea + KeyboardAvoidingView + ScrollView para no romper
 * en pantallas pequeñas con teclado abierto. Auto-close al completar
 * login/signup (detectado por user del AuthContext).
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';
import { useAuth } from './AuthContext';

interface Props {
  onClose: () => void;
  /** Modo inicial (default: 'login'). Para abrir directamente en signup desde el Onboarding. */
  initialMode?: 'login' | 'signup';
}

type AuthView =
  | { kind: 'login' }
  | { kind: 'signup' }
  | { kind: 'verify-signup'; email: string }
  | { kind: 'forgot-email' }
  | { kind: 'forgot-code'; email: string }
  | { kind: 'forgot-new-password'; email: string };

export default function AuthScreen({ onClose, initialMode = 'login' }: Props) {
  const theme = useTheme();
  const {
    isConfigured, user,
    signUp, signInWithPassword, verifyEmail, resendVerification,
    requestPasswordReset, verifyPasswordResetCode, updatePassword,
  } = useAuth();

  const [view, setView] = useState<AuthView>({ kind: initialMode });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const tokenRef = useRef<TextInput>(null);

  // Si el usuario se autentica con éxito, cerramos automáticamente
  useEffect(() => {
    if (user) onClose();
  }, [user, onClose]);

  // Auto-focus en input de código
  useEffect(() => {
    if (view.kind === 'verify-signup' || view.kind === 'forgot-code') {
      const t = setTimeout(() => tokenRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [view.kind]);

  // Limpiar mensajes al cambiar de vista
  useEffect(() => {
    setErrorMsg(null);
    setInfoMsg(null);
    setToken('');
  }, [view.kind]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = password.length >= 8;
  const passwordsMatch = password === password2;
  const tokenValid = /^\d{6}$/.test(token.trim());

  // ── HANDLERS ───────────────────────────────────────────────────────

  const handleLogin = async () => {
    if (!emailValid || !password || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    const result = await signInWithPassword(email, password);
    setIsSubmitting(false);
    if (result.ok) return; // useEffect cierra el modal
    if (result.needsEmailVerification) {
      setInfoMsg(null);
      setView({ kind: 'verify-signup', email: email.trim().toLowerCase() });
      // Intentar reenviar el código automáticamente
      resendVerification(email).catch(() => undefined);
    } else {
      setErrorMsg(result.error ?? 'Error desconocido');
    }
  };

  const handleSignup = async () => {
    if (!name.trim() || !emailValid || !passwordValid || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    const result = await signUp(name, email, password);
    setIsSubmitting(false);
    if (!result.ok) {
      setErrorMsg(result.error ?? 'Error desconocido');
      return;
    }
    if (result.needsEmailVerification) {
      setView({ kind: 'verify-signup', email: email.trim().toLowerCase() });
    }
    // Si no necesita verificar (proyecto con email_confirm desactivado),
    // el useEffect del user cerrará el modal.
  };

  const handleVerifySignup = async () => {
    if (view.kind !== 'verify-signup' || !tokenValid || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    const result = await verifyEmail(view.email, token);
    setIsSubmitting(false);
    if (!result.ok) {
      setErrorMsg(result.error ?? 'Código incorrecto');
    }
    // Si ok, useEffect del user cierra el modal
  };

  const handleResendSignupCode = async () => {
    if (view.kind !== 'verify-signup' || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setInfoMsg(null);
    const result = await resendVerification(view.email);
    setIsSubmitting(false);
    if (result.ok) {
      setInfoMsg('Te hemos enviado un nuevo código.');
    } else {
      setErrorMsg(result.error ?? 'No se pudo reenviar el código.');
    }
  };

  const handleForgotRequest = async () => {
    if (!emailValid || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    const result = await requestPasswordReset(email);
    setIsSubmitting(false);
    if (result.ok) {
      setView({ kind: 'forgot-code', email: email.trim().toLowerCase() });
    } else {
      setErrorMsg(result.error ?? 'Error desconocido');
    }
  };

  const handleForgotVerify = async () => {
    if (view.kind !== 'forgot-code' || !tokenValid || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    const result = await verifyPasswordResetCode(view.email, token);
    setIsSubmitting(false);
    if (result.ok) {
      setPassword('');
      setPassword2('');
      setView({ kind: 'forgot-new-password', email: view.email });
    } else {
      setErrorMsg(result.error ?? 'Código incorrecto');
    }
  };

  const handleUpdatePassword = async () => {
    if (view.kind !== 'forgot-new-password' || !passwordValid || !passwordsMatch || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    const result = await updatePassword(password);
    setIsSubmitting(false);
    if (result.ok) {
      setInfoMsg('Contraseña actualizada. Ya estás dentro.');
    } else {
      setErrorMsg(result.error ?? 'Error al actualizar la contraseña.');
    }
  };

  // ── RENDER HELPERS ─────────────────────────────────────────────────

  const renderTabSwitcher = () => (
    <View style={[s.tabRow, { backgroundColor: theme.bg2, borderColor: theme.border }]}>
      <TouchableOpacity
        style={[s.tabBtn, view.kind === 'login' && { backgroundColor: theme.card, ...SHADOWS.small }]}
        onPress={() => { setView({ kind: 'login' }); setPassword(''); }}
      >
        <Text style={[s.tabTxt, { color: view.kind === 'login' ? theme.textPrimary : theme.textSecondary }]}>
          Iniciar sesión
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.tabBtn, view.kind === 'signup' && { backgroundColor: theme.card, ...SHADOWS.small }]}
        onPress={() => { setView({ kind: 'signup' }); setPassword(''); }}
      >
        <Text style={[s.tabTxt, { color: view.kind === 'signup' ? theme.textPrimary : theme.textSecondary }]}>
          Crear cuenta
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => errorMsg && (
    <View style={s.alertRow}>
      <Ionicons name="alert-circle" size={16} color={theme.wrong} />
      <Text style={[s.alertTxt, { color: theme.wrong }]}>{errorMsg}</Text>
    </View>
  );

  const renderInfo = () => infoMsg && (
    <View style={[s.alertRow, { backgroundColor: theme.correct + '15', borderRadius: 8, padding: 8 }]}>
      <Ionicons name="checkmark-circle" size={16} color={theme.correct} />
      <Text style={[s.alertTxt, { color: theme.correct }]}>{infoMsg}</Text>
    </View>
  );

  // ── RENDER ─────────────────────────────────────────────────────────

  const isVerifyView = view.kind === 'verify-signup' || view.kind === 'forgot-code';
  const heroIcon = isVerifyView ? 'mail-open' : view.kind.startsWith('forgot') ? 'lock-open' : 'cloud-upload';
  const heroTitle =
    view.kind === 'login' ? 'Bienvenido de vuelta' :
    view.kind === 'signup' ? 'Crea tu cuenta' :
    view.kind === 'verify-signup' ? 'Confirma tu email' :
    view.kind === 'forgot-email' ? 'Restablecer contraseña' :
    view.kind === 'forgot-code' ? 'Revisa tu email' :
    'Nueva contraseña';
  const heroSub =
    view.kind === 'login' ? 'Entra para sincronizar tu progreso entre dispositivos.' :
    view.kind === 'signup' ? 'Solo necesitas un email y una contraseña. Te enviaremos un código para verificar tu cuenta.' :
    view.kind === 'verify-signup' ? `Hemos enviado un código de 6 dígitos a ${view.email}` :
    view.kind === 'forgot-email' ? 'Te enviaremos un código por email para que vuelvas a entrar.' :
    view.kind === 'forgot-code' ? `Hemos enviado un código de 6 dígitos a ${view.email}` :
    'Elige una contraseña nueva. Mínimo 8 caracteres.';

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.flex}
      >
        <View style={s.header}>
          <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={26} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          {/* Hero */}
          <View style={s.hero}>
            <View style={[s.iconCircle, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name={heroIcon} size={36} color={theme.primary} />
            </View>
            <Text style={[s.title, { color: theme.textPrimary }]}>{heroTitle}</Text>
            <Text style={[s.subtitle, { color: theme.textSecondary }]}>{heroSub}</Text>
          </View>

          {!isConfigured && (
            <View style={[s.warningCard, { backgroundColor: theme.wrong + '15', borderColor: theme.wrong }]}>
              <Ionicons name="warning" size={18} color={theme.wrong} />
              <Text style={[s.warningTxt, { color: theme.textPrimary }]}>
                Auth no configurado. Falta EXPO_PUBLIC_SUPABASE_URL.
              </Text>
            </View>
          )}

          {/* Tab switcher solo en login/signup */}
          {(view.kind === 'login' || view.kind === 'signup') && renderTabSwitcher()}

          {/* ── MODO LOGIN ──────────────────────────────────────────── */}
          {view.kind === 'login' && (
            <>
              <View style={[s.inputCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.inputLabel, { color: theme.textSecondary }]}>Email</Text>
                <TextInput
                  style={[s.input, { color: theme.textPrimary }]}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrorMsg(null); }}
                  placeholder="tu@email.com"
                  placeholderTextColor={theme.textTertiary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!isSubmitting}
                  returnKeyType="next"
                />
              </View>

              <View style={[s.inputCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.inputLabel, { color: theme.textSecondary }]}>Contraseña</Text>
                <View style={s.passwordRow}>
                  <TextInput
                    style={[s.input, { color: theme.textPrimary, flex: 1 }]}
                    value={password}
                    onChangeText={(t) => { setPassword(t); setErrorMsg(null); }}
                    placeholder="••••••••"
                    placeholderTextColor={theme.textTertiary}
                    secureTextEntry={!showPassword}
                    textContentType="password"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isSubmitting}
                    onSubmitEditing={handleLogin}
                    returnKeyType="done"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={12}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={theme.textTertiary} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity onPress={() => { setEmail(email); setView({ kind: 'forgot-email' }); }} style={s.linkBtnRight}>
                <Text style={[s.linkBtnTxt, { color: theme.primary }]}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              {renderError()}

              <TouchableOpacity
                style={[s.primaryBtn, { backgroundColor: emailValid && password && !isSubmitting ? theme.primary : theme.border }, SHADOWS.medium]}
                onPress={handleLogin}
                disabled={!emailValid || !password || isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.primaryBtnTxt}>Entrar</Text>
                )}
              </TouchableOpacity>

              {renderAltMethods(theme)}
            </>
          )}

          {/* ── MODO SIGNUP ─────────────────────────────────────────── */}
          {view.kind === 'signup' && (
            <>
              <View style={[s.inputCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.inputLabel, { color: theme.textSecondary }]}>Nombre</Text>
                <TextInput
                  style={[s.input, { color: theme.textPrimary }]}
                  value={name}
                  onChangeText={(t) => { setName(t); setErrorMsg(null); }}
                  placeholder="Cómo te llamas"
                  placeholderTextColor={theme.textTertiary}
                  autoCapitalize="words"
                  maxLength={40}
                  editable={!isSubmitting}
                />
              </View>

              <View style={[s.inputCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.inputLabel, { color: theme.textSecondary }]}>Email</Text>
                <TextInput
                  style={[s.input, { color: theme.textPrimary }]}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrorMsg(null); }}
                  placeholder="tu@email.com"
                  placeholderTextColor={theme.textTertiary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!isSubmitting}
                />
              </View>

              <View style={[s.inputCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.inputLabel, { color: theme.textSecondary }]}>Contraseña</Text>
                <View style={s.passwordRow}>
                  <TextInput
                    style={[s.input, { color: theme.textPrimary, flex: 1 }]}
                    value={password}
                    onChangeText={(t) => { setPassword(t); setErrorMsg(null); }}
                    placeholder="Mínimo 8 caracteres"
                    placeholderTextColor={theme.textTertiary}
                    secureTextEntry={!showPassword}
                    textContentType="newPassword"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isSubmitting}
                    onSubmitEditing={handleSignup}
                    returnKeyType="done"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={12}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={theme.textTertiary} />
                  </TouchableOpacity>
                </View>
                {password.length > 0 && (
                  <Text style={[s.hint, { color: passwordValid ? theme.correct : theme.textTertiary }]}>
                    {passwordValid ? '✓ Longitud OK' : `Te faltan ${8 - password.length} caracteres`}
                  </Text>
                )}
              </View>

              {renderError()}

              <TouchableOpacity
                style={[s.primaryBtn, { backgroundColor: name.trim() && emailValid && passwordValid && !isSubmitting ? theme.primary : theme.border }, SHADOWS.medium]}
                onPress={handleSignup}
                disabled={!name.trim() || !emailValid || !passwordValid || isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.primaryBtnTxt}>Crear cuenta</Text>
                )}
              </TouchableOpacity>

              <Text style={[s.legalNote, { color: theme.textTertiary }]}>
                Al crear cuenta aceptas nuestros términos y la política de privacidad.
                Solo guardamos tu progreso de estudio; nunca usaremos tu email para
                marketing.
              </Text>

              {renderAltMethods(theme)}
            </>
          )}

          {/* ── MODO VERIFY SIGNUP ──────────────────────────────────── */}
          {view.kind === 'verify-signup' && (
            <>
              <View style={[s.inputCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.inputLabel, { color: theme.textSecondary }]}>Código de 6 dígitos</Text>
                <TextInput
                  ref={tokenRef}
                  style={[s.codeInput, { color: theme.textPrimary }]}
                  value={token}
                  onChangeText={(t) => {
                    setToken(t.replace(/\D/g, '').slice(0, 6));
                    setErrorMsg(null);
                  }}
                  placeholder="000000"
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  maxLength={6}
                  editable={!isSubmitting}
                  onSubmitEditing={handleVerifySignup}
                />
              </View>

              {renderError()}
              {renderInfo()}

              <TouchableOpacity
                style={[s.primaryBtn, { backgroundColor: tokenValid && !isSubmitting ? theme.primary : theme.border }, SHADOWS.medium]}
                onPress={handleVerifySignup}
                disabled={!tokenValid || isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.primaryBtnTxt}>Confirmar</Text>
                )}
              </TouchableOpacity>

              <View style={s.helpRow}>
                <TouchableOpacity onPress={() => setView({ kind: 'signup' })} style={s.linkBtn}>
                  <Text style={[s.linkBtnTxt, { color: theme.primary }]}>Usar otro email</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleResendSignupCode} disabled={isSubmitting} style={s.linkBtn}>
                  <Text style={[s.linkBtnTxt, { color: theme.textSecondary }]}>Reenviar código</Text>
                </TouchableOpacity>
              </View>

              <Text style={[s.legalNote, { color: theme.textTertiary }]}>
                ¿No te llega? Revisa spam y promociones. Los emails llegan desde
                Supabase mientras no tengamos dominio propio.
              </Text>
            </>
          )}

          {/* ── MODO FORGOT EMAIL ────────────────────────────────────── */}
          {view.kind === 'forgot-email' && (
            <>
              <View style={[s.inputCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.inputLabel, { color: theme.textSecondary }]}>Tu email</Text>
                <TextInput
                  style={[s.input, { color: theme.textPrimary }]}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrorMsg(null); }}
                  placeholder="tu@email.com"
                  placeholderTextColor={theme.textTertiary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!isSubmitting}
                  onSubmitEditing={handleForgotRequest}
                />
              </View>

              {renderError()}

              <TouchableOpacity
                style={[s.primaryBtn, { backgroundColor: emailValid && !isSubmitting ? theme.primary : theme.border }, SHADOWS.medium]}
                onPress={handleForgotRequest}
                disabled={!emailValid || isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.primaryBtnTxt}>Enviarme el código</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setView({ kind: 'login' })} style={s.linkBtnCenter}>
                <Text style={[s.linkBtnTxt, { color: theme.primary }]}>← Volver a iniciar sesión</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── MODO FORGOT CODE ─────────────────────────────────────── */}
          {view.kind === 'forgot-code' && (
            <>
              <View style={[s.inputCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.inputLabel, { color: theme.textSecondary }]}>Código de 6 dígitos</Text>
                <TextInput
                  ref={tokenRef}
                  style={[s.codeInput, { color: theme.textPrimary }]}
                  value={token}
                  onChangeText={(t) => { setToken(t.replace(/\D/g, '').slice(0, 6)); setErrorMsg(null); }}
                  placeholder="000000"
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  maxLength={6}
                  editable={!isSubmitting}
                  onSubmitEditing={handleForgotVerify}
                />
              </View>

              {renderError()}

              <TouchableOpacity
                style={[s.primaryBtn, { backgroundColor: tokenValid && !isSubmitting ? theme.primary : theme.border }, SHADOWS.medium]}
                onPress={handleForgotVerify}
                disabled={!tokenValid || isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnTxt}>Verificar</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setView({ kind: 'forgot-email' })} style={s.linkBtnCenter}>
                <Text style={[s.linkBtnTxt, { color: theme.primary }]}>← Usar otro email</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── MODO FORGOT NEW PASSWORD ─────────────────────────────── */}
          {view.kind === 'forgot-new-password' && (
            <>
              <View style={[s.inputCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.inputLabel, { color: theme.textSecondary }]}>Nueva contraseña</Text>
                <View style={s.passwordRow}>
                  <TextInput
                    style={[s.input, { color: theme.textPrimary, flex: 1 }]}
                    value={password}
                    onChangeText={(t) => { setPassword(t); setErrorMsg(null); }}
                    placeholder="Mínimo 8 caracteres"
                    placeholderTextColor={theme.textTertiary}
                    secureTextEntry={!showPassword}
                    textContentType="newPassword"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isSubmitting}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={12}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={theme.textTertiary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[s.inputCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.inputLabel, { color: theme.textSecondary }]}>Repite la contraseña</Text>
                <TextInput
                  style={[s.input, { color: theme.textPrimary }]}
                  value={password2}
                  onChangeText={(t) => { setPassword2(t); setErrorMsg(null); }}
                  placeholder="Vuelve a escribirla"
                  placeholderTextColor={theme.textTertiary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                  onSubmitEditing={handleUpdatePassword}
                />
                {password2.length > 0 && !passwordsMatch && (
                  <Text style={[s.hint, { color: theme.wrong }]}>Las contraseñas no coinciden.</Text>
                )}
              </View>

              {renderError()}
              {renderInfo()}

              <TouchableOpacity
                style={[s.primaryBtn, { backgroundColor: passwordValid && passwordsMatch && !isSubmitting ? theme.primary : theme.border }, SHADOWS.medium]}
                onPress={handleUpdatePassword}
                disabled={!passwordValid || !passwordsMatch || isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnTxt}>Guardar contraseña</Text>}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Botones Apple/Google (deshabilitados hasta integrarlos) ────────────
function renderAltMethods(theme: ReturnType<typeof useTheme>) {
  return (
    <>
      <View style={s.divider}>
        <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
        <Text style={[s.dividerTxt, { color: theme.textTertiary }]}>o próximamente</Text>
        <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
      </View>
      <View style={s.altRow}>
        <TouchableOpacity
          style={[s.altBtn, { backgroundColor: theme.card, borderColor: theme.border, opacity: 0.5 }]}
          disabled
          activeOpacity={1}
        >
          <Ionicons name="logo-apple" size={20} color={theme.textPrimary} />
          <Text style={[s.altBtnTxt, { color: theme.textPrimary }]}>Apple</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.altBtn, { backgroundColor: theme.card, borderColor: theme.border, opacity: 0.5 }]}
          disabled
          activeOpacity={1}
        >
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text style={[s.altBtnTxt, { color: theme.textPrimary }]}>Google</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  closeBtn: { padding: 6 },
  content: { paddingHorizontal: 22, paddingBottom: 40, gap: 14 },
  hero: { alignItems: 'center', paddingTop: 12, paddingBottom: 6, gap: 10 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 8 },
  warningCard: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  warningTxt: { flex: 1, fontSize: 12 },
  tabRow: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabTxt: { fontSize: 14, fontWeight: '700' },
  inputCard: { padding: 12, borderRadius: 12, borderWidth: 1, gap: 4 },
  inputLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  input: { fontSize: 16, paddingVertical: 4 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codeInput: { fontSize: 28, fontWeight: '700', textAlign: 'center', letterSpacing: 8, paddingVertical: 6 },
  hint: { fontSize: 11, marginTop: 2 },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  alertTxt: { fontSize: 13, flex: 1 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  primaryBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  dividerLine: { flex: 1, height: 1 },
  dividerTxt: { fontSize: 11 },
  altRow: { flexDirection: 'row', gap: 12 },
  altBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  altBtnTxt: { fontSize: 14, fontWeight: '600' },
  legalNote: { fontSize: 11, textAlign: 'center', lineHeight: 16, paddingHorizontal: 6, marginTop: 4 },
  helpRow: { flexDirection: 'row', justifyContent: 'space-between' },
  linkBtn: { padding: 8 },
  linkBtnTxt: { fontSize: 13, fontWeight: '600' },
  linkBtnRight: { alignSelf: 'flex-end', padding: 4 },
  linkBtnCenter: { alignSelf: 'center', padding: 8 },
});
