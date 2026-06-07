/**
 * PreferencesScreen — modo oscuro, sonidos, vibración.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useStore } from '../store/useStore';

interface Props { onBack: () => void; }

export default function PreferencesScreen({ onBack }: Props) {
  const theme = useTheme();
  const isDarkMode = useStore(s => s.isDarkMode);
  const toggleDarkMode = useStore(s => s.toggleDarkMode);
  const soundsEnabled = useStore(s => s.soundsEnabled);
  const toggleSounds = useStore(s => s.toggleSounds);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} hitSlop={12} style={s.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.textPrimary }]}>Preferencias</Text>
        <View style={s.headerBtn} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Row
            icon="moon-outline" label="Modo oscuro" theme={theme}
            value={isDarkMode} onChange={toggleDarkMode}
          />
          <View style={[s.divider, { backgroundColor: theme.border }]} />
          <Row
            icon="volume-low-outline" label="Efectos de sonido" theme={theme}
            value={soundsEnabled} onChange={toggleSounds}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, label, theme, value, onChange }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  theme: ReturnType<typeof useTheme>;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={s.row}>
      <Ionicons name={icon} size={20} color={theme.textSecondary} />
      <Text style={[s.rowLabel, { color: theme.textPrimary }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.border, true: theme.primary + '80' }}
        thumbColor={value ? theme.primary : theme.textTertiary}
      />
    </View>
  );
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
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  divider: { height: 0.5, marginHorizontal: 16 },
});
