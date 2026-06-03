/**
 * AuthScreen — pantalla modal de login/signup.
 *
 * Método principal: email + magic link. El usuario introduce su email,
 * Supabase le envía un enlace, y al pulsarlo entra autenticado.
 *
 * Métodos secundarios (deshabilitados todavía):
 * - Apple Sign-In — requiere cuenta dev Apple + expo-apple-authentication.
 * - Google Sign-In — requiere OAuth config + redirect.
 *
 * Se invoca desde ProfileScreen como Modal a pantalla completa.
 */
import React, { useState } from 'react';
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
}

type ScreenState =
  | { phase: 'idle' }
  | { phase: 'sending' }
  | { phase: 'sent'; email: string }
  | { phase: 'error'; message: string };

export default function AuthScreen({ onClose }: Props) {
  const theme = useTheme();
  const { signInWithMagicLink, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<ScreenState>({ phase: 'idle' });

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isSending = state.phase === 'sending';

  const onSubmit = async () => {
    if (!emailValid || isSending) return;
    setState({ phase: 'sending' });
    const result = await signInWithMagicLink(email);
    if (result.ok) {
      setState({ phase: 'sent', email: email.trim() });
    } else {
      setState({ phase: 'error', message: result.error ?? 'Error desconocido' });
    }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.flex}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={26} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          {/* Hero */}
          <View style={s.hero}>
            <View style={[s.iconCircle, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="cloud-upload" size={40} color={theme.primary} />
            </View>
            <Text style={[s.title, { color: theme.textPrimary }]}>
              Guarda tu progreso
            </Text>
            <Text style={[s.subtitle, { color: theme.textSecondary }]}>
              Crea una cuenta para sincronizar tu racha, XP y logros
              entre todos tus dispositivos. Es gratis y opcional.
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

          {/* Estado: sent */}
          {state.phase === 'sent' && (
            <View style={[s.sentCard, { backgroundColor: theme.correct + '15', borderColor: theme.correct }]}>
              <Ionicons name="mail" size={28} color={theme.correct} />
              <Text style={[s.sentTitle, { color: theme.textPrimary }]}>Revisa tu email</Text>
              <Text style={[s.sentBody, { color: theme.textSecondary }]}>
                Hemos enviado un enlace a{'\n'}
                <Text style={{ fontWeight: '700', color: theme.textPrimary }}>{state.email}</Text>{'\n\n'}
                Pulsa el enlace para entrar. Puedes cerrar esta pantalla.
              </Text>
              <TouchableOpacity
                onPress={() => setState({ phase: 'idle' })}
                style={[s.linkBtn]}
              >
                <Text style={[s.linkBtnTxt, { color: theme.primary }]}>
                  Usar otro email
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Estado: idle / error / sending → form */}
          {state.phase !== 'sent' && (
            <>
              <View style={[s.inputCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.inputLabel, { color: theme.textSecondary }]}>
                  Tu email
                </Text>
                <TextInput
                  style={[s.input, { color: theme.textPrimary, borderColor: theme.border }]}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (state.phase === 'error') setState({ phase: 'idle' });
                  }}
                  placeholder="tu@email.com"
                  placeholderTextColor={theme.textTertiary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!isSending}
                />
              </View>

              {state.phase === 'error' && (
                <View style={s.errorRow}>
                  <Ionicons name="alert-circle" size={16} color={theme.wrong} />
                  <Text style={[s.errorTxt, { color: theme.wrong }]}>{state.message}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  s.primaryBtn,
                  { backgroundColor: emailValid && !isSending ? theme.primary : theme.border },
                  SHADOWS.medium,
                ]}
                onPress={onSubmit}
                disabled={!emailValid || isSending}
                activeOpacity={0.85}
              >
                {isSending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="mail-unread" size={18} color="#fff" />
                    <Text style={s.primaryBtnTxt}>Enviarme un enlace</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Métodos alternativos (deshabilitados) */}
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
  closeBtn: {
    padding: 6,
  },
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
    paddingHorizontal: 0,
    borderBottomWidth: 0,
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
  sentCard: {
    padding: 22,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  sentTitle: { fontSize: 18, fontWeight: '700' },
  sentBody: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  linkBtn: { marginTop: 8, padding: 8 },
  linkBtnTxt: { fontSize: 13, fontWeight: '600' },
});
