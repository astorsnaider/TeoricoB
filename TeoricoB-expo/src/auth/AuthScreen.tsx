/**
 * AuthScreen — pantalla modal de login/signup en DOS pasos.
 *
 * Paso 1: el usuario introduce su email → recibe un código de 6
 * dígitos por correo.
 * Paso 2: introduce el código en la app y se autentica.
 *
 * Este flow funciona idéntico en iOS / Android / Web / Expo Go porque
 * no depende de deep links ni de abrir el link desde el dispositivo
 * correcto. Es el patrón estándar de apps mobile modernas (Slack,
 * Notion, Linear…).
 *
 * Si en el futuro queremos magic link, está soportado por Supabase
 * cambiando el template del email.
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
  /** Texto del CTA superior (override para onboarding). */
  ctaTitle?: string;
  /** Subtítulo bajo el CTA (override para onboarding). */
  ctaSubtitle?: string;
}

type Phase =
  | { kind: 'email' }
  | { kind: 'requesting' }
  | { kind: 'code'; email: string }
  | { kind: 'verifying'; email: string; token: string }
  | { kind: 'error'; email?: string; message: string };

export default function AuthScreen({ onClose, ctaTitle, ctaSubtitle }: Props) {
  const theme = useTheme();
  const { requestOtp, verifyOtp, isConfigured, user } = useAuth();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [phase, setPhase] = useState<Phase>({ kind: 'email' });
  const tokenInputRef = useRef<TextInput>(null);

  // Si el usuario completa el login con éxito, cerramos el modal
  useEffect(() => {
    if (user) onClose();
  }, [user, onClose]);

  // Auto-focus en el input de código cuando entramos a esa fase
  useEffect(() => {
    if (phase.kind === 'code') {
      const t = setTimeout(() => tokenInputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [phase.kind]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const tokenValid = /^\d{6}$/.test(token.trim());

  const onRequestCode = async () => {
    if (!emailValid) return;
    setPhase({ kind: 'requesting' });
    const result = await requestOtp(email);
    if (result.ok) {
      setPhase({ kind: 'code', email: email.trim().toLowerCase() });
      setToken('');
    } else {
      setPhase({ kind: 'error', message: result.error ?? 'Error desconocido' });
    }
  };

  const onVerifyCode = async () => {
    if (phase.kind !== 'code' || !tokenValid) return;
    setPhase({ kind: 'verifying', email: phase.email, token });
    const result = await verifyOtp(phase.email, token);
    if (!result.ok) {
      setPhase({ kind: 'error', email: phase.email, message: result.error ?? 'Código incorrecto' });
    }
    // Si OK, el useEffect del user cierra el modal automáticamente.
  };

  const onChangeEmail = () => {
    setPhase({ kind: 'email' });
    setToken('');
  };

  const isSending = phase.kind === 'requesting' || phase.kind === 'verifying';
  const showCodeStep = phase.kind === 'code' || phase.kind === 'verifying' ||
    (phase.kind === 'error' && phase.email);

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
              <Ionicons
                name={showCodeStep ? 'mail-open' : 'cloud-upload'}
                size={40}
                color={theme.primary}
              />
            </View>
            <Text style={[s.title, { color: theme.textPrimary }]}>
              {showCodeStep
                ? 'Revisa tu email'
                : (ctaTitle ?? 'Guarda tu progreso')}
            </Text>
            <Text style={[s.subtitle, { color: theme.textSecondary }]}>
              {showCodeStep
                ? `Hemos enviado un código de 6 dígitos a${'\n'}`
                : (ctaSubtitle ?? 'Crea una cuenta para sincronizar tu racha, XP y logros entre dispositivos. Es gratis y opcional.')}
              {showCodeStep && (
                <Text style={{ fontWeight: '700', color: theme.textPrimary }}>
                  {phase.kind === 'code' || phase.kind === 'verifying' ? phase.email : ''}
                  {phase.kind === 'error' && phase.email ? phase.email : ''}
                </Text>
              )}
            </Text>
          </View>

          {!isConfigured && (
            <View style={[s.warningCard, { backgroundColor: theme.wrong + '15', borderColor: theme.wrong }]}>
              <Ionicons name="warning" size={18} color={theme.wrong} />
              <Text style={[s.warningTxt, { color: theme.textPrimary }]}>
                Auth no configurado. Falta EXPO_PUBLIC_SUPABASE_URL.
              </Text>
            </View>
          )}

          {/* ── Paso 1: email ─────────────────────────────────────────── */}
          {!showCodeStep && (
            <>
              <View style={[s.inputCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.inputLabel, { color: theme.textSecondary }]}>
                  Tu email
                </Text>
                <TextInput
                  style={[s.input, { color: theme.textPrimary }]}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (phase.kind === 'error') setPhase({ kind: 'email' });
                  }}
                  placeholder="tu@email.com"
                  placeholderTextColor={theme.textTertiary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!isSending}
                  onSubmitEditing={onRequestCode}
                  returnKeyType="next"
                />
              </View>

              {phase.kind === 'error' && !phase.email && (
                <View style={s.errorRow}>
                  <Ionicons name="alert-circle" size={16} color={theme.wrong} />
                  <Text style={[s.errorTxt, { color: theme.wrong }]}>{phase.message}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  s.primaryBtn,
                  { backgroundColor: emailValid && !isSending ? theme.primary : theme.border },
                  SHADOWS.medium,
                ]}
                onPress={onRequestCode}
                disabled={!emailValid || isSending}
                activeOpacity={0.85}
              >
                {phase.kind === 'requesting' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="mail-unread" size={18} color="#fff" />
                    <Text style={s.primaryBtnTxt}>Enviarme el código</Text>
                  </>
                )}
              </TouchableOpacity>

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

              <Text style={[s.legalNote, { color: theme.textTertiary }]}>
                Al continuar aceptas nuestros términos y política de privacidad.
                Solo guardamos tu progreso de estudio; nunca usaremos tu email
                para marketing.
              </Text>
            </>
          )}

          {/* ── Paso 2: código ───────────────────────────────────────── */}
          {showCodeStep && (
            <>
              <View style={[s.inputCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.inputLabel, { color: theme.textSecondary }]}>
                  Código de 6 dígitos
                </Text>
                <TextInput
                  ref={tokenInputRef}
                  style={[s.codeInput, { color: theme.textPrimary }]}
                  value={token}
                  onChangeText={(t) => {
                    const digits = t.replace(/\D/g, '').slice(0, 6);
                    setToken(digits);
                    if (phase.kind === 'error') {
                      setPhase({ kind: 'code', email: phase.email ?? '' });
                    }
                  }}
                  placeholder="000000"
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  maxLength={6}
                  editable={!isSending}
                  onSubmitEditing={onVerifyCode}
                  returnKeyType="done"
                />
              </View>

              {phase.kind === 'error' && phase.email && (
                <View style={s.errorRow}>
                  <Ionicons name="alert-circle" size={16} color={theme.wrong} />
                  <Text style={[s.errorTxt, { color: theme.wrong }]}>{phase.message}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  s.primaryBtn,
                  { backgroundColor: tokenValid && !isSending ? theme.primary : theme.border },
                  SHADOWS.medium,
                ]}
                onPress={onVerifyCode}
                disabled={!tokenValid || isSending}
                activeOpacity={0.85}
              >
                {phase.kind === 'verifying' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color="#fff" />
                    <Text style={s.primaryBtnTxt}>Entrar</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={s.helpRow}>
                <TouchableOpacity onPress={onChangeEmail} style={s.linkBtn}>
                  <Text style={[s.linkBtnTxt, { color: theme.primary }]}>
                    Usar otro email
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onRequestCode} disabled={isSending} style={s.linkBtn}>
                  <Text style={[s.linkBtnTxt, { color: theme.textSecondary }]}>
                    Reenviar código
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[s.legalNote, { color: theme.textTertiary }]}>
                ¿No te llega? Revisa la carpeta de spam o promociones. El email
                viene de Supabase (todavía no configurado con el dominio
                TeoricoB).
              </Text>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  closeBtn: { padding: 6 },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 40,
    gap: 18,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 8,
    gap: 12,
  },
  iconCircle: {
    width: 84, height: 84, borderRadius: 42,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 8 },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  warningTxt: { flex: 1, fontSize: 12 },
  inputCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  inputLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  input: {
    fontSize: 16,
    paddingVertical: 6,
  },
  codeInput: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
    paddingVertical: 6,
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  errorTxt: { fontSize: 13, flex: 1 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerTxt: { fontSize: 11 },
  altRow: { flexDirection: 'row', gap: 12 },
  altBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  altBtnTxt: { fontSize: 14, fontWeight: '600' },
  legalNote: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 6,
    marginTop: 8,
  },
  helpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  linkBtn: { padding: 8 },
  linkBtnTxt: { fontSize: 13, fontWeight: '600' },
});
