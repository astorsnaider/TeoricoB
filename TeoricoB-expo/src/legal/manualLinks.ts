/**
 * Mapeo de categoría de pregunta → capítulo del manual.
 *
 * Se usa cuando el usuario pulsa "Ver en el Manual" tras responder
 * una pregunta del quiz. Le lleva al capítulo del temario donde está
 * desarrollado el contenido y, dentro del manual, hay enlaces al BOE.
 */

const CATEGORY_TO_CHAPTER: Record<string, string> = {
  'señales':       'senales_t',        // Tema 8: Señales de circulación
  'velocidades':   'velocidad',        // Tema 10: Velocidad y distancias
  'preferencia':   'preferencia',      // Tema 12: Normas de preferencia
  'alcohol':       'estado_conductor', // Tema 3: El estado del conductor
  'distancias':    'maniobras',        // Tema 11: Maniobras (adelantamiento)
  'auxilios':      'accidentes',       // Tema 16: Accidentes de tráfico
  'vehiculo':      'mecanica',         // Tema 15: Mecánica y mantenimiento
  'medioambiente': 'eficiente',        // Tema 17: Conducción eficiente
  'infracciones':  'anexo_puntos',     // Anexo: Permiso por puntos
  'vias':          'la_via',           // Tema 9: La vía
};

const CHAPTER_LABELS: Record<string, string> = {
  'senales_t':        'Tema 8 · Señales',
  'velocidad':        'Tema 10 · Velocidad',
  'preferencia':      'Tema 12 · Preferencia',
  'estado_conductor': 'Tema 3 · Estado del conductor',
  'maniobras':        'Tema 11 · Maniobras',
  'accidentes':       'Tema 16 · Accidentes',
  'mecanica':         'Tema 15 · Mecánica',
  'eficiente':        'Tema 17 · Eficiente',
  'anexo_puntos':     'Anexo · Permiso por puntos',
  'la_via':           'Tema 9 · La vía',
};

export function getChapterIdForCategory(category?: string): string | undefined {
  if (!category) return undefined;
  return CATEGORY_TO_CHAPTER[category];
}

export function getChapterLabel(chapterId?: string): string {
  if (!chapterId) return 'Ver en el Manual';
  return CHAPTER_LABELS[chapterId] ?? 'Ver en el Manual';
}
