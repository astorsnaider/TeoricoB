/**
 * SettingsScreen — hub principal de ajustes con secciones CUENTA / SOPORTE
 * / LEGAL. Cada fila abre una sub-pantalla mediante SubPage.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useStore } from '../store/useStore';
import { useAuth } from '../auth/AuthContext';
import SubPage from '../components/SubPage';
import PreferencesScreen from './PreferencesScreen';
import ProfileEditScreen from './ProfileEditScreen';
import NotificationsScreen from './NotificationsScreen';
import PrivacyScreen from './PrivacyScreen';
import ComingSoonScreen from './ComingSoonScreen';
import LegalScreen from './LegalScreen';
import StatsScreen from './StatsScreen';

type SubScreen = 'preferences' | 'profile' | 'notifications' | 'privacy' | 'help' | 'suggestions' | 'legal' | 'stats';

interface Props { onBack: () => void; }

export default function SettingsScreen({ onBack }: Props) {
  const theme = useTheme();
  const { user: authUser, signOut, deleteAccount } = useAuth();
  const resetProgress = useStore(s => s.resetProgress);
  const [openSub, setOpenSub] = useState<SubScreen | null>(null);

  const onDeleteAccount = () => {
    Alert.alert(
      'Borrar mi cuenta',
      'Se eliminarán de forma permanente tus datos en la nube: progreso, racha, logros, fallos, exámenes y amigos.\n\nEsta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', style: 'destructive', onPress: () => {
            Alert.alert(
              '¿Confirmas el borrado?',
              'Si sigues, no podrás recuperar tu progreso.',
              [
                { text: 'No, cancelar', style: 'cancel' },
                { text: 'Sí, borrar mi cuenta', style: 'destructive', onPress: async () => {
                    const result = await deleteAccount();
                    if (result.ok) {
                      resetProgress();
                      Alert.alert('Cuenta eliminada', 'Tus datos se han borrado. Gracias por haber usado Teoric.');
                      onBack();
                    } else {
                      Alert.alert('No se pudo borrar', result.error ?? 'Inténtalo de nuevo más tarde.');
                    }
                } },
              ]
            );
        } },
      ]
    );
  };

  const onSignOut = () => {
    Alert.alert('Cerrar sesión', 'Tu progreso local seguirá disponible. ¿Cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
        <View style={[s.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onBack} hitSlop={12} style={s.headerBtn}>
            <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: theme.textPrimary }]}>Ajustes</Text>
          <View style={s.headerBtn} />
        </View>

        <ScrollView contentContainerStyle={s.content}>
          <Section title="CUENTA" theme={theme}>
            <Row icon="person-circle-outline" label="Perfil"      theme={theme} onPress={() => setOpenSub('profile')} />
            <Divider theme={theme} />
            <Row icon="options-outline"        label="Preferencias" theme={theme} onPress={() => setOpenSub('preferences')} />
            <Divider theme={theme} />
            <Row icon="notifications-outline"  label="Notificaciones" theme={theme} onPress={() => setOpenSub('notifications')} />
            <Divider theme={theme} />
            <Row icon="shield-checkmark-outline" label="Privacidad" theme={theme} onPress={() => setOpenSub('privacy')} />
          </Section>

          <Section title="ESTADÍSTICAS" theme={theme}>
            <Row icon="stats-chart-outline"    label="Estadísticas detalladas" theme={theme} onPress={() => setOpenSub('stats')} />
          </Section>

          <Section title="SOPORTE" theme={theme}>
            <Row icon="help-circle-outline"    label="Centro de ayuda" theme={theme} onPress={() => setOpenSub('help')} />
            <Divider theme={theme} />
            <Row icon="bulb-outline"           label="Sugerencias" theme={theme} onPress={() => setOpenSub('suggestions')} />
          </Section>

          <Section title="LEGAL" theme={theme}>
            <Row icon="document-text-outline" label="Términos y privacidad" theme={theme} onPress={() => setOpenSub('legal')} />
          </Section>

          {authUser && (
            <TouchableOpacity onPress={onSignOut} style={[s.signOutBtn, { borderColor: theme.border }]}>
              <Ionicons name="log-out-outline" size={18} color={theme.textSecondary} />
              <Text style={[s.signOutTxt, { color: theme.textSecondary }]}>Cerrar sesión</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>

      {openSub === 'preferences' && (
        <SubPage onBack={() => setOpenSub(null)}>
          <PreferencesScreen onBack={() => setOpenSub(null)} />
        </SubPage>
      )}
      {openSub === 'profile' && (
        <SubPage onBack={() => setOpenSub(null)}>
          <ProfileEditScreen
            onBack={() => setOpenSub(null)}
            onDeleteAccount={onDeleteAccount}
          />
        </SubPage>
      )}
      {openSub === 'notifications' && (
        <SubPage onBack={() => setOpenSub(null)}>
          <NotificationsScreen onBack={() => setOpenSub(null)} />
        </SubPage>
      )}
      {openSub === 'privacy' && (
        <SubPage onBack={() => setOpenSub(null)}>
          <PrivacyScreen onBack={() => setOpenSub(null)} />
        </SubPage>
      )}
      {openSub === 'help' && (
        <SubPage onBack={() => setOpenSub(null)}>
          <ComingSoonScreen
            onBack={() => setOpenSub(null)}
            title="Centro de ayuda"
            icon="help-circle"
            description="Estamos preparando un centro de ayuda con respuestas a las preguntas más frecuentes y guías de uso. Mientras tanto, puedes escribirnos a soporte si lo necesitas."
          />
        </SubPage>
      )}
      {openSub === 'suggestions' && (
        <SubPage onBack={() => setOpenSub(null)}>
          <ComingSoonScreen
            onBack={() => setOpenSub(null)}
            title="Sugerencias"
            icon="bulb"
            description="Pronto podrás enviarnos ideas para mejorar Teoric directamente desde aquí."
          />
        </SubPage>
      )}
      {openSub === 'legal' && (
        <SubPage onBack={() => setOpenSub(null)}>
          <LegalScreen onBack={() => setOpenSub(null)} />
        </SubPage>
      )}
      {openSub === 'stats' && (
        <SubPage onBack={() => setOpenSub(null)}>
          <StatsScreen onBack={() => setOpenSub(null)} />
        </SubPage>
      )}
    </View>
  );
}

function Section({ title, theme, children }: { title: string; theme: ReturnType<typeof useTheme>; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
      <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {children}
      </View>
    </View>
  );
}

function Row({ icon, label, theme, onPress }: {
  icon: keyof typeof Ionicons.glyphMap; label: string;
  theme: ReturnType<typeof useTheme>; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.6}>
      <Ionicons name={icon} size={20} color={theme.textSecondary} />
      <Text style={[s.rowLabel, { color: theme.textPrimary }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
    </TouchableOpacity>
  );
}

function Divider({ theme }: { theme: ReturnType<typeof useTheme> }) {
  return <View style={{ height: 0.5, backgroundColor: theme.border, marginHorizontal: 16 }} />;
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingVertical: 10, borderBottomWidth: 0.5,
  },
  headerBtn: { width: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  content: { padding: 16, gap: 18 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, paddingHorizontal: 4 },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, borderWidth: 1.5, padding: 13, marginTop: 8,
  },
  signOutTxt: { fontSize: 14, fontWeight: '700' },
});
