import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store/useStore';
import { AVATAR_COLORS, AvatarView } from '../components/AvatarView';
import { SHADOWS } from '../theme';

const COLORS_PRIMARY = '#E63946';

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const completeOnboarding = useStore(s => s.completeOnboarding);

  const steps = [
    {
      icon: 'car-sport' as const,
      title: 'Aprueba el\nTeórico de la DGT',
      subtitle: 'Aprende como jugando con lecciones cortas, ligas, racha diaria y más de 200 preguntas basadas en la normativa oficial.',
      cta: 'Empezar',
    },
    {
      icon: 'person-circle-outline' as const,
      title: '¿Cómo te llamas?',
      subtitle: 'Tu nombre aparecerá en el ranking de la liga.',
      cta: 'Siguiente',
    },
    {
      icon: 'color-palette-outline' as const,
      title: 'Elige tu color',
      subtitle: 'Así te reconocerán tus amigos en la clasificación.',
      cta: 'Comenzar',
    },
  ];

  const current = steps[step];

  const handleCTA = () => {
    if (step === 0) { setStep(1); return; }
    if (step === 1) {
      if (!name.trim()) return;
      setStep(2);
      return;
    }
    completeOnboarding(name.trim(), selectedColor);
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

          {/* Progress dots */}
          <View style={s.dots}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[s.dot, i === step && s.dotActive]} />
            ))}
          </View>

          {/* Icon hero */}
          <LinearGradient colors={['#E6394615', '#E6394605']} style={s.iconHero}>
            <Ionicons name={current.icon} size={72} color={COLORS_PRIMARY} />
          </LinearGradient>

          <Text style={s.title}>{current.title}</Text>
          <Text style={s.subtitle}>{current.subtitle}</Text>

          {/* Step 1: Name */}
          {step === 1 && (
            <View style={s.inputWrap}>
              <Ionicons name="person-outline" size={20} color="#888" style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Tu nombre..."
                placeholderTextColor="#AAA"
                value={name}
                onChangeText={setName}
                maxLength={20}
                autoFocus
              />
            </View>
          )}

          {/* Step 2: Color picker */}
          {step === 2 && (
            <View style={s.colorGrid}>
              {AVATAR_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[s.colorBtn, { backgroundColor: color }, selectedColor === color && s.colorSelected]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={22} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
              {/* Preview */}
              <View style={s.previewRow}>
                <AvatarView color={selectedColor} name={name || 'Tú'} size={52} />
                <Text style={s.previewName}>{name || 'Tu nombre'}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[s.cta, step === 1 && !name.trim() && s.ctaDisabled]}
            onPress={handleCTA}
            activeOpacity={0.85}
          >
            <Text style={s.ctaText}>{current.cta}</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E5EA' },
  dotActive: { backgroundColor: COLORS_PRIMARY, width: 24 },
  iconHero: { width: 120, height: 120, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: '800', color: '#1C1C1E', textAlign: 'center', lineHeight: 36 },
  subtitle: { fontSize: 15, color: '#6D6D72', textAlign: 'center', lineHeight: 22 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', width: '100%',
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14,
    borderWidth: 1.5, borderColor: '#E5E5EA', ...SHADOWS.small,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 16, fontSize: 17, color: '#1C1C1E' },
  colorGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  colorBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  colorSelected: { transform: [{ scale: 1.15 }], ...SHADOWS.medium },
  previewRow: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8, backgroundColor: '#fff', borderRadius: 16, padding: 14, ...SHADOWS.small },
  previewName: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  cta: {
    width: '100%', backgroundColor: COLORS_PRIMARY, borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    ...SHADOWS.medium,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
