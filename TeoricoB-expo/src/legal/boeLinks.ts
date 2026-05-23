/**
 * Mapeo de referencias legales → URLs del BOE.
 *
 * Permite al usuario verificar cualquier respuesta del quiz
 * accediendo directamente al artículo legal correspondiente.
 *
 * Todas las URLs son del Boletín Oficial del Estado (dominio público
 * conforme al Art. 13 de la Ley de Propiedad Intelectual).
 */

import { LEGAL } from './config';

const BOE_URLS = {
  RGC:      LEGAL.OFFICIAL_URLS.BOE_RGC,                              // Reglamento General de Circulación
  LSV:      LEGAL.OFFICIAL_URLS.BOE_LSV,                              // Ley sobre Tráfico, Circulación y Seguridad Vial
  RGCOND:   'https://www.boe.es/buscar/act.php?id=BOE-A-2009-9481',  // Reglamento General de Conductores
  ITV:      'https://www.boe.es/buscar/act.php?id=BOE-A-2017-10732', // Real Decreto 920/2017 (ITV)
  PUNTOS:   'https://www.boe.es/buscar/act.php?id=BOE-A-2005-12384', // Ley 17/2005 (Permiso por puntos)
  ALCOHOL:  'https://www.boe.es/buscar/act.php?id=BOE-A-2009-12361', // RD 1217/2009 (alcohol y drogas)
};

/**
 * Determina la URL del BOE más adecuada para una referencia legal.
 *
 * Ejemplos:
 *   "Art. 54 RGC"  → URL del RGC
 *   "Art. 14 LSV"  → URL de la LSV
 *   "Ley 17/2005"  → URL del permiso por puntos
 */
export function getBoeUrl(legalRef?: string): string {
  if (!legalRef) return BOE_URLS.RGC;
  const ref = legalRef.toLowerCase();

  if (ref.includes('lsv') || ref.includes('ley sobre tráfico')) return BOE_URLS.LSV;
  if (ref.includes('rd 818') || ref.includes('reglamento general de conductores')) return BOE_URLS.RGCOND;
  if (ref.includes('rd 920') || ref.includes('itv')) return BOE_URLS.ITV;
  if (ref.includes('ley 17/2005') || ref.includes('permiso por puntos')) return BOE_URLS.PUNTOS;
  if (ref.includes('rd 1217') || ref.includes('alcohol') && ref.includes('rd')) return BOE_URLS.ALCOHOL;

  // Por defecto: Reglamento General de Circulación (cubre la mayoría de preguntas)
  return BOE_URLS.RGC;
}

/**
 * Etiqueta humana para mostrar al usuario qué fuente abre.
 */
export function getBoeLabel(legalRef?: string): string {
  if (!legalRef) return 'BOE — Normativa';
  const ref = legalRef.toLowerCase();
  if (ref.includes('lsv')) return 'BOE — Ley de Tráfico';
  if (ref.includes('rd 818') || ref.includes('reglamento general de conductores')) return 'BOE — Reglamento de Conductores';
  if (ref.includes('rd 920') || ref.includes('itv')) return 'BOE — Reglamento de ITV';
  if (ref.includes('ley 17/2005') || ref.includes('permiso por puntos')) return 'BOE — Ley del Permiso por Puntos';
  if (ref.includes('rd 1217')) return 'BOE — Reglamento sobre Alcohol y Drogas';
  return 'BOE — Reglamento General de Circulación';
}

/**
 * Devuelve la referencia legal más probable basándose en la categoría de la pregunta.
 * Se usa como fallback cuando una pregunta no tiene legalRef explícito.
 *
 * Mapeo basado en los artículos principales del RGC y LSV que regulan cada materia.
 */
const CATEGORY_TO_REF: Record<string, string> = {
  'señales':       'Arts. 132–168 RGC · Anexo I RGC',
  'velocidades':   'Art. 48 LSV · Arts. 45–54 RGC',
  'preferencia':   'Arts. 56–72 RGC',
  'alcohol':       'Art. 14 LSV · Arts. 17–22 RGC',
  'distancias':    'Arts. 54, 82–90 RGC',
  'auxilios':      'Art. 129 LSV · Protocolo PAS',
  'vehiculo':      'RD 818/2009 · RD 920/2017 (ITV)',
  'medioambiente': 'Resolución DGT 20/01/2016',
  'infracciones':  'Ley 17/2005 · Anexo II LSV',
  'vias':          'Anexo I LSV · Arts. 119–122 RGC',
};

export function getEffectiveLegalRef(legalRef?: string, category?: string): string | undefined {
  if (legalRef) return legalRef;
  if (category && CATEGORY_TO_REF[category]) return CATEGORY_TO_REF[category];
  return undefined;
}
