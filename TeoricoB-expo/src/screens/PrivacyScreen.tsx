/**
 * PrivacyScreen — gestión de privacidad y datos del usuario.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useStore } from '../store/useStore';

interface Props { onBack: () => void; }

export default function PrivacyScreen({ onBack }: Props) {
  const theme = useTheme();
  const resetProgress = useStore(s => s.resetProgress);

  const confirmReset = () => {
    Alert.alert('Reiniciar progreso', '¿Seguro que quieres borrar todo tu progreso local? Esta acción no afecta tu cuenta.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Reiniciar', style: 'destructive', onPress: resetProgress },
    ]);
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} hitSlop={12} style={s.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.textPrimary }]}>Privacidad</Text>
        <View style={s.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={[s.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="shield-checkmark" size={26} color={theme.blue} />
          <Text style={[s.infoTitle, { color: theme.textPrimary }]}>Tu privacidad importa</Text>
          <Text style={[s.infoBody, { color: theme.textSecondary }]}>
            Teoric procesa tus datos solo para que la app funcione. Los contactos del móvil se hashean
            localmente y no se almacenan. El progreso se sincroniza solo si inicias sesión.
          </Text>
        </View>

        <Section title="Tus datos" theme={theme}>
          <Row
            icon="cloud-download-outline" label="Descargar mis datos"
            sub="Próximamente — recibirás un archivo con tu progreso"
            theme={theme} disabled
          />
          <Divider theme={theme} />
          <Row
            icon="refresh-outline" label="Reiniciar progreso local"
            sub="Borra el avance local sin tocar tu cuenta en la nube"
            theme={theme} onPress={confirmReset} danger
          />
        </Section>

        <Section title="Visibilidad" theme={theme}>
          <Row
            icon="eye-off-outline" label="Búsqueda por nombre"
            sub="Próximamente — controla si otros pueden encontrarte"
            theme={theme} disabled
          />
          <Divider theme={theme} />
          <Row
            icon="book-outline" label="Política de privacidad"
            sub="Léela en la sección Legal"
            theme={theme} disabled
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, theme, children }: { title: string; theme: ReturnType<typeof useTheme>; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{title.toUpperCase()}</Text>
      <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {children}
      </View>
    </View>
  );
}

function Row({ icon, label, sub, theme, onPress, danger, disabled }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; sub?: string;
  theme: ReturnType<typeof useTheme>; onPress?: () => void; danger?: boolean; disabled?: boolean;
}) {
  const color = danger ? theme.wrong : disabled ? theme.textTertiary : theme.textPrimary;
  return (
    <TouchableOpacity
      style={[s.row, disabled && { opacity: 0.7 }]}
      onPress={onPress} disabled={disabled || !onPress} activeOpacity={0.6}
    >
      <Ionicons name={icon} size={20} color={danger ? theme.wrong : theme.textSecondary} />
      <View style={{ flex: 1 }}>
        <Text style={[s.rowLabel, { color }]}>{label}</Text>
        {sub && <Text style={[s.rowSub, { color: theme.textTertiary }]}>{sub}</Text>}
      </View>
      {onPress && !disabled && <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />}
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
  content: { padding: 16, gap: 16 },
  infoCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 8, alignItems: 'center' },
  infoTitle: { fontSize: 16, fontWeight: '800' },
  infoBody: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, paddingHorizontal: 4 },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowSub: { fontSize: 11, marginTop: 2 },
});
