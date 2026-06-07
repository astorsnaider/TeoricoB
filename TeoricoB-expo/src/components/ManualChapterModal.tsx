import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { MANUAL_CHAPTERS } from '../data/manualContent';
import { ChapterView } from '../screens/ManualScreen';

interface Props {
  visible: boolean;
  chapterId: string;
  onClose: () => void;
}

export default function ManualChapterModal({ visible, chapterId, onClose }: Props) {
  const theme = useTheme();
  const chapter = MANUAL_CHAPTERS.find(c => c.id === chapterId);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
        <View style={[s.header, { borderBottomColor: theme.border, backgroundColor: theme.card }]}>
          <Text style={[s.title, { color: theme.textPrimary }]}>Manual</Text>
          <TouchableOpacity onPress={onClose} style={[s.closeBtn, { backgroundColor: theme.bg2 }]} hitSlop={10}>
            <Ionicons name="close" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        {chapter ? (
          <ChapterView chapter={chapter} theme={theme} onBack={onClose} />
        ) : (
          <View style={s.empty}>
            <Text style={{ color: theme.textSecondary }}>Capítulo no encontrado.</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5,
  },
  title: { fontSize: 17, fontWeight: '800' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
