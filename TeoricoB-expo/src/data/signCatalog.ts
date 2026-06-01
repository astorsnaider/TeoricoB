/**
 * Catálogo de señales de tráfico españolas oficiales.
 *
 * Fuente: Catálogo Oficial DGT (TeoricaAbreviada Lectura Fácil — Tema 8)
 *         y Anexo I del Reglamento General de Circulación (RD 1428/2003).
 *
 * IMPORTANTE: solo se incluyen señales cuya imagen SVG está verificada
 * proveniente de Wikimedia Commons como fiel reproducción del catálogo
 * oficial. Las señales sin SVG oficial disponible no se listan aquí
 * para no inducir a error pedagógico.
 *
 * Para añadir nuevas señales:
 *   1. Descargar el SVG oficial a assets/signs-wikimedia/<codigo>.svg
 *   2. Añadir entrada a FINAL_SIGNS en scripts/regenerate-signs.js
 *   3. Ejecutar: node scripts/regenerate-signs.js
 *   4. Añadir entrada en este archivo con el signId correspondiente.
 */

export type SignType = 'peligro' | 'prohibicion' | 'obligacion' | 'indicacion';

export interface CatalogSign {
  code: string;        // Código oficial DGT (P-3, R-301, S-1a, etc.)
  name: string;        // Nombre oficial según catálogo DGT
  signId: string;      // ID para el componente TrafficSign
  description: string; // Qué significa
  action: string;      // Qué debe hacer el conductor
  legalRef?: string;   // Referencia legal (Art. RGC)
  type: SignType;
}

export const SIGNS_PELIGRO: CatalogSign[] = [
  {
    code: 'P-2', name: 'Cruce con prioridad a la derecha', signId: 'cruce_prioridad_derecha', type: 'peligro',
    description: 'Advierte de la proximidad de una intersección sin señalizar donde tienen preferencia los vehículos que vengan por la derecha (regla general).',
    action: 'Reduce velocidad y prepárate para ceder el paso a cualquier vehículo que pueda venir por la derecha.',
    legalRef: 'Señal P-2 · Art. 132 RGC',
  },
  {
    code: 'P-3', name: 'Semáforos próximos', signId: 'semaforos', type: 'peligro',
    description: 'Advierte de la proximidad de un cruce regulado por semáforos. Puede haber vehículos detenidos en la cola del semáforo.',
    action: 'Reduce velocidad y atento a la cola. Anticipa el frenado.',
    legalRef: 'Señal P-3 · Art. 132 RGC',
  },
  {
    code: 'P-6', name: 'Cruce de tranvía', signId: 'cruce_tranvia', type: 'peligro',
    description: 'Advierte de la proximidad de un cruce con una línea de tranvía. El tranvía tiene preferencia de paso.',
    action: 'Reduce velocidad. Cede el paso al tranvía.',
    legalRef: 'Señal P-6 · Art. 132 RGC',
  },
  {
    code: 'P-7', name: 'Paso a nivel con barreras cercano', signId: 'paso_nivel_con_barreras', type: 'peligro',
    description: 'Advierte de un paso a nivel próximo dotado de barreras o semibarreras que se cierran cuando se aproxima un tren.',
    action: 'Reduce velocidad. Si las barreras están bajando o bajadas, detente y espera.',
    legalRef: 'Señal P-7 · Art. 132 RGC',
  },
  {
    code: 'P-9a', name: 'Paso a nivel a 300 m', signId: 'paso_nivel_proximo_300', type: 'peligro',
    description: 'Panel con tres franjas inclinadas: indica que hay un paso a nivel, puente móvil o muelle aproximadamente a 300 m.',
    action: 'Empieza a reducir velocidad y atento a la señalización siguiente.',
    legalRef: 'Señal P-9a · Art. 132 RGC',
  },
  {
    code: 'P-9b', name: 'Paso a nivel a 200 m', signId: 'paso_nivel_proximo_200', type: 'peligro',
    description: 'Panel con dos franjas inclinadas: paso a nivel aproximadamente a 200 m.',
    action: 'Continúa reduciendo velocidad. Atento.',
    legalRef: 'Señal P-9b · Art. 132 RGC',
  },
  {
    code: 'P-13a', name: 'Curva peligrosa hacia la derecha', signId: 'curva_peligrosa_derecha', type: 'peligro',
    description: 'Curva próxima hacia la derecha con radio inferior al mínimo para la velocidad señalizada.',
    action: 'Reduce velocidad ANTES de entrar en la curva. No frenes dentro. Mantén tu carril.',
    legalRef: 'Señal P-13a · Art. 132 RGC',
  },
  {
    code: 'P-13b', name: 'Curva peligrosa hacia la izquierda', signId: 'curva_peligrosa_izquierda', type: 'peligro',
    description: 'Curva próxima hacia la izquierda. Cuidado: el tráfico contrario puede invadir tu carril si abusa de la cuerda.',
    action: 'Reduce velocidad antes de entrar. Atento al tráfico contrario que pueda invadir.',
    legalRef: 'Señal P-13b · Art. 132 RGC',
  },
  {
    code: 'P-14a', name: 'Varias curvas (primera a la derecha)', signId: 'varias_curvas', type: 'peligro',
    description: 'Tramo con dos o más curvas peligrosas próximas, la primera hacia la derecha.',
    action: 'Reduce velocidad. No adelantes en este tramo. Mantente en tu carril.',
    legalRef: 'Señal P-14a · Art. 132 RGC',
  },
  {
    code: 'P-15', name: 'Perfil irregular de la calzada', signId: 'calzada_irregular', type: 'peligro',
    description: 'Calzada con resaltos, badenes o el firme en mal estado. Riesgo de rebote del vehículo o daños en la suspensión.',
    action: 'Reduce velocidad. Aumenta la distancia con el vehículo de delante.',
    legalRef: 'Señal P-15 · Art. 132 RGC',
  },
  {
    code: 'P-17', name: 'Estrechamiento de calzada', signId: 'estrechamiento_calzada', type: 'peligro',
    description: 'La calzada se estrecha por ambos lados. Cuidado por reducción del espacio disponible.',
    action: 'Reduce velocidad. Mantente centrado en tu carril. No adelantes.',
    legalRef: 'Señal P-17 · Art. 132 RGC',
  },
  {
    code: 'P-18', name: 'Obras en la vía', signId: 'obras', type: 'peligro',
    description: 'Trabajos en la calzada con presencia posible de operarios y maquinaria. Suele acompañarse de señalización temporal amarilla.',
    action: 'Reduce velocidad. Obedece la señalización temporal (amarilla) que prevalece sobre la blanca.',
    legalRef: 'Señal P-18 · Art. 132 RGC',
  },
  {
    code: 'P-19', name: 'Pavimento deslizante', signId: 'pavimento_deslizante', type: 'peligro',
    description: 'Calzada resbaladiza por agua, aceite, gravilla, hielo u otras causas. La distancia de frenado aumenta.',
    action: 'Reduce velocidad. Aumenta la distancia de seguridad. Evita maniobras bruscas.',
    legalRef: 'Señal P-19 · Art. 132 RGC',
  },
  {
    code: 'P-20', name: 'Peatones cruzando', signId: 'peatones', type: 'peligro',
    description: 'Cuidado, te aproximas a un lugar donde suele haber peatones cruzando.',
    action: 'Reduce velocidad. Prepárate para detenerte. Los peatones que ya hayan iniciado el cruce tienen prioridad.',
    legalRef: 'Señal P-20 · Art. 132 RGC',
  },
  {
    code: 'P-22', name: 'Ciclistas', signId: 'ciclistas', type: 'peligro',
    description: 'Lugar por donde pasan o cruzan ciclistas con frecuencia. Recuerda la separación lateral mínima de 1,5 m al adelantar.',
    action: 'Reduce velocidad. Al adelantar deja al menos 1,5 m de separación lateral.',
    legalRef: 'Señal P-22 · Art. 132 RGC',
  },
  {
    code: 'P-29', name: 'Viento lateral fuerte', signId: 'viento_lateral', type: 'peligro',
    description: 'Rachas de viento de costado que pueden desestabilizar el vehículo, especialmente en puentes, salidas de túneles y para motos o vehículos altos.',
    action: 'Reduce velocidad. Agarra firme el volante. Si llevas remolque o carga en techo, extrema precauciones.',
    legalRef: 'Señal P-29 · Art. 132 RGC',
  },
];

export const SIGNS_PROHIBICION: CatalogSign[] = [
  {
    code: 'R-1', name: 'Ceda el paso', signId: 'ceda_el_paso', type: 'prohibicion',
    description: 'Obliga a ceder el paso a los vehículos que circulan por la vía a la que se accede. NO obliga a detenerse si no hay tráfico.',
    action: 'Cede el paso. Detente solo si es necesario.',
    legalRef: 'Señal R-1 · Art. 57 RGC',
  },
  {
    code: 'R-2', name: 'Stop', signId: 'stop', type: 'prohibicion',
    description: 'Obliga a detener completamente el vehículo y ceder el paso. Es la única señal del catálogo que exige siempre parada total, aunque no haya tráfico.',
    action: 'DETÉN COMPLETAMENTE el vehículo. Después cede el paso y reanuda la marcha cuando sea seguro.',
    legalRef: 'Señal R-2 · Art. 57 RGC',
  },
  {
    code: 'R-6', name: 'Preferencia en paso estrecho', signId: 'prioridad_sentido_contrario', type: 'prohibicion',
    description: 'Indica que tienes preferencia para pasar por un paso estrecho frente a los vehículos que vienen en sentido contrario. La señal complementaria R-5 ordena lo contrario.',
    action: 'Puedes pasar antes que el tráfico contrario. Hazlo con prudencia.',
    legalRef: 'Señal R-6 · Art. 57 RGC',
  },
  {
    code: 'R-101', name: 'Entrada prohibida', signId: 'entrada_prohibida', type: 'prohibicion',
    description: 'Prohíbe la entrada de todos los vehículos en ese sentido. Habitualmente indica que la vía es de sentido único contrario.',
    action: 'No entres. Acceder es infracción muy grave por circular en sentido contrario.',
    legalRef: 'Señal R-101 · Art. 141 RGC',
  },
  {
    code: 'R-301', name: 'Velocidad máxima 20 km/h', signId: 'vel_max_20', type: 'prohibicion',
    description: 'Velocidad máxima permitida en ese tramo: 20 km/h. Vigente hasta que aparezca otra señal de fin de limitación o nueva limitación.',
    action: 'No superes los 20 km/h.',
    legalRef: 'Señal R-301 · Art. 48 RGC',
  },
  {
    code: 'R-301', name: 'Velocidad máxima 30 km/h', signId: 'vel_max_30', type: 'prohibicion',
    description: 'Velocidad máxima 30 km/h. Habitual en calles urbanas con un carril por sentido y aceras (norma desde mayo 2021).',
    action: 'No superes los 30 km/h.',
    legalRef: 'Señal R-301 · Art. 48 RGC',
  },
  {
    code: 'R-301', name: 'Velocidad máxima 40 km/h', signId: 'vel_max_40', type: 'prohibicion',
    description: 'Velocidad máxima 40 km/h.',
    action: 'No superes los 40 km/h.',
    legalRef: 'Señal R-301 · Art. 48 RGC',
  },
  {
    code: 'R-301', name: 'Velocidad máxima 60 km/h', signId: 'vel_max_60', type: 'prohibicion',
    description: 'Velocidad máxima 60 km/h.',
    action: 'No superes los 60 km/h.',
    legalRef: 'Señal R-301 · Art. 48 RGC',
  },
  {
    code: 'R-301', name: 'Velocidad máxima 70 km/h', signId: 'vel_max_70', type: 'prohibicion',
    description: 'Velocidad máxima 70 km/h. Genérico en carretera convencional sin arcén practicable.',
    action: 'No superes los 70 km/h.',
    legalRef: 'Señal R-301 · Art. 48 RGC',
  },
  {
    code: 'R-301', name: 'Velocidad máxima 80 km/h', signId: 'vel_max_80', type: 'prohibicion',
    description: 'Velocidad máxima 80 km/h.',
    action: 'No superes los 80 km/h.',
    legalRef: 'Señal R-301 · Art. 48 RGC',
  },
  {
    code: 'R-301', name: 'Velocidad máxima 90 km/h', signId: 'vel_max_90', type: 'prohibicion',
    description: 'Velocidad máxima 90 km/h. Genérico para turismos en carretera convencional con arcén practicable.',
    action: 'No superes los 90 km/h.',
    legalRef: 'Señal R-301 · Art. 48 RGC',
  },
  {
    code: 'R-301', name: 'Velocidad máxima 100 km/h', signId: 'vel_max_100', type: 'prohibicion',
    description: 'Velocidad máxima 100 km/h. Genérico para camiones y autobuses en autopista/autovía.',
    action: 'No superes los 100 km/h.',
    legalRef: 'Señal R-301 · Art. 48 RGC',
  },
  {
    code: 'R-301', name: 'Velocidad máxima 110 km/h', signId: 'vel_max_110', type: 'prohibicion',
    description: 'Velocidad máxima 110 km/h.',
    action: 'No superes los 110 km/h.',
    legalRef: 'Señal R-301 · Art. 48 RGC',
  },
  {
    code: 'R-301', name: 'Velocidad máxima 120 km/h', signId: 'vel_max_120', type: 'prohibicion',
    description: 'Velocidad máxima 120 km/h. Genérico para turismos en autopista y autovía.',
    action: 'No superes los 120 km/h.',
    legalRef: 'Señal R-301 · Art. 48 RGC',
  },
  {
    code: 'R-302', name: 'Prohibido girar a la derecha', signId: 'prohibido_girar_derecha', type: 'prohibicion',
    description: 'Prohíbe el giro a la derecha en la próxima intersección.',
    action: 'No gires a la derecha. Continúa recto o gira a la izquierda si está permitido.',
    legalRef: 'Señal R-302 · Art. 141 RGC',
  },
  {
    code: 'R-303', name: 'Prohibido girar a la izquierda y cambio de sentido', signId: 'prohibido_girar_izquierda', type: 'prohibicion',
    description: 'Prohíbe el giro a la izquierda en la próxima intersección y el cambio de sentido (giro en U).',
    action: 'No gires a la izquierda ni hagas cambio de sentido aquí.',
    legalRef: 'Señal R-303 · Art. 141 RGC',
  },
  {
    code: 'R-304', name: 'Prohibido el cambio de sentido', signId: 'prohibido_cambio_sentido', type: 'prohibicion',
    description: 'Prohíbe el cambio de sentido (giro en U / dar media vuelta).',
    action: 'No hagas cambio de sentido. Continúa hasta zona segura.',
    legalRef: 'Señal R-304 · Art. 141 RGC',
  },
  {
    code: 'R-305', name: 'Prohibido adelantar', signId: 'prohibido_adelantar', type: 'prohibicion',
    description: 'Prohíbe adelantar a vehículos de motor de más de dos ruedas. Sí puedes adelantar bicicletas, ciclomotores y motos de 2 ruedas.',
    action: 'No adelantes salvo motos/bicis. La prohibición termina con la señal R-502.',
    legalRef: 'Señal R-305 · Art. 82 RGC',
  },
  {
    code: 'R-306', name: 'Prohibido adelantar para camiones', signId: 'prohibido_adelantar_camiones', type: 'prohibicion',
    description: 'Prohíbe adelantar a los camiones de más de 3.500 kg de masa máxima autorizada. Los turismos sí pueden adelantar.',
    action: 'Si conduces un camión >3.500 kg, no adelantes.',
    legalRef: 'Señal R-306 · Art. 82 RGC',
  },
  {
    code: 'R-500', name: 'Fin de todas las prohibiciones', signId: 'fin_limitaciones', type: 'prohibicion',
    description: 'Cancela TODAS las prohibiciones impuestas anteriormente para los vehículos en marcha, incluida la prohibición de adelantar.',
    action: 'Pueden reanudarse las maniobras antes prohibidas. Sigue siempre las normas generales de la vía.',
    legalRef: 'Señal R-500 · Art. 148 RGC',
  },
  {
    code: 'R-502', name: 'Fin de prohibición de adelantamiento', signId: 'fin_prohibido_adelantar', type: 'prohibicion',
    description: 'Cancela específicamente la prohibición de adelantar (R-305). El resto de prohibiciones siguen vigentes.',
    action: 'Ya puedes adelantar si es seguro.',
    legalRef: 'Señal R-502 · Art. 148 RGC',
  },
];

export const SIGNS_OBLIGACION: CatalogSign[] = [
  {
    code: 'R-400a', name: 'Obligación de ir hacia la derecha', signId: 'obligacion_ir_derecha', type: 'obligacion',
    description: 'Obligación de dirigirse hacia la derecha en la dirección que indica la flecha. Habitual antes de un obstáculo o en una intersección.',
    action: 'Debes ir hacia la derecha. Otra dirección es infracción.',
    legalRef: 'Señal R-400a · Art. 149 RGC',
  },
  {
    code: 'R-400b', name: 'Obligación de ir hacia la izquierda', signId: 'obligacion_ir_izquierda', type: 'obligacion',
    description: 'Obligación de dirigirse hacia la izquierda en la dirección de la flecha.',
    action: 'Debes ir hacia la izquierda.',
    legalRef: 'Señal R-400b · Art. 149 RGC',
  },
  {
    code: 'R-401a', name: 'Paso obligatorio por la derecha del obstáculo', signId: 'paso_obligatorio_derecha', type: 'obligacion',
    description: 'Obliga a circular por el lado derecho del obstáculo que se aproxima (mediana, isla, etc.).',
    action: 'Pasa por la derecha del obstáculo.',
    legalRef: 'Señal R-401a · Art. 149 RGC',
  },
  {
    code: 'R-401b', name: 'Paso obligatorio por la izquierda del obstáculo', signId: 'paso_obligatorio_izquierda', type: 'obligacion',
    description: 'Obliga a circular por el lado izquierdo del obstáculo que se aproxima.',
    action: 'Pasa por la izquierda del obstáculo.',
    legalRef: 'Señal R-401b · Art. 149 RGC',
  },
];

export const SIGNS_INDICACION: CatalogSign[] = [
  {
    code: 'S-1a', name: 'Inicio de autovía', signId: 'autovia', type: 'indicacion',
    description: 'Indica que comienza una autovía. Velocidad máxima 120 km/h. Prohibido el acceso a peatones, ciclos, ciclomotores y vehículos agrícolas.',
    action: 'Adapta tu conducción a una vía rápida. Circula por la derecha y usa la izquierda solo para adelantar.',
    legalRef: 'Señal S-1a · Art. 138 RGC',
  },
  {
    code: 'S-2a', name: 'Fin de autovía', signId: 'fin_autovia', type: 'indicacion',
    description: 'Indica que termina la autovía. La vía cambia a un tipo de menor categoría: atento a la nueva señalización de velocidad y accesos.',
    action: 'Reduce velocidad. Lee la nueva señalización de la vía siguiente.',
    legalRef: 'Señal S-2a · Art. 138 RGC',
  },
  {
    code: 'S-17a', name: 'Lugar de aparcamiento', signId: 'estacionamiento', type: 'indicacion',
    description: 'Indica un lugar destinado al estacionamiento de vehículos.',
    action: 'Puedes aparcar. Atento a las restricciones complementarias (horario, tipo de vehículo, etc.).',
    legalRef: 'Señal S-17a · Art. 159 RGC',
  },
  {
    code: 'S-28', name: 'Zona residencial / Calle peatonal prioritaria', signId: 'zona_peatonal', type: 'indicacion',
    description: 'Entrada a una calle de uso preferente peatonal. Los peatones tienen prioridad absoluta y pueden ocupar toda la calzada. Velocidad máxima 20 km/h.',
    action: 'Circula a 20 km/h máximo. Cede el paso a los peatones.',
    legalRef: 'Señal S-28 · Art. 159 RGC',
  },
  {
    code: 'S-29', name: 'Carril reservado para ciclistas (carril bici)', signId: 'carril_bici', type: 'indicacion',
    description: 'Vía o carril reservado a ciclos. Los vehículos a motor no pueden circular, detenerse ni estacionar en él.',
    action: 'No invadas el carril bici ni para detenerte un segundo.',
    legalRef: 'Señal S-29 · Art. 159 RGC',
  },
];

export const ALL_SIGN_GROUPS = [
  { title: 'Señales de Peligro', subtitle: 'Triángulo blanco con borde rojo — advierten de un riesgo próximo', type: 'peligro' as SignType, signs: SIGNS_PELIGRO, color: '#E63946' },
  { title: 'Señales de Prohibición y Restricción', subtitle: 'Círculo blanco con borde rojo (o especiales como STOP)', type: 'prohibicion' as SignType, signs: SIGNS_PROHIBICION, color: '#C62828' },
  { title: 'Señales de Obligación', subtitle: 'Círculo azul — imponen una acción obligatoria', type: 'obligacion' as SignType, signs: SIGNS_OBLIGACION, color: '#1565C0' },
  { title: 'Señales de Indicación', subtitle: 'Rectangulares azules o verdes — informan de servicios e instalaciones', type: 'indicacion' as SignType, signs: SIGNS_INDICACION, color: '#006633' },
];
