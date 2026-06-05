/**
 * ExamRunModal — pantalla de examen formal estilo DGT.
 *
 * Diferencias clave vs el `QuizModal` clásico:
 * - NO da feedback al responder (correcto/incorrecto). Solo guarda la
 *   selección.
 * - Navegación libre adelante y atrás entre las 30 preguntas.
 * - Grid 1..30 en la parte superior para saltar a cualquier pregunta.
 *   Marca: respondida / sin responder / actual.
 * - NO botón "Ver en manual" durante el examen.
 * - Timer de 30 minutos. Al llegar a 0, finaliza automáticamente.
 * - Botón "Terminar examen" disponible en todo momento; pide confirmación
 *   si quedan preguntas sin responder.
 * - Al finalizar, muestra resultados (aprobado/suspenso, X/30) y la
 *   revisión completa con respuestas correctas + explicaciones.
 *
 * NOTA: no usamos `shuffleQuestion` aquí: en un examen oficial el orden
 * de las opciones también es fijo dentro del intento. Mantenerlo
 * idéntico al template hace que el examen 001 sea siempre exactamente
 * el mismo examen, hasta el orden de las respuestas.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Question } from '../types';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';
import { useStore } from '../store/useStore';
import { TrafficSign } from './TrafficSign';
import { TrafficScene } from './TrafficScene';
import { useSoundEffect } from '../audio/useSoundEffect';
import { getExamTemplate } from '../data/examTemplates';

interface Props {
  examId: string;
  questions: Question[];
  onClose: () => void;
}

const EXAM_TIME_SEC = 30 * 60;
const MAX_ERRORS = 3;

type AnswerMap = Record<number, number | null>; // qIndex -> optionIndex | null

export default function ExamRunModal({ examId, questions, onClose }: Props) {
  const theme = useTheme();
  const recordExamTemplateAttempt = useStore(s => s.recordExamTemplateAttempt);
  const saveExamResult = useStore(s => s.saveExamResult);
  const soundsEnabled = useStore(s => s.soundsEnabled);
  const playSound = useSoundEffect();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [confirm, setConfirm] = useState<null | {
    title: string;
    message: string;
    confirmLabel: string;
    confirmStyle?: 'normal' | 'destructive';
    onConfirm: () => void;
  }>(null);
  const timerRef = useRef<any>(null);
  const savedRef = useRef(false);
  const lastTickRef = useRef<number | null>(null);

  const template = getExamTemplate(examId);
  const examNumber = template?.number ?? 0;

  // Timer
  useEffect(() => {
    if (finished) return;
    timerRef.current = setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        if (next >= EXAM_TIME_SEC) {
          clearInterval(timerRef.current);
          finalize(true);
          return EXAM_TIME_SEC;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [finished]);

  // Tic-tac últimos 5 minutos
  useEffect(() => {
    if (finished || !soundsEnabled) return;
    const remaining = Math.max(0, EXAM_TIME_SEC - elapsed);
    if (remaining > 0 && remaining <= 5 * 60 && remaining % 30 === 0 && lastTickRef.current !== remaining) {
      lastTickRef.current = remaining;
      playSound('tick');
    }
  }, [elapsed, finished, soundsEnabled, playSound]);

  const answeredCount = Object.values(answers).filter(v => v !== null && v !== undefined).length;
  const remaining = Math.max(0, EXAM_TIME_SEC - elapsed);
  const mm = Math.floor(remaining / 60).toString().padStart(2, '0');
  const ss = (remaining % 60).toString().padStart(2, '0');

  const selectOption = (optionIndex: number) => {
    setAnswers(a => ({ ...a, [index]: a[index] === optionIndex ? null : optionIndex }));
  };

  const finalize = (auto: boolean) => {
    if (savedRef.current || finished) return;
    savedRef.current = true;
    clearInterval(timerRef.current);

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    questions.forEach((q, i) => {
      const a = answers[i];
      if (a === null || a === undefined) {
        unanswered++;
        wrong++; // en DGT, no responder cuenta como fallo
      } else if (a === q.correctIndex) {
        correct++;
      } else {
        wrong++;
      }
    });

    recordExamTemplateAttempt(examId, correct, wrong, elapsed);
    saveExamResult({
      date: new Date().toISOString(),
      totalQuestions: questions.length,
      correctCount: correct,
      wrongCount: wrong,
      timeElapsed: elapsed,
      passed: wrong <= MAX_ERRORS,
    });

    setFinished(true);
    if (soundsEnabled) playSound(wrong <= MAX_ERRORS ? 'correct' : 'wrong');
    void auto; // silenciar warning
  };

  const onTapFinish = () => {
    const missing = questions.length - answeredCount;
    if (missing > 0) {
      setConfirm({
        title: 'Terminar examen',
        message: `Te quedan ${missing} pregunta${missing === 1 ? '' : 's'} sin responder. Las preguntas en blanco cuentan como falladas. ¿Terminar igualmente?`,
        confirmLabel: 'Terminar',
        confirmStyle: 'destructive',
        onConfirm: () => { setConfirm(null); finalize(false); },
      });
    } else {
      setConfirm({
        title: 'Terminar examen',
        message: '¿Entregar el examen para ver el resultado?',
        confirmLabel: 'Entregar',
        onConfirm: () => { setConfirm(null); finalize(false); },
      });
    }
  };

  const onTapClose = () => {
    if (finished) { onClose(); return; }
    setConfirm({
      title: '¿Salir del examen?',
      message: 'Si sales ahora, el intento no quedará guardado. Tu progreso se pierde.',
      confirmLabel: 'Salir',
      confirmStyle: 'destructive',
      onConfirm: () => { setConfirm(null); onClose(); },
    });
  };

  if (finished) {
    return (
      <ExamResults
        examNumber={examNumber}
        questions={questions}
        answers={answers}
        elapsedSec={elapsed}
        onClose={onClose}
      />
    );
  }

  const q = questions[index];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      {/* Header: timer + título + cerrar */}
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onTapClose} hitSlop={12} style={s.headerBtn}>
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[s.headerTitle, { color: theme.textPrimary }]}>
            Examen {String(examNumber).padStart(3, '0')}
          </Text>
          <Text style={[s.headerSub, { color: theme.textSecondary }]}>
            {answeredCount}/{questions.length} · {mm}:{ss}
          </Text>
        </View>
        <View style={s.headerBtn} />
      </View>

      {/* Grid 1..30 SIEMPRE visible */}
      <View style={[s.gridCard, { backgroundColor: theme.bg2, borderBottomColor: theme.border }]}>
        <View style={s.gridWrap}>
          {questions.map((_, i) => {
            const isCurrent = i === index;
            const isAnswered = answers[i] !== null && answers[i] !== undefined;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setIndex(i)}
                style={[
                  s.gridCell,
                  {
                    backgroundColor: isCurrent
                      ? theme.primary
                      : isAnswered
                        ? theme.correct + '22'
                        : theme.card,
                    borderColor: isCurrent ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text style={[s.gridCellTxt, {
                  color: isCurrent ? '#fff' : isAnswered ? theme.correct : theme.textPrimary,
                }]}>
                  {i + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Pregunta + opciones */}
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <Text style={[s.qIndex, { color: theme.textTertiary }]}>
          Pregunta {index + 1} de {questions.length}
        </Text>
        <Text style={[s.qText, { color: theme.textPrimary }]}>{q.text}</Text>

        {q.signId && (
          <View style={[s.mediaBox, { backgroundColor: theme.bg2 }]}>
            <TrafficSign signId={q.signId} size={150} />
          </View>
        )}
        {q.sceneId && (
          <View style={[s.mediaBox, { backgroundColor: theme.bg2 }]}>
            <TrafficScene sceneId={q.sceneId} size={180} />
          </View>
        )}

        <View style={{ gap: 10, marginTop: 8 }}>
          {q.options.map((opt, i) => {
            const isSelected = answers[index] === i;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  s.optBtn,
                  {
                    backgroundColor: isSelected ? theme.primary + '18' : theme.card,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => selectOption(i)}
                activeOpacity={0.85}
              >
                <View style={[
                  s.optMarker,
                  {
                    borderColor: isSelected ? theme.primary : theme.border,
                    backgroundColor: isSelected ? theme.primary : 'transparent',
                  },
                ]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text style={[s.optTxt, { color: theme.textPrimary }]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 12 }} />
      </ScrollView>

      {/* Footer con navegación + finalizar */}
      <View style={[s.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => setIndex(i => Math.max(0, i - 1))}
          disabled={index === 0}
          style={[s.navBtn, { opacity: index === 0 ? 0.35 : 1 }]}
        >
          <Ionicons name="chevron-back" size={20} color={theme.textPrimary} />
          <Text style={[s.navBtnTxt, { color: theme.textPrimary }]}>Anterior</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onTapFinish}
          style={[s.finishBtn, { backgroundColor: theme.primary }, SHADOWS.small]}
        >
          <Ionicons name="flag" size={16} color="#fff" />
          <Text style={s.finishBtnTxt}>Terminar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIndex(i => Math.min(questions.length - 1, i + 1))}
          disabled={index === questions.length - 1}
          style={[s.navBtn, { opacity: index === questions.length - 1 ? 0.35 : 1 }]}
        >
          <Text style={[s.navBtnTxt, { color: theme.textPrimary }]}>Siguiente</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <ConfirmDialog
        visible={confirm !== null}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.confirmLabel ?? 'Aceptar'}
        confirmStyle={confirm?.confirmStyle}
        onCancel={() => setConfirm(null)}
        onConfirm={() => confirm?.onConfirm()}
      />
    </SafeAreaView>
  );
}

// ── ConfirmDialog: alternativa a Alert.alert que funciona en web ─────
function ConfirmDialog({
  visible, title, message, confirmLabel, confirmStyle = 'normal', onConfirm, onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmStyle?: 'normal' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.confirmBackdrop}>
        <View style={[s.confirmCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[s.confirmTitle, { color: theme.textPrimary }]}>{title}</Text>
          <Text style={[s.confirmMsg, { color: theme.textSecondary }]}>{message}</Text>
          <View style={s.confirmRow}>
            <TouchableOpacity onPress={onCancel} style={[s.confirmBtn, { backgroundColor: theme.bg2 }]}>
              <Text style={[s.confirmBtnTxt, { color: theme.textPrimary }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={[s.confirmBtn, { backgroundColor: confirmStyle === 'destructive' ? theme.wrong : theme.primary }]}
            >
              <Text style={[s.confirmBtnTxt, { color: '#fff' }]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Pantalla de resultados final ─────────────────────────────────────
function ExamResults({
  examNumber, questions, answers, elapsedSec, onClose,
}: {
  examNumber: number;
  questions: Question[];
  answers: AnswerMap;
  elapsedSec: number;
  onClose: () => void;
}) {
  const theme = useTheme();
  const [showReview, setShowReview] = useState(false);

  let correct = 0;
  let wrong = 0;
  let blank = 0;
  questions.forEach((q, i) => {
    const a = answers[i];
    if (a === null || a === undefined) { blank++; wrong++; }
    else if (a === q.correctIndex) correct++;
    else wrong++;
  });
  const passed = wrong <= MAX_ERRORS;

  const mm = Math.floor(elapsedSec / 60).toString().padStart(2, '0');
  const ss = (elapsedSec % 60).toString().padStart(2, '0');

  if (showReview) {
    return (
      <ExamReview
        examNumber={examNumber}
        questions={questions}
        answers={answers}
        onClose={() => setShowReview(false)}
      />
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <View style={s.headerBtn} />
        <Text style={[s.headerTitle, { color: theme.textPrimary }]}>
          Resultado · Examen {String(examNumber).padStart(3, '0')}
        </Text>
        <TouchableOpacity onPress={onClose} hitSlop={12} style={s.headerBtn}>
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <View style={[
          s.resultHero,
          { backgroundColor: passed ? theme.correct + '15' : theme.wrong + '15', borderColor: passed ? theme.correct : theme.wrong },
        ]}>
          <Ionicons
            name={passed ? 'trophy' : 'close-circle'}
            size={56}
            color={passed ? theme.correct : theme.wrong}
          />
          <Text style={[s.resultTitle, { color: passed ? theme.correct : theme.wrong }]}>
            {passed ? '¡Examen aprobado!' : 'Examen suspenso'}
          </Text>
          <Text style={[s.resultSub, { color: theme.textSecondary }]}>
            {passed
              ? 'Te mantienes por debajo de los 3 fallos. En el examen real, ese resultado es un APTO.'
              : `Has fallado ${wrong} preguntas. El máximo permitido en el examen real son 3.`}
          </Text>
        </View>

        <View style={[s.statsGrid, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <StatCell label="Aciertos" value={`${correct}`} color={theme.correct} />
          <View style={[s.statsSep, { backgroundColor: theme.border }]} />
          <StatCell label="Fallos" value={`${wrong}`} color={wrong <= MAX_ERRORS ? theme.textPrimary : theme.wrong} />
          <View style={[s.statsSep, { backgroundColor: theme.border }]} />
          <StatCell label="En blanco" value={`${blank}`} color={theme.textSecondary} />
          <View style={[s.statsSep, { backgroundColor: theme.border }]} />
          <StatCell label="Tiempo" value={`${mm}:${ss}`} color={theme.textPrimary} />
        </View>

        <TouchableOpacity
          style={[s.primaryBtn, { backgroundColor: theme.primary }, SHADOWS.medium]}
          onPress={() => setShowReview(true)}
        >
          <Ionicons name="reader" size={18} color="#fff" />
          <Text style={s.primaryBtnTxt}>Revisar respuestas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.secondaryBtn, { borderColor: theme.border }]}
          onPress={onClose}
        >
          <Text style={[s.secondaryBtnTxt, { color: theme.textPrimary }]}>Volver al listado</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCell({ label, value, color }: { label: string; value: string; color: string }) {
  const theme = useTheme();
  return (
    <View style={s.statCell}>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={[s.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

// ── Pantalla de revisión de respuestas ───────────────────────────────
function ExamReview({
  examNumber, questions, answers, onClose,
}: {
  examNumber: number;
  questions: Question[];
  answers: AnswerMap;
  onClose: () => void;
}) {
  const theme = useTheme();
  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onClose} hitSlop={12} style={s.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.textPrimary }]}>
          Revisión · Examen {String(examNumber).padStart(3, '0')}
        </Text>
        <View style={s.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        {questions.map((q, i) => {
          const selected = answers[i];
          const isBlank = selected === null || selected === undefined;
          const isCorrect = !isBlank && selected === q.correctIndex;
          return (
            <View
              key={q.id}
              style={[
                s.reviewCard,
                { backgroundColor: theme.card, borderColor: isCorrect ? theme.correct : isBlank ? theme.border : theme.wrong },
              ]}
            >
              <View style={s.reviewHeader}>
                <Text style={[s.reviewIndex, { color: theme.textTertiary }]}>
                  {i + 1}
                </Text>
                {isBlank ? (
                  <View style={[s.reviewBadge, { backgroundColor: theme.bg2 }]}>
                    <Text style={[s.reviewBadgeTxt, { color: theme.textSecondary }]}>En blanco</Text>
                  </View>
                ) : isCorrect ? (
                  <View style={[s.reviewBadge, { backgroundColor: theme.correct + '22' }]}>
                    <Ionicons name="checkmark" size={11} color={theme.correct} />
                    <Text style={[s.reviewBadgeTxt, { color: theme.correct }]}>Correcto</Text>
                  </View>
                ) : (
                  <View style={[s.reviewBadge, { backgroundColor: theme.wrong + '22' }]}>
                    <Ionicons name="close" size={11} color={theme.wrong} />
                    <Text style={[s.reviewBadgeTxt, { color: theme.wrong }]}>Incorrecto</Text>
                  </View>
                )}
              </View>
              <Text style={[s.reviewQ, { color: theme.textPrimary }]}>{q.text}</Text>

              {q.options.map((opt, oi) => {
                const isUserChoice = selected === oi;
                const isRight = oi === q.correctIndex;
                const bg = isRight
                  ? theme.correct + '15'
                  : isUserChoice
                    ? theme.wrong + '15'
                    : 'transparent';
                const bd = isRight
                  ? theme.correct
                  : isUserChoice
                    ? theme.wrong
                    : theme.border;
                return (
                  <View
                    key={oi}
                    style={[s.reviewOpt, { backgroundColor: bg, borderColor: bd }]}
                  >
                    <Text style={[s.reviewOptTxt, { color: theme.textPrimary }]}>
                      {opt}
                    </Text>
                    {isRight && (
                      <Ionicons name="checkmark-circle" size={16} color={theme.correct} />
                    )}
                  </View>
                );
              })}

              {q.explanation && (
                <View style={[s.explainBox, { backgroundColor: theme.bg2 }]}>
                  <Ionicons name="information-circle" size={14} color={theme.textSecondary} />
                  <Text style={[s.explainTxt, { color: theme.textSecondary }]}>
                    {q.explanation}
                  </Text>
                </View>
              )}
              {q.legalRef && (
                <Text style={[s.legalRef, { color: theme.textTertiary }]}>{q.legalRef}</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 0.5,
  },
  headerBtn: { width: 32, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  headerSub: { fontSize: 11, fontWeight: '600', marginTop: 2, fontFamily: 'Menlo' },
  gridCard: { paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 0.5 },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  gridCell: {
    width: 28, height: 26, borderRadius: 6, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  gridCellTxt: { fontSize: 11, fontWeight: '700' },
  body: { padding: 18, gap: 12 },
  qIndex: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  qText: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  mediaBox: { borderRadius: 12, alignItems: 'center', padding: 12 },
  optBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 12, borderWidth: 1.5, padding: 14,
  },
  optMarker: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  optTxt: { fontSize: 15, flex: 1, lineHeight: 21 },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 8, paddingBottom: 22,
    borderTopWidth: 0.5,
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 8 },
  navBtnTxt: { fontSize: 14, fontWeight: '600' },
  finishBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10,
  },
  finishBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  resultHero: { borderRadius: 16, borderWidth: 1, padding: 22, alignItems: 'center', gap: 10 },
  resultTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  resultSub: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  statsGrid: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingVertical: 14 },
  statCell: { flex: 1, alignItems: 'center' },
  statsSep: { width: 1, height: 32 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 12,
  },
  primaryBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, alignItems: 'center',
  },
  secondaryBtnTxt: { fontSize: 14, fontWeight: '600' },
  reviewCard: { borderRadius: 12, borderWidth: 1.5, padding: 14, gap: 10 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewIndex: { fontSize: 11, fontWeight: '700', fontFamily: 'Menlo' },
  reviewBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  reviewBadgeTxt: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  reviewQ: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  reviewOpt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 10, borderWidth: 1, padding: 10, gap: 8 },
  reviewOptTxt: { fontSize: 13, flex: 1, lineHeight: 18 },
  explainBox: { flexDirection: 'row', gap: 6, padding: 10, borderRadius: 8, alignItems: 'flex-start' },
  explainTxt: { fontSize: 12, flex: 1, lineHeight: 17 },
  legalRef: { fontSize: 11, fontWeight: '600', textAlign: 'right' },
  confirmBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 30 },
  confirmCard: { width: '100%', maxWidth: 380, borderRadius: 16, borderWidth: 1, padding: 22, gap: 12 },
  confirmTitle: { fontSize: 17, fontWeight: '800', textAlign: 'center' },
  confirmMsg: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  confirmRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  confirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  confirmBtnTxt: { fontSize: 14, fontWeight: '700' },
});
