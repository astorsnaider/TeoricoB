/**
 * Configuración legal centralizada de TeoricoB.
 *
 * Cambia cualquier valor aquí y se actualiza automáticamente
 * en todos los documentos legales, disclaimers y pantallas.
 */

export const LEGAL = {
  // ─── Identidad de la app ────────────────────────────────────────
  APP_NAME:        'TeoricoB',
  APP_VERSION:     '0.5.0',
  APP_DESCRIPTION: 'App de estudio para el permiso de conducción B',

  // ─── Responsable legal (Art. 10 LSSI) ───────────────────────────
  // Estos datos aparecen en Aviso Legal / Términos / Privacidad,
  // únicamente en la sección de Ajustes > Información Legal.
  // Nunca se muestran en la UI principal de la app.
  RESPONSIBLE_NAME: 'Astor Snaider',
  RESPONSIBLE_TYPE: 'Persona física',
  CONTACT_EMAIL:    'contacto@teoricob.app',   // ⚠️ PLACEHOLDER — actualizar cuando esté el email definitivo
  JURISDICTION:     'España',
  COUNTRY_CODE:     'ES',

  // ─── Recursos oficiales (verificados 2026) ──────────────────────
  OFFICIAL_URLS: {
    DGT_HOME:          'https://www.dgt.es',
    DGT_RULES:         'https://www.dgt.es/muevete-con-seguridad/conoce-las-normas-de-trafico/',
    DGT_SANCTIONS:     'https://www.dgt.es/nuestros-servicios/multas-y-sanciones/conoce-los-tipos-de-infracciones-y-sanciones/',
    DGT_ENV_LABEL:     'https://www.dgt.es/nuestros-servicios/tu-vehiculo/tus-vehiculos/distintivo-ambiental/',
    BOE_RGC:           'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23514',
    BOE_LSV:           'https://www.boe.es/buscar/act.php?id=BOE-A-2015-8197',
    DGT_MANUAL_LF:     'https://www.dgt.es/export/sites/web-DGT/.galleries/downloads/nuestros_servicios/permisos-de-conducir/Accesibilidad/TeoricaAbreviada_LecturaFacil_2023-12_Interactivo.pdf',
    DGT_DICTIONARY_LF: 'https://sede.dgt.gob.es/export/sites/dgt/.galleries/permisos-de-conducir/autoescuelas/Diccionario-en-Lectura-Facil.-Permiso-B.pdf',
  },

  // ─── Fechas de referencia legal ─────────────────────────────────
  LAST_LEGAL_REVIEW: '2026-05',  // Última revisión de la normativa aplicada
  EFFECTIVE_DATE:    '2026-05-22', // Fecha de entrada en vigor de estos documentos
};
