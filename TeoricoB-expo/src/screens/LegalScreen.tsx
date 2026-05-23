import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { LEGAL } from '../legal/config';
import {
  AVISO_LEGAL, TERMINOS, PRIVACIDAD, CREDITOS,
} from '../legal/legalTexts';

type DocId = 'aviso' | 'terminos' | 'privacidad' | 'creditos';

interface Props {
  onBack: () => void;
}

const DOCS: { id: DocId; title: string; icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { id: 'aviso',      title: 'Aviso Legal',         icon: 'document-text-outline', text: AVISO_LEGAL },
  { id: 'terminos',   title: 'Términos y Condiciones', icon: 'reader-outline',     text: TERMINOS },
  { id: 'privacidad', title: 'Política de Privacidad', icon: 'lock-closed-outline', text: PRIVACIDAD },
  { id: 'creditos',   title: 'Créditos y Fuentes',  icon: 'library-outline',       text: CREDITOS },
];

export default function LegalScreen({ onBack }: Props) {
  const theme = useTheme();
  const [selected, setSelected] = useState<DocId | null>(null);

  if (selected) {
    const doc = DOCS.find(d => d.id === selected)!;
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
        <View style={[s.docHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => setSelected(null)} style={s.headerBack}>
            <Ionicons name="arrow-back" size={20} color={theme.primary} />
            <Text style={[s.headerBackTxt, { color: theme.primary }]}>Legal</Text>
          </TouchableOpacity>
          <Text style={[s.docTitle, { color: theme.textPrimary }]}>{doc.title}</Text>
        </View>
        <ScrollView contentContainerStyle={s.docBody}>
          <Text style={[s.docText, { color: theme.textPrimary }]}>{doc.text}</Text>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={s.content}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Ionicons name="arrow-back" size={16} color={theme.primary} />
          <Text style={[s.backTxt, { color: theme.primary }]}>Perfil</Text>
        </TouchableOpacity>

        <Text style={[s.title, { color: theme.textPrimary }]}>Información Legal</Text>
        <Text style={[s.subtitle, { color: theme.textSecondary }]}>
          Documentos legales, créditos y fuentes utilizadas
        </Text>

        <View style={[s.responsibleCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="shield-checkmark-outline" size={18} color={theme.blue} />
          <View style={{ flex: 1 }}>
            <Text style={[s.responsibleLabel, { color: theme.textSecondary }]}>Responsable de la aplicación</Text>
            <Text style={[s.responsibleName, { color: theme.textPrimary }]}>{LEGAL.RESPONSIBLE_NAME}</Text>
            <Text style={[s.responsibleEmail, { color: theme.textSecondary }]}>{LEGAL.CONTACT_EMAIL}</Text>
          </View>
        </View>

        {DOCS.map(doc => (
          <TouchableOpacity
            key={doc.id}
            style={[s.docCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setSelected(doc.id)}
            activeOpacity={0.85}
          >
            <View style={[s.docIcon, { backgroundColor: theme.blue + '18' }]}>
              <Ionicons name={doc.icon} size={20} color={theme.blue} />
            </View>
            <Text style={[s.docName, { color: theme.textPrimary }]}>{doc.title}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        ))}

        <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Versión</Text>
        <View style={[s.versionRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[s.versionLabel, { color: theme.textSecondary }]}>{LEGAL.APP_NAME}</Text>
          <Text style={[s.versionValue, { color: theme.textPrimary }]}>v{LEGAL.APP_VERSION}</Text>
        </View>
        <View style={[s.versionRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[s.versionLabel, { color: theme.textSecondary }]}>Última revisión normativa</Text>
          <Text style={[s.versionValue, { color: theme.textPrimary }]}>{LEGAL.LAST_LEGAL_REVIEW}</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 10 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  backTxt: { fontSize: 15, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 13, marginBottom: 8 },
  responsibleCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, borderWidth: 1 },
  responsibleLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  responsibleName: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  responsibleEmail: { fontSize: 12 },
  docCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 14, padding: 14, borderWidth: 1 },
  docIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  docName: { flex: 1, fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 4 },
  versionRow: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 12, padding: 14, borderWidth: 1 },
  versionLabel: { fontSize: 13 },
  versionValue: { fontSize: 13, fontWeight: '700' },
  // Doc view
  docHeader: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderBottomWidth: 0.5 },
  headerBack: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  headerBackTxt: { fontSize: 15, fontWeight: '600' },
  docTitle: { fontSize: 20, fontWeight: '800' },
  docBody: { padding: 20 },
  docText: { fontSize: 13, lineHeight: 22 },
});
