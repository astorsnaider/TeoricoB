import { Question } from '../types';

/**
 * Devuelve una copia de la pregunta con las opciones reordenadas
 * aleatoriamente, manteniendo cuál es la correcta.
 *
 * Fisher-Yates shuffle. NO muta el objeto original.
 *
 * Útil para evitar que el usuario memorice "la respuesta es la C" en
 * preguntas que repite.
 */
export function shuffleQuestion(q: Question): Question {
  const idx = q.options.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return {
    ...q,
    options: idx.map(i => q.options[i]),
    correctIndex: idx.indexOf(q.correctIndex),
  };
}
