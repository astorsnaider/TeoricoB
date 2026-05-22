/**
 * Catálogo completo de señales de tráfico españolas.
 * Fuente: Reglamento General de Circulación (RD 1428/2003), Anexos I y II.
 * Convención de Viena sobre señales viales (ratificada por España).
 */

export type SignType = 'peligro' | 'prohibicion' | 'obligacion' | 'indicacion' | 'semaforo' | 'marca';

export interface CatalogSign {
  code: string;        // Código oficial (P-1a, R-301, etc.)
  name: string;        // Nombre oficial
  signId: string;      // ID para el componente TrafficSign
  description: string; // Qué significa / cuándo se pone
  action: string;      // Qué debe hacer el conductor al verla
  legalRef?: string;   // Referencia legal exacta
  type: SignType;
}

export const SIGNS_PELIGRO: CatalogSign[] = [
  {
    code: 'P-1a', name: 'Curva peligrosa a la derecha', signId: 'curva_derecha', type: 'peligro',
    description: 'Advierte de una curva próxima hacia la derecha con radio de curvatura inferior al mínimo para la velocidad señalizada o inferior a 45 m.',
    action: 'Reduce la velocidad antes de entrar en la curva. No frenes dentro de la curva. Mantente en tu carril.',
    legalRef: 'Señal P-1a · Art. 132 RGC',
  },
  {
    code: 'P-1b', name: 'Curva peligrosa a la izquierda', signId: 'curva_izquierda', type: 'peligro',
    description: 'Advierte de una curva próxima hacia la izquierda con características similares a la P-1a.',
    action: 'Reduce la velocidad antes de entrar. Extrema la atención al tráfico contrario que puede invadir tu carril.',
    legalRef: 'Señal P-1b · Art. 132 RGC',
  },
  {
    code: 'P-2a', name: 'Doble curva (primera a la derecha)', signId: 'doble_curva', type: 'peligro',
    description: 'Indica dos curvas sucesivas con radios de curvatura peligrosos. La primera gira a la derecha. Especialmente peligrosa porque el conductor puede descuidar la segunda curva.',
    action: 'Reduce considerablemente la velocidad. Prepárate para ambas curvas antes de entrar en la primera.',
    legalRef: 'Señal P-2a · Art. 132 RGC',
  },
  {
    code: 'P-3', name: 'Badén', signId: 'baden', type: 'peligro',
    description: 'Señala la existencia de un resalte transversal en la calzada (badén) que puede provocar daños en el vehículo si se cruza a velocidad inadecuada.',
    action: 'Reduce la velocidad antes del badén. Crúzalo despacio para evitar daños en la suspensión y carrocería.',
    legalRef: 'Señal P-3 · Art. 132 RGC',
  },
  {
    code: 'P-4', name: 'Perfil irregular de la calzada', signId: 'calzada_irregular', type: 'peligro',
    description: 'Indica que el firme presenta baches, ondulaciones, diferencias de nivel entre la calzada y el arcén, o deterioro importante del asfalto.',
    action: 'Reduce la velocidad. Mantén bien agarrado el volante, pues el vehículo puede moverse de forma imprevista.',
    legalRef: 'Señal P-4 · Art. 132 RGC',
  },
  {
    code: 'P-5', name: 'Pavimento deslizante', signId: 'pavimento_deslizante', type: 'peligro',
    description: 'Advierte de que la calzada tiene escasa adherencia, ya sea por la presencia de hielo, arena, grava suelta, aceite, agua u otro material que la hace especialmente resbaladiza.',
    action: 'Reduce la velocidad drásticamente. Evita frenadas y aceleraciones bruscas. Aumenta la distancia de seguridad.',
    legalRef: 'Señal P-5 · Art. 132 RGC',
  },
  {
    code: 'P-6', name: 'Estrechamiento de calzada', signId: 'estrechamiento', type: 'peligro',
    description: 'Indica que la anchura de la calzada se reduce próximamente, bien por reducción del número de carriles o por estrechamiento físico de la vía.',
    action: 'Reduce la velocidad. Si el estrechamiento es por obra, obedece la señalización provisional (amarilla). Cede el paso si es necesario.',
    legalRef: 'Señal P-6 · Art. 132 RGC',
  },
  {
    code: 'P-9a', name: 'Paso a nivel con barreras', signId: 'paso_nivel_con', type: 'peligro',
    description: 'Indica la proximidad de un cruce de la calzada con una vía de ferrocarril que dispone de barreras (automáticas o manuales) y/o semáforos de protección.',
    action: 'Reduce la velocidad. Cuando las barreras estén bajando o bajadas, detente completamente. Nunca te detengas sobre las vías.',
    legalRef: 'Señal P-9a · Art. 132 RGC',
  },
  {
    code: 'P-9b', name: 'Paso a nivel sin barreras', signId: 'paso_nivel_sin', type: 'peligro',
    description: 'PELIGRO MÁXIMO: indica un cruce con vía de ferrocarril sin ninguna barrera ni semáforo. El conductor es el único responsable de asegurar que no viene ningún tren antes de cruzar.',
    action: 'Para completamente. Baja la ventanilla. Mira y escucha en ambas direcciones. Solo cruza cuando tengas absoluta certeza de que no viene ningún tren.',
    legalRef: 'Señal P-9b · Art. 132 RGC',
  },
  {
    code: 'P-10', name: 'Semáforos', signId: 'semaforos', type: 'peligro',
    description: 'Advierte de la proximidad de una intersección o paso de peatones regulado por semáforos. Ayuda a anticipar que puede haber una luz roja más adelante.',
    action: 'Reduce la velocidad y prepárate para detenerte. No intentes "pillar" el verde acelerando.',
    legalRef: 'Señal P-10 · Art. 132 RGC',
  },
  {
    code: 'P-13a', name: 'Viento lateral fuerte (de la derecha)', signId: 'viento_lateral', type: 'peligro',
    description: 'Advierte de una zona donde hay frecuentes y fuertes rachas de viento transversal procedente de la derecha, que pueden desestabilizar el vehículo, especialmente furgonetas, camiones y vehículos altos.',
    action: 'Reduce la velocidad. Agarra bien el volante con ambas manos. Anticipa las rachas que pueden mover el vehículo lateralmente.',
    legalRef: 'Señal P-13a · Art. 132 RGC',
  },
  {
    code: 'P-14', name: 'Desprendimiento de piedras', signId: 'desprendimientos', type: 'peligro',
    description: 'Señala una zona donde pueden caer piedras o roca desde el talud lateral sobre la calzada, bien de forma espontánea o por la lluvia.',
    action: 'Reduce la velocidad. Circula alejado del talud. Extrema la precaución si hay nieve, lluvia o hielo reciente.',
    legalRef: 'Señal P-14 · Art. 132 RGC',
  },
  {
    code: 'P-17', name: 'Paso de peatones', signId: 'paso_peatones', type: 'peligro',
    description: 'Advierte de la proximidad de un paso de peatones señalizado en la calzada. Los peatones tienen prioridad cuando cruzan o van a cruzar.',
    action: 'Reduce la velocidad. Prepárate para ceder el paso. Comprueba que no haya peatones cruzando o a punto de cruzar antes de pasar.',
    legalRef: 'Señal P-17 · Art. 132 RGC',
  },
  {
    code: 'P-18', name: 'Zona escolar / presencia de niños', signId: 'ninos', type: 'peligro',
    description: 'Advierte de la presencia frecuente de niños en la calzada o sus proximidades, habitualmente por la cercanía de un colegio, parque infantil o zona de juego.',
    action: 'Reduce considerablemente la velocidad. Los niños son impredecibles y pueden cruzar sin mirar. Extrema la vigilancia.',
    legalRef: 'Señal P-18 · Art. 132 RGC',
  },
  {
    code: 'P-19', name: 'Ciclistas en calzada', signId: 'ciclistas', type: 'peligro',
    description: 'Indica que es habitual la presencia de ciclistas en la calzada, generalmente porque hay un itinerario ciclista o la vía es frecuentada por ciclistas.',
    action: 'Reduce la velocidad. Mantén mayor distancia lateral al adelantar (mínimo 1,5 m). Los ciclistas tienen derecho a usar la calzada.',
    legalRef: 'Señal P-19 · Art. 132 RGC',
  },
  {
    code: 'P-20', name: 'Obras en la vía', signId: 'obras', type: 'peligro',
    description: 'Indica la presencia de trabajos en curso en la calzada o sus inmediaciones. Puede haber trabajadores, maquinaria, señalización provisional y cambios en la calzada habitual.',
    action: 'Reduce la velocidad. Obedece la señalización provisional (marcas y señales amarillas). Respeta a los trabajadores y operarios.',
    legalRef: 'Señal P-20 · Art. 132 RGC',
  },
  {
    code: 'P-21', name: 'Prioridad en sentido contrario', signId: 'prioridad_sentido_contrario', type: 'peligro',
    description: 'Advierte de un estrechamiento próximo donde los vehículos que circulan en sentido contrario tienen preferencia de paso. Debes esperar hasta que hayan pasado.',
    action: 'Reduce la velocidad y prepárate para ceder el paso a los vehículos que vengan de frente. Detente si es necesario.',
    legalRef: 'Señal P-21 · Art. 132 RGC',
  },
];

export const SIGNS_PROHIBICION: CatalogSign[] = [
  {
    code: 'R-1', name: 'Ceda el Paso', signId: 'ceda_el_paso', type: 'prohibicion',
    description: 'Triángulo invertido (vértice hacia abajo), blanco con borde rojo. Obliga a ceder el paso a los vehículos que circulan por la vía a la que se accede. NO obliga a detenerse si no hay tráfico.',
    action: 'Cede el paso a todos los vehículos de la vía principal. Si hay visibilidad y no viene nadie, puedes continuar sin parar.',
    legalRef: 'Señal R-1 · Art. 57 RGC',
  },
  {
    code: 'R-2', name: 'STOP', signId: 'stop', type: 'prohibicion',
    description: 'Octogonal (8 lados), fondo rojo, letras STOP en blanco. Obliga a detenerse COMPLETAMENTE antes de la línea de stop, aunque no haya tráfico. Es la señal más restrictiva de prioridad.',
    action: 'DETENERSE completamente, incluso si no viene nadie. Inmoviliza el vehículo. Comprueba que la vía está libre y continúa solo cuando sea seguro.',
    legalRef: 'Señal R-2 · Art. 57 RGC',
  },
  {
    code: 'R-5', name: 'Prioridad en sentido contrario', signId: 'prioridad_sentido_contrario', type: 'prohibicion',
    description: 'Triangular, flecha roja grande hacia arriba y flecha blanca pequeña hacia abajo. Indica que en el paso estrecho siguiente los vehículos en sentido contrario tienen prioridad sobre ti.',
    action: 'Cede el paso a los vehículos que vengan de frente. Espera hasta que hayan pasado antes de entrar en el tramo estrecho.',
    legalRef: 'Señal R-5 · Art. 57 RGC',
  },
  {
    code: 'R-100', name: 'Entrada prohibida', signId: 'entrada_prohibida', type: 'prohibicion',
    description: 'Círculo rojo con barra blanca horizontal central. Prohíbe la entrada de cualquier tipo de vehículo en ese sentido. Diferente de "dirección prohibida": aquí no puede entrar nadie, en ningún sentido.',
    action: 'No entres bajo ningún concepto. Esta señal suele indicar una calle de sentido único por la que no debes circular.',
    legalRef: 'Señal R-100 · Art. 141 RGC',
  },
  {
    code: 'R-200', name: 'Dirección prohibida', signId: 'direccion_prohibida', type: 'prohibicion',
    description: 'Círculo blanco con borde rojo y barra roja horizontal. Prohíbe circular en ese sentido en esa vía. A diferencia de la entrada prohibida, puede combinarse con la misma señal en el otro lado para una calle de dos sentidos con restricciones.',
    action: 'No circules en ese sentido. Busca otra ruta.',
    legalRef: 'Señal R-200 · Art. 141 RGC',
  },
  {
    code: 'R-301', name: 'Velocidad máxima 20 km/h', signId: 'vel_max_20', type: 'prohibicion',
    description: 'Círculo blanco con borde rojo y el número 20 en negro. Establece una velocidad máxima de 20 km/h a partir del punto de ubicación de la señal y hasta la señal de fin de limitación o cambio de límite.',
    action: 'No superes los 20 km/h. Esta velocidad suele aplicarse en zonas de coexistencia y áreas peatonales.',
    legalRef: 'Señal R-301 · Art. 48 RGC',
  },
  {
    code: 'R-301', name: 'Velocidad máxima 30 km/h', signId: 'vel_max_30', type: 'prohibicion',
    description: 'Establece un límite de 30 km/h. Muy habitual en calles urbanas de un carril por sentido desde la reforma de velocidades de mayo 2021.',
    action: 'No superes los 30 km/h. Es el límite habitual en la mayoría de calles residenciales en España desde 2021.',
    legalRef: 'Señal R-301 · Instrucción 2021/V-046 DGT',
  },
  {
    code: 'R-301', name: 'Velocidad máxima 50 km/h', signId: 'vel_max_50', type: 'prohibicion',
    description: 'Establece un límite de 50 km/h. Límite genérico en vías urbanas con dos o más carriles por sentido.',
    action: 'No superes los 50 km/h en la zona señalizada.',
    legalRef: 'Señal R-301 · Art. 48 LSV',
  },
  {
    code: 'R-301', name: 'Velocidad máxima 90 km/h', signId: 'vel_max_90', type: 'prohibicion',
    description: 'Establece un límite de 90 km/h. Se usa en carreteras convencionales para rebajar el límite genérico (también 90 km/h) o como restricción específica en tramos peligrosos.',
    action: 'No superes los 90 km/h.',
    legalRef: 'Señal R-301 · Art. 48 LSV',
  },
  {
    code: 'R-301', name: 'Velocidad máxima 120 km/h', signId: 'vel_max_120', type: 'prohibicion',
    description: 'Establece o recuerda el límite máximo de 120 km/h para turismos en autopistas y autovías.',
    action: 'No superes los 120 km/h. Recuerda que es el MÁXIMO, no la velocidad obligatoria.',
    legalRef: 'Señal R-301 · Art. 48 LSV',
  },
  {
    code: 'R-305', name: 'Prohibido adelantar', signId: 'prohibido_adelantar', type: 'prohibicion',
    description: 'Círculo blanco con borde rojo mostrando dos coches (uno negro, uno rojo). Prohíbe adelantar a cualquier vehículo de motor, excepto ciclomotores, bicicletas, vehículos de tracción animal y de velocidad reducida.',
    action: 'Quédate detrás del vehículo precedente. No adelantes aunque haya visibilidad. Espera a la señal de fin de la prohibición.',
    legalRef: 'Señal R-305 · Art. 82 RGC',
  },
  {
    code: 'R-307', name: 'Prohibido adelantar a camiones', signId: 'prohibido_adelantar_camiones', type: 'prohibicion',
    description: 'Solo prohíbe que los vehículos de más de 3.500 kg adelanten a otros camiones. Los turismos pueden adelantar a camiones si no hay línea continua.',
    action: 'Si conduces un camión u otro vehículo pesado: no adelantes a otros camiones en ese tramo.',
    legalRef: 'Señal R-307 · Art. 82 RGC',
  },
  {
    code: 'R-400a', name: 'Prohibido girar a la derecha', signId: 'prohibido_girar_derecha', type: 'prohibicion',
    description: 'Círculo blanco con borde rojo y flecha curvada hacia la derecha tachada. Prohíbe girar a la derecha en esa intersección.',
    action: 'No gires a la derecha. Sigue recto o gira a la izquierda si está permitido.',
    legalRef: 'Señal R-400a · Art. 141 RGC',
  },
  {
    code: 'R-400b', name: 'Prohibido girar a la izquierda', signId: 'prohibido_girar_izquierda', type: 'prohibicion',
    description: 'Prohíbe girar a la izquierda en esa intersección.',
    action: 'No gires a la izquierda. Sigue recto o da la vuelta más adelante si es necesario.',
    legalRef: 'Señal R-400b · Art. 141 RGC',
  },
  {
    code: 'R-404', name: 'Prohibido el cambio de sentido', signId: 'prohibido_cambio_sentido', type: 'prohibicion',
    description: 'Prohíbe dar la vuelta (cambiar de sentido de circulación) en ese punto de la vía.',
    action: 'No des la vuelta. Continúa en el mismo sentido y busca otro punto donde esté permitido.',
    legalRef: 'Señal R-404 · Art. 74 RGC',
  },
  {
    code: 'R-500', name: 'Fin de limitaciones', signId: 'fin_limitaciones', type: 'prohibicion',
    description: 'Círculo gris con rayas diagonales negras. Cancela TODAS las restricciones impuestas por señales anteriores: velocidad máxima, prohibición de adelantar y otras limitaciones. EXCEPCIÓN: no cancela la prohibición de adelantar si hay señal R-305.',
    action: 'Las restricciones anteriores quedan levantadas. Aplican ahora los límites genéricos de la vía (ej. 90 km/h en carretera, 120 km/h en autopista).',
    legalRef: 'Señal R-500 · Art. 148 RGC',
  },
  {
    code: 'R-502', name: 'Fin de prohibición de adelantamiento', signId: 'fin_prohibido_adelantar', type: 'prohibicion',
    description: 'Cancela específicamente la prohibición de adelantamiento establecida por la señal R-305. Las demás restricciones pueden seguir vigentes.',
    action: 'Puedes adelantar de nuevo, siempre que las condiciones de visibilidad y seguridad lo permitan.',
    legalRef: 'Señal R-502 · Art. 148 RGC',
  },
];

export const SIGNS_OBLIGACION: CatalogSign[] = [
  {
    code: 'R-400a', name: 'Dirección obligatoria: recto', signId: 'sentido_recto', type: 'obligacion',
    description: 'Círculo azul con flecha blanca recta hacia arriba. Impone la obligación de circular recto en ese punto. No puedes girar ni a la derecha ni a la izquierda.',
    action: 'Sigue recto obligatoriamente. Si necesitas girar, hazlo antes o después de la señal.',
    legalRef: 'Señal R-400a · Art. 149 RGC',
  },
  {
    code: 'R-400b', name: 'Dirección obligatoria: derecha', signId: 'sentido_derecha', type: 'obligacion',
    description: 'Círculo azul con flecha blanca hacia la derecha. Obliga a girar a la derecha en ese punto.',
    action: 'Gira obligatoriamente a la derecha. No puedes seguir recto ni girar a la izquierda.',
    legalRef: 'Señal R-400b · Art. 149 RGC',
  },
  {
    code: 'R-400c', name: 'Dirección obligatoria: izquierda', signId: 'sentido_izquierda', type: 'obligacion',
    description: 'Círculo azul con flecha blanca hacia la izquierda. Obliga a girar a la izquierda en ese punto.',
    action: 'Gira obligatoriamente a la izquierda.',
    legalRef: 'Señal R-400c · Art. 149 RGC',
  },
  {
    code: 'R-401a', name: 'Paso obligatorio: derecha', signId: 'paso_obligatorio_derecha', type: 'obligacion',
    description: 'Círculo azul con flecha que dobla hacia la derecha. Obliga a pasar por el lado derecho de un obstáculo o isleta.',
    action: 'Pasa por el lado derecho del obstáculo o isleta indicado.',
    legalRef: 'Señal R-401a · Art. 149 RGC',
  },
  {
    code: 'R-401b', name: 'Paso obligatorio: izquierda', signId: 'paso_obligatorio_izquierda', type: 'obligacion',
    description: 'Obliga a pasar por el lado izquierdo de un obstáculo o isleta.',
    action: 'Pasa por el lado izquierdo del obstáculo o isleta.',
    legalRef: 'Señal R-401b · Art. 149 RGC',
  },
  {
    code: 'R-408', name: 'Velocidad mínima obligatoria', signId: 'vel_min_60', type: 'obligacion',
    description: 'Círculo azul con un número blanco. Establece la velocidad mínima a la que debe circular el vehículo. Circular por debajo de ese límite es infracción grave.',
    action: 'No circules por debajo de la velocidad indicada. En autopista el mínimo genérico es 60 km/h.',
    legalRef: 'Señal R-408 · Art. 50 RGC',
  },
  {
    code: 'R-409', name: 'Uso obligatorio de cadenas', signId: 'cadenas', type: 'obligacion',
    description: 'Círculo azul con símbolo de neumático con cadena. Obliga a circular con cadenas montadas en las ruedas motrices. Se instala en carreteras de montaña cuando hay hielo o nieve.',
    action: 'Monta las cadenas antes de continuar. Sin cadenas no puedes circular por esa vía.',
    legalRef: 'Señal R-409 · Art. 110 RGC',
  },
];

export const SIGNS_INDICACION: CatalogSign[] = [
  {
    code: 'I-1', name: 'Autopista', signId: 'autopista', type: 'indicacion',
    description: 'Señal rectangular azul con el símbolo de autopista. Indica el inicio o la existencia de una autopista. A partir de este punto se aplican las normas específicas de autopista: velocidad máxima 120 km/h, mínima 60 km/h, prohibición de peatones, bicicletas y ciclomotores.',
    action: 'Adapta tu conducción a las normas de autopista. Velocidad máxima 120 km/h, mínima 60 km/h. No te detengas salvo emergencia.',
    legalRef: 'Señal I-1 · Art. 120 RGC',
  },
  {
    code: 'I-2', name: 'Autovía', signId: 'autovia', type: 'indicacion',
    description: 'Señal rectangular verde con el símbolo de autopista. Indica una autovía. Las normas son idénticas a las de autopista (120 km/h máximo, 60 km/h mínimo) pero a diferencia de la autopista puede ser gratuita.',
    action: 'Mismas normas que la autopista. Velocidad máxima 120 km/h, mínima 60 km/h.',
    legalRef: 'Señal I-2 · Art. 120 RGC',
  },
  {
    code: 'S-13', name: 'Zona peatonal', signId: 'zona_peatonal', type: 'indicacion',
    description: 'Señal rectangular azul con figura de peatón. Indica el inicio de una zona reservada para peatones donde los vehículos solo pueden acceder con autorización especial.',
    action: 'Los vehículos no pueden entrar salvo autorización. Los peatones tienen absoluta prioridad.',
    legalRef: 'Señal S-13 · Art. 49 RGC',
  },
  {
    code: 'S-17', name: 'Estacionamiento', signId: 'estacionamiento', type: 'indicacion',
    description: 'Señal rectangular azul con letra P blanca. Indica una zona habilitada para aparcar. Puede ir acompañada de paneles adicionales que indican horario, precio o tipo de vehículo autorizado.',
    action: 'Puedes aparcar en la zona indicada. Lee los paneles complementarios para conocer restricciones de tiempo, horario o precio.',
    legalRef: 'Señal S-17 · Art. 91 RGC',
  },
  {
    code: 'S-60', name: 'Carril reservado para ciclistas', signId: 'carril_bici', type: 'indicacion',
    description: 'Señal azul rectangular con símbolo de bicicleta. Indica un carril exclusivamente reservado para ciclistas. Los vehículos a motor no pueden circular ni aparcar en él.',
    action: 'Respeta el carril bici. No invadas este espacio ni siquiera brevemente.',
    legalRef: 'Señal S-60 · Art. 121 RGC',
  },
];

export const SIGNS_SEMAFORO: CatalogSign[] = [
  {
    code: 'Luz roja', name: 'Semáforo rojo — Parada obligatoria', signId: 'semaforo_rojo', type: 'semaforo',
    description: 'La luz roja fija obliga a detenerse completamente antes de la línea de stop. No puedes cruzar la intersección bajo ningún concepto mientras dure la luz roja. Saltarse un semáforo en rojo es infracción MUY GRAVE: 6 puntos y 200 euros.',
    action: 'PARA completamente antes de la línea de stop. Espera a la luz verde.',
    legalRef: 'Art. 156 RGC',
  },
  {
    code: 'Luz ámbar', name: 'Semáforo ámbar — Parada preventiva', signId: 'semaforo_ambar', type: 'semaforo',
    description: 'La luz ámbar (amarilla) indica que la señal va a cambiar a roja. OBLIGA A DETENERSE, salvo que el conductor esté tan próximo a la línea de stop que frenar pudiera resultar peligroso. NUNCA es señal de "acelerar para pasar".',
    action: 'Frena y detente. Solo continúa si estás tan cerca que frenar sería peligroso. Nunca aceleres.',
    legalRef: 'Art. 156 RGC',
  },
  {
    code: 'Luz verde', name: 'Semáforo verde — Paso permitido', signId: 'semaforo_verde', type: 'semaforo',
    description: 'La luz verde autoriza el paso. Sin embargo, debes respetar la prioridad de los peatones que ya hayan comenzado a cruzar. Si hay una flecha verde, solo puedes circular en esa dirección.',
    action: 'Puedes avanzar. Comprueba que no haya peatones en el paso antes de cruzar.',
    legalRef: 'Art. 156 RGC',
  },
];

export const SIGNS_MARCAS: CatalogSign[] = [
  {
    code: 'M-2.1', name: 'Línea longitudinal continua', signId: 'linea_continua', type: 'marca',
    description: 'Línea blanca continua pintada en el eje o en los bordes de la calzada. Prohíbe cruzarla o circular sobre ella. Separa sentidos de circulación o carriles con maniobras incompatibles.',
    action: 'No la cruces ni circula sobre ella. Supone pérdida de 4 puntos si la cruzas para adelantar.',
    legalRef: 'Marca M-2.1 · Art. 162 RGC',
  },
  {
    code: 'M-1.3', name: 'Línea longitudinal discontinua', signId: 'linea_discontinua', type: 'marca',
    description: 'Línea blanca discontinua en el eje de la calzada. Puedes cruzarla para adelantar u otras maniobras, siempre que la seguridad lo permita. Orienta la circulación sin imponer restricción absoluta.',
    action: 'Puedes cruzarla para adelantar si hay visibilidad suficiente y es seguro hacerlo.',
    legalRef: 'Marca M-1.3 · Art. 162 RGC',
  },
  {
    code: 'M-4.2', name: 'Ceda el Paso en el suelo', signId: 'ceda_suelo', type: 'marca',
    description: 'Triángulo invertido y/o línea discontinua transversal pintados en la calzada. Refuerzan la señal vertical R-1 (Ceda el Paso). Indican el punto exacto donde debes ceder el paso si es necesario detenerse.',
    action: 'Cede el paso a los vehículos de la vía a la que accedes. Si hay visibilidad y no viene nadie, puedes continuar sin parar.',
    legalRef: 'Marca M-4.2 · Art. 164 RGC',
  },
  {
    code: 'M-4.1', name: 'Stop en el suelo', signId: 'stop_suelo', type: 'marca',
    description: 'Línea blanca continua transversal con la inscripción "STOP" pintada en la calzada. Refuerza la señal vertical R-2 (Stop). Indica el punto exacto donde debes detener completamente el vehículo.',
    action: 'DETENTE completamente en esa línea o antes. Aunque no venga nadie, la parada es obligatoria.',
    legalRef: 'Marca M-4.1 · Art. 164 RGC',
  },
];

export const ALL_SIGN_GROUPS = [
  { title: 'Señales de Peligro', subtitle: 'Triángulo blanco con borde rojo — advierten de un riesgo próximo', type: 'peligro' as SignType, signs: SIGNS_PELIGRO, color: '#E63946' },
  { title: 'Señales de Prohibición y Restricción', subtitle: 'Círculo blanco con borde rojo (o especiales como STOP)', type: 'prohibicion' as SignType, signs: SIGNS_PROHIBICION, color: '#C62828' },
  { title: 'Señales de Obligación', subtitle: 'Círculo azul — imponen una acción obligatoria', type: 'obligacion' as SignType, signs: SIGNS_OBLIGACION, color: '#1565C0' },
  { title: 'Señales de Indicación', subtitle: 'Rectangulares azules o verdes — informan de servicios e instalaciones', type: 'indicacion' as SignType, signs: SIGNS_INDICACION, color: '#006633' },
  { title: 'Semáforos', subtitle: 'Señales luminosas que regulan la circulación', type: 'semaforo' as SignType, signs: SIGNS_SEMAFORO, color: '#E65100' },
  { title: 'Marcas Viales', subtitle: 'Líneas y símbolos pintados en el asfalto', type: 'marca' as SignType, signs: SIGNS_MARCAS, color: '#37474F' },
];
