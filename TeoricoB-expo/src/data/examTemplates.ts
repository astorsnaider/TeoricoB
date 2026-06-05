/**
 * examTemplates — 90 exámenes simulados deterministas estilo DGT.
 *
 * Cada examen (numerado 1..90) contiene SIEMPRE las mismas 30 preguntas,
 * derivadas del banco actual (`ALL_TOPICS`) mediante un algoritmo
 * determinista con seed = nº de examen.
 *
 * Cobertura temática equilibrada: el examen DGT real toca todos los
 * grandes bloques (señales, velocidades, preferencia, alcohol,
 * distancias, primeros auxilios, vehículo, conducción eficiente,
 * infracciones, vías). Aquí seleccionamos ~3 preguntas por tema en cada
 * examen, y luego barajamos el orden final.
 *
 * El listado es estable entre arranques (no aleatorio por sesión) — es
 * el contrato que hace que el examen 001 sea siempre "el mismo examen
 * 001", como en TodoTest.
 *
 * Si en el futuro se reescribe el banco de preguntas (ej. revisión
 * profesional de la #2 del POLISH), la composición de cada examen
 * cambiará (porque depende del orden de las preguntas en el banco).
 * Esto se considera aceptable: si vamos a mejorar las preguntas, los
 * exámenes también deben reflejarlo.
 */
import { Question } from '../types';
import { ALL_TOPICS } from './questions';

export interface ExamTemplate {
  id: string;           // "exam_001", "exam_023"…
  number: number;       // 1..90
  questionIds: string[];// 30 IDs estables
}

export const EXAM_COUNT = 90;
export const QUESTIONS_PER_EXAM = 30;

// ── PRNG determinista (mulberry32) ─────────────────────────────────────
// Misma seed → misma secuencia. Bastante uniforme para mezclas.
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: readonly T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ── Generador ─────────────────────────────────────────────────────────
function generateExamTemplate(number: number): ExamTemplate {
  // Seed primaria para selección
  const baseSeed = number * 1_000_003; // primo grande para mejor distribución

  const allQuestions: Question[] = ALL_TOPICS.flatMap(t =>
    t.lessons.flatMap(l => l.questions),
  );

  // Reparto inicial: ceil(30 / nº temas) por tema (3 cuando hay 10 temas)
  const targetPerTopic = Math.ceil(QUESTIONS_PER_EXAM / ALL_TOPICS.length);

  const picks: Question[] = [];
  for (let t = 0; t < ALL_TOPICS.length; t++) {
    const topic = ALL_TOPICS[t];
    const topicQs = topic.lessons.flatMap(l => l.questions);
    if (topicQs.length === 0) continue;
    const shuffled = seededShuffle(topicQs, baseSeed + t * 17);
    picks.push(...shuffled.slice(0, targetPerTopic));
  }

  // Si por exceso/déficit no llegamos exactamente a QUESTIONS_PER_EXAM,
  // rellenamos del banco general (sin duplicar) o recortamos.
  const used = new Set(picks.map(q => q.id));
  if (picks.length < QUESTIONS_PER_EXAM) {
    const pool = seededShuffle(
      allQuestions.filter(q => !used.has(q.id)),
      baseSeed + 999,
    );
    let i = 0;
    while (picks.length < QUESTIONS_PER_EXAM && i < pool.length) {
      picks.push(pool[i++]);
    }
  }

  // Mezcla final del orden de las 30
  const finalOrder = seededShuffle(picks, baseSeed + 7);
  const trimmed = finalOrder.slice(0, QUESTIONS_PER_EXAM);

  return {
    id: `exam_${String(number).padStart(3, '0')}`,
    number,
    questionIds: trimmed.map(q => q.id),
  };
}

// ── Catálogo precomputado al cargar el módulo ─────────────────────────
export const EXAM_TEMPLATES: ExamTemplate[] = Array.from({ length: EXAM_COUNT }, (_, i) =>
  generateExamTemplate(i + 1),
);

// ── Helpers de consulta ───────────────────────────────────────────────
const QUESTIONS_BY_ID: Map<string, Question> = (() => {
  const map = new Map<string, Question>();
  ALL_TOPICS.forEach(t => t.lessons.forEach(l => l.questions.forEach(q => map.set(q.id, q))));
  return map;
})();

export function getQuestionsForExam(examId: string): Question[] {
  const tmpl = EXAM_TEMPLATES.find(e => e.id === examId);
  if (!tmpl) return [];
  return tmpl.questionIds.map(id => QUESTIONS_BY_ID.get(id)).filter(Boolean) as Question[];
}

export function getExamTemplate(examId: string): ExamTemplate | undefined {
  return EXAM_TEMPLATES.find(e => e.id === examId);
}
