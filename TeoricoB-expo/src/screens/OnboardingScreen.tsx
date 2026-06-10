import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store/useStore';
import { AVATAR_COLORS, AvatarView } from '../components/AvatarView';
import { SHADOWS } from '../theme';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../auth/AuthContext';
import AuthScreen from '../auth/AuthScreen';
import TabPager, { TabPagerHandle } from '../components/TabPager';

type StepKey = 'welcome' | 'name' | 'color' | 'account';

export default function OnboardingScreen() {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [showAuth, setShowAuth] = useState(false);
  const completeOnboarding = useStore(s => s.completeOnboarding);
  const { user, isConfigured } = useAuth();
  const pagerRef = useRef<TabPagerHandle>(null);

  const steps: { key: StepKey; cta: string }[] = [
    { key: 'welcome', cta: 'Empezar' },
    { key: 'name',    cta: 'Siguiente' },
    { key: 'color',   cta: 'Siguiente' },
    { key: 'account', cta: user ? 'Comenzar' : 'Crear cuenta' },
  ];

  const goTo = (idx: number) => {
    pagerRef.current?.setPage(idx);
    setPage(idx);
  };

  const handleCTA = () => {
    if (page === 1 && !name.trim()) return;
    if (page < steps.length - 1) { goTo(page + 1); return; }
    if (user) { completeOnboarding(name.trim(), selectedColor); return; }
    setShowAuth(true);
  };

  const handleSkipAuth = () => {
    completeOnboarding(name.trim(), selectedColor);
  };

  useEffect(() => {
    if (user && showAuth) setShowAuth(false);
  }, [user, showAuth]);

  const canAdvance = page !== 1 || name.trim().length > 0;
  const showBack = page > 0;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        {/* Top: back + dots */}
        <View style={s.topRow}>
          {showBack ? (
            <TouchableOpacity onPress={() => goTo(page - 1)} hitSlop={12} style={s.iconBtn}>
              <Ionicons name="chevron-back" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          ) : (
            <View style={s.iconBtn} />
          )}
          <View style={s.dots}>
            {steps.map((_, i) => (
              <View
                key={i}
                style={[
                  s.dot,
                  {
                    backgroundColor: i === page ? theme.primary : theme.border,
                    width: i === page ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>
          <View style={s.iconBtn} />
        </View>

        {/* Pager bloqueado: avanzamos solo con el CTA */}
        <TabPager
          ref={pagerRef}
          initialPage={0}
          scrollEnabled={false}
          style={{ flex: 1 }}
          onPageSelected={p => setPage(p)}
        >
          {/* ── 1: Welcome ──────────────────────────────────────────── */}
          <View key="welcome" style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={s.pageContent} keyboardShouldPersistTaps="handled">
              <LinearGradient
                colors={[theme.primary, theme.primary + 'CC']}
                style={s.welcomeHero}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <Ionicons name="car-sport" size={88} color="#fff" />
              </LinearGradient>
              <Text style={[s.title, { color: theme.textPrimary }]}>
                Aprueba el{'\n'}Teórico de la DGT
              </Text>
              <Text style={[s.subtitle, { color: theme.textSecondary }]}>
                Aprende como jugando con lecciones cortas, ligas, racha diaria y más de 300 preguntas basadas en la normativa oficial.
              </Text>
            </ScrollView>
          </View>

          {/* ── 2: Nombre ──────────────────────────────────────────── */}
          <View key="name" style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={s.pageContent} keyboardShouldPersistTaps="handled">
              <LinearGradient
                colors={[theme.primary + '22', theme.primary + '04']}
                style={s.iconHero}
              >
                <Ionicons name="person-circle-outline" size={72} color={theme.primary} />
              </LinearGradient>
              <Text style={[s.title, { color: theme.textPrimary }]}>¿Cómo te llamas?</Text>
              <Text style={[s.subtitle, { color: theme.textSecondary }]}>
                Tu nombre aparecerá en el ranking de la liga.
              </Text>
              <View style={[s.inputWrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="person-outline" size={20} color={theme.textTertiary} style={s.inputIcon} />
                <TextInput
                  style={[s.input, { color: theme.textPrimary }]}
                  placeholder="Tu nombre..."
                  placeholderTextColor={theme.textTertiary}
                  value={name}
                  onChangeText={setName}
                  maxLength={20}
                  autoFocus={page === 1}
                />
              </View>
            </ScrollView>
          </View>

          {/* ── 3: Color ──────────────────────────────────────────── */}
          <View key="color" style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={s.pageContent} keyboardShouldPersistTaps="handled">
              <LinearGradient
                colors={[selectedColor + '40', selectedColor + '08']}
                style={s.iconHero}
              >
                <AvatarView color={selectedColor} name={name || 'Tú'} size={88} />
              </LinearGradient>
              <Text style={[s.title, { color: theme.textPrimary }]}>Elige tu color</Text>
              <Text style={[s.subtitle, { color: theme.textSecondary }]}>
                Así te reconocerán tus amigos en la clasificación.
              </Text>
              <View style={s.colorGrid}>
                {AVATAR_COLORS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      s.colorBtn,
                      { backgroundColor: c },
                      selectedColor === c && s.colorSelected,
                    ]}
                    onPress={() => setSelectedColor(c)}
                  >
                    {selectedColor === c && (
                      <Ionicons name="checkmark" size={22} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* ── 4: Cuenta ──────────────────────────────────────────── */}
          <View key="account" style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={s.pageContent} keyboardShouldPersistTaps="handled">
              <LinearGradient
                colors={[theme.blue + '22', theme.blue + '04']}
                style={s.iconHero}
              >
                <Ionicons name="cloud-upload-outline" size={72} color={theme.blue} />
              </LinearGradient>
              <Text style={[s.title, { color: theme.textPrimary }]}>Guarda tu progreso</Text>
              <Text style={[s.subtitle, { color: theme.textSecondary }]}>
                Crea cuenta con email para sincronizar tu racha, XP y logros entre dispositivos. Puedes saltarlo y hacerlo más tarde.
              </Text>

              {user && (
                <View style={[s.accountCard, { backgroundColor: theme.card, borderColor: theme.correct + '40' }]}>
                  <View style={[s.accountIcon, { backgroundColor: theme.correct + '22' }]}>
                    <Ionicons name="checkmark-circle" size={28} color={theme.correct} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.accountTitle, { color: theme.textPrimary }]}>Sesión iniciada</Text>
                    <Text style={[s.accountEmail, { color: theme.textSecondary }]} numberOfLines={1}>
                      {user.email}
                    </Text>
                  </View>
                </View>
              )}

              {!isConfigured && (
                <View style={[s.warnCard, { backgroundColor: theme.yellow + '20', borderColor: theme.yellow + '40' }]}>
                  <Ionicons name="information-circle" size={18} color={theme.orange} />
                  <Text style={[s.warnText, { color: theme.textPrimary }]}>
                    La sincronización en la nube se activará cuando termines la configuración inicial. Puedes seguir y crear cuenta más tarde.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </TabPager>

        {/* Footer: CTA + skip (en último paso si no user) */}
        <View style={s.footer}>
          <TouchableOpacity
            style={{ borderRadius: 16, overflow: 'hidden', opacity: canAdvance ? 1 : 0.4 }}
            onPress={handleCTA}
            disabled={!canAdvance}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[theme.primary, theme.primary + 'CC']}
              style={s.cta}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={s.ctaText}>{steps[page].cta}</Text>
              <Ionicons
                name={page === 3 && !user ? 'mail-unread' : 'arrow-forward'}
                size={20} color="#fff"
              />
            </LinearGradient>
          </TouchableOpacity>

          {page === 3 && !user && (
            <TouchableOpacity onPress={handleSkipAuth} activeOpacity={0.7} style={s.skipBtn}>
              <Text style={[s.skipText, { color: theme.textSecondary }]}>Continuar sin cuenta</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showAuth} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAuth(false)}>
        <AuthScreen onClose={() => setShowAuth(false)} initialMode="signup" />
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14,
  },
  iconBtn: { width: 28, alignItems: 'flex-start' },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
  pageContent: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32, gap: 18, alignItems: 'center' },
  welcomeHero: {
    width: 200, height: 200, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium,
  },
  iconHero: { width: 150, height: 150, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '900', textAlign: 'center', lineHeight: 34 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  inputWrap: {
    width: '100%', flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, paddingHorizontal: 14, borderWidth: 1.5,
    ...SHADOWS.small,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 16, fontSize: 17 },
  colorGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  colorBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  colorSelected: { transform: [{ scale: 1.15 }], ...SHADOWS.medium },
  accountCard: {
    width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 16, padding: 14, borderWidth: 1.5, ...SHADOWS.small,
  },
  accountIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  accountTitle: { fontSize: 15, fontWeight: '700' },
  accountEmail: { fontSize: 13, marginTop: 2 },
  warnCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: 12, padding: 12, width: '100%', borderWidth: 1,
  },
  warnText: { flex: 1, fontSize: 12, lineHeight: 17 },
  footer: { padding: 20, paddingTop: 6 },
  cta: { padding: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  skipBtn: { padding: 12, alignItems: 'center' },
  skipText: { fontSize: 14, fontWeight: '600' },
});
