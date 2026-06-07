/**
 * ComingSoonScreen — placeholder reutilizable para secciones que aún no
 * tienen implementación (centro de ayuda, sugerencias, etc.).
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface Props {
  onBack: () => void;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

export default function ComingSoonScreen({ onBack, title, icon, description }: Props) {
  const theme = useTheme();
  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} hitSlop={12} style={s.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.textPrimary }]}>{title}</Text>
        <View style={s.headerBtn} />
      </View>

      <View style={s.body}>
        <View style={[s.iconCircle, { backgroundColor: theme.primary + '18' }]}>
          <Ionicons name={icon} size={42} color={theme.primary} />
        </View>
        <Text style={[s.bodyTitle, { color: theme.textPrimary }]}>Próximamente</Text>
        <Text style={[s.bodyText, { color: theme.textSecondary }]}>{description}</Text>
      </View>
    </SafeAreaView>
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
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 },
  iconCircle: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  bodyTitle: { fontSize: 22, fontWeight: '800' },
  bodyText: { fontSize: 14, textAlign: 'center', lineHeight: 20, maxWidth: 320 },
});
