/**
 * ExamListScreen — listado de los 90 exámenes simulados estilo TodoTest.
 *
 * Cada examen es una lista fija de 30 preguntas, persistente entre
 * arranques (generada determinísticamente en `data/examTemplates.ts`).
 * El usuario ve para cada examen: número, estado del último intento
 * (no realizado / aprobado / suspenso), nº de intentos, fallos, mejor
 * resultado.
 *
 * Tap sobre un examen → abre `ExamRunModal` con esas 30 preguntas.
 *
 * Acceso: se invoca como modal desde HomeScreen sustituyendo al antiguo
 * "Examen Simulado" que arrancaba un examen aleatorio.
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';
import { useStore } from '../store/useStore';
import { EXAM_TEMPLATES, getQuestionsForExam } from '../data/examTemplates';
import ExamRunModal from '../components/ExamRunModal';

interface Props {
  onClose: () => void;
}

export default function ExamListScreen({ onClose }: Props) {
  const theme = useTheme();
  const examTemplateStats = useStore(s => s.user.examTemplateStats ?? {});
  const [runningExamId, setRunningExamId] = useState<string | null>(null);

  const summary = useMemo(() => {
    const all = Object.values(examTemplateStats);
    const totalAttempts = all.reduce((sum, s) => sum + s.attempts, 0);
    const passed = all.filter(s => s.bestPassed).length;
    return { totalAttempts, passed };
  }, [examTemplateStats]);

  const onStartExam = (examId: string) => {
    setRunningExamId(examId);
  };

  const runningQuestions = runningExamId ? getQuestionsForExam(runningExamId) : [];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onClose} hitSlop={12} style={s.headerBtn}>
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.textPrimary }]}>Exámenes DGT</Text>
        <View style={s.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Hero / Intro */}
        <View style={[s.hero, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={s.heroRow}>
            <View style={[s.heroIcon, { backgroundColor: theme.primary + '18' }]}>
              <Ionicons name="document-text" size={26} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.heroTitle, { color: theme.textPrimary }]}>
                90 exámenes simulados
              </Text>
              <Text style={[s.heroSub, { color: theme.textSecondary }]}>
                30 preguntas · 30 minutos · máximo 3 fallos para aprobar
              </Text>
            </View>
          </View>
          <Text style={[s.heroNote, { color: theme.textTertiary }]}>
            Mismo formato que el examen oficial: puedes moverte adelante y atrás
            por las preguntas. El resultado se ve al terminar.
          </Text>

          {summary.totalAttempts > 0 && (
            <View style={[s.summaryRow, { borderTopColor: theme.border }]}>
              <View style={s.summaryItem}>
                <Text style={[s.summaryNum, { color: theme.textPrimary }]}>{summary.passed}</Text>
                <Text style={[s.summaryLabel, { color: theme.textSecondary }]}>aprobados</Text>
              </View>
              <View style={[s.summarySep, { backgroundColor: theme.border }]} />
              <View style={s.summaryItem}>
                <Text style={[s.summaryNum, { color: theme.textPrimary }]}>{summary.totalAttempts}</Text>
                <Text style={[s.summaryLabel, { color: theme.textSecondary }]}>intentos</Text>
              </View>
              <View style={[s.summarySep, { backgroundColor: theme.border }]} />
              <View style={s.summaryItem}>
                <Text style={[s.summaryNum, { color: theme.textPrimary }]}>{EXAM_TEMPLATES.length - summary.passed}</Text>
                <Text style={[s.summaryLabel, { color: theme.textSecondary }]}>por aprobar</Text>
              </View>
            </View>
          )}
        </View>

        {/* Lista 90 */}
        <View style={s.listHeader}>
          <Text style={[s.colHeader, { color: theme.textTertiary, flex: 0, width: 70 }]}>Examen</Text>
          <Text style={[s.colHeader, { color: theme.textTertiary, flex: 1, textAlign: 'center' }]}>Fallos</Text>
          <Text style={[s.colHeader, { color: theme.textTertiary, flex: 1, textAlign: 'center' }]}>Intentos</Text>
          <Text style={[s.colHeader, { color: theme.textTertiary, flex: 0, width: 28 }]}> </Text>
        </View>

        <View style={[s.listCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {EXAM_TEMPLATES.map((tmpl, i) => {
            const stats = examTemplateStats[tmpl.id];
            const passed = stats?.bestPassed;
            const lastWrong = stats?.lastWrong;
            return (
              <TouchableOpacity
                key={tmpl.id}
                onPress={() => onStartExam(tmpl.id)}
                style={[
                  s.row,
                  { borderBottomColor: theme.border },
                  i < EXAM_TEMPLATES.length - 1 && s.rowDivider,
                ]}
                activeOpacity={0.7}
              >
                <View style={[s.examNumBox, { backgroundColor: passed ? theme.correct + '22' : theme.bg2 }]}>
                  <Text style={[s.examNum, { color: passed ? theme.correct : theme.textSecondary }]}>
                    {String(tmpl.number).padStart(3, '0')}
                  </Text>
                </View>

                <View style={{ flex: 1, alignItems: 'center' }}>
                  {stats ? (
                    <View style={s.cellRow}>
                      <Text style={[s.cellNum, { color: stats.lastWrong <= 3 ? theme.textPrimary : theme.wrong }]}>
                        {lastWrong}/30
                      </Text>
                      {passed && (
                        <Ionicons name="checkmark-circle" size={14} color={theme.correct} style={{ marginLeft: 4 }} />
                      )}
                    </View>
                  ) : (
                    <Text style={[s.cellEmpty, { color: theme.textTertiary }]}>—</Text>
                  )}
                </View>

                <View style={{ flex: 1, alignItems: 'center' }}>
                  {stats ? (
                    <Text style={[s.cellNum, { color: theme.textSecondary }]}>{stats.attempts}</Text>
                  ) : (
                    <Text style={[s.cellEmpty, { color: theme.textTertiary }]}>—</Text>
                  )}
                </View>

                <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[s.footerNote, { color: theme.textTertiary }]}>
          Los 90 exámenes están siempre disponibles. Cada examen contiene siempre
          las mismas 30 preguntas — repítelo hasta dominarlo.
        </Text>

        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal
        visible={runningExamId !== null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setRunningExamId(null)}
      >
        {runningExamId && (
          <ExamRunModal
            examId={runningExamId}
            questions={runningQuestions}
            onClose={() => setRunningExamId(null)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 0.5,
  },
  headerBtn: { width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  content: { padding: 16, gap: 14 },
  hero: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 17, fontWeight: '800' },
  heroSub: { fontSize: 12, marginTop: 2 },
  heroNote: { fontSize: 12, lineHeight: 17 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingTop: 10, borderTopWidth: 0.5 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: 20, fontWeight: '800' },
  summaryLabel: { fontSize: 10, marginTop: 1, textTransform: 'uppercase', letterSpacing: 0.3 },
  summarySep: { width: 1, height: 30 },
  listHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 2 },
  colHeader: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  listCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  rowDivider: { borderBottomWidth: 0.5 },
  examNumBox: { width: 56, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  examNum: { fontSize: 14, fontWeight: '800', fontFamily: 'Menlo', letterSpacing: 0.5 },
  cellRow: { flexDirection: 'row', alignItems: 'center' },
  cellNum: { fontSize: 13, fontWeight: '700' },
  cellEmpty: { fontSize: 13 },
  footerNote: { fontSize: 11, textAlign: 'center', lineHeight: 16, paddingHorizontal: 12, marginTop: 4 },
});
