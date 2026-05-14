import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useStore } from '../store/useStore';
import { COLORS, SHADOWS } from '../theme';

const AVATARS = ['🚗','🚙','🏎️','🚕','🚐','🚌','🛻','🏍️','🚓','🚑'];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🚗');
  const completeOnboarding = useStore(s => s.completeOnboarding);

  const screens = [
    {
      title: '¡Aprueba el\nTeórico!',
      subtitle: 'Estudia como jugando. Racha diaria, ligas, amigos y más de 150 preguntas DGT.',
      emoji: '🚦',
      cta: 'Empezar',
    },
    {
      title: '¿Cómo te llamas?',
      subtitle: 'Tu nombre aparecerá en el ranking de la liga.',
      emoji: null,
      cta: 'Siguiente',
    },
    {
      title: 'Elige tu avatar',
      subtitle: 'Te representará en las ligas y con tus amigos.',
      emoji: null,
      cta: '¡Comenzar!',
    },
  ];

  const current = screens[step];

  const handleCTA = () => {
    if (step === 0) { setStep(1); return; }
    if (step === 1) {
      if (!name.trim()) return;
      setStep(2);
      return;
    }
    completeOnboarding(name.trim(), avatar);
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

          {/* Progress dots */}
          <View style={s.dots}>
            {[0,1,2].map(i => (
              <View key={i} style={[s.dot, i === step && s.dotActive]} />
            ))}
          </View>

          {/* Emoji hero */}
          {current.emoji && (
            <Text style={s.hero}>{current.emoji}</Text>
          )}

          <Text style={s.title}>{current.title}</Text>
          <Text style={s.subtitle}>{current.subtitle}</Text>

          {/* Step 1: Name input */}
          {step === 1 && (
            <TextInput
              style={s.input}
              placeholder="Tu nombre..."
              placeholderTextColor={COLORS.secondary}
              value={name}
              onChangeText={setName}
              maxLength={20}
              autoFocus
            />
          )}

          {/* Step 2: Avatar selector */}
          {step === 2 && (
            <View style={s.avatarGrid}>
              {AVATARS.map(em => (
                <TouchableOpacity
                  key={em}
                  style={[s.avatarBtn, avatar === em && s.avatarSelected]}
                  onPress={() => setAvatar(em)}
                >
                  <Text style={s.avatarEmoji}>{em}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[s.cta, step === 1 && !name.trim() && s.ctaDisabled]}
            onPress={handleCTA}
            activeOpacity={0.85}
          >
            <Text style={s.ctaText}>{current.cta}</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 40 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.primary, width: 24 },
  hero: { fontSize: 80, marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.dark, textAlign: 'center', marginBottom: 12, lineHeight: 38 },
  subtitle: { fontSize: 16, color: COLORS.secondary, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  input: {
    width: '100%', backgroundColor: COLORS.card, borderRadius: 14, padding: 16,
    fontSize: 18, color: COLORS.dark, marginBottom: 24, borderWidth: 1.5, borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 32 },
  avatarBtn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.card,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent',
    ...SHADOWS.small,
  },
  avatarSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
  avatarEmoji: { fontSize: 32 },
  cta: {
    width: '100%', backgroundColor: COLORS.primary, borderRadius: 16, padding: 18,
    alignItems: 'center', ...SHADOWS.medium,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
