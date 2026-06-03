/**
 * Escenarios de tráfico en vista cenital.
 *
 * Son diagramas vectoriales propios (no son señales del Anexo I del RGC).
 * Cada escena ilustra una situación regulada en el RGC para que la
 * pregunta asociada pueda referirse a elementos identificables ("el
 * coche rojo", "el coche azul", "el peatón", "el ciclista").
 *
 * Cada entrada respaldada por:
 * - Cita textual de TeoricaAbreviada (DGT lectura fácil) cuando exista, o
 * - Artículo del Reglamento General de Circulación (RD 1428/2003) cuando
 *   el manual oficial no redacte la situación literalmente.
 *
 * Convención visual:
 * - Vista cenital (de pájaro)
 * - Asfalto gris oscuro #3D4451
 * - Líneas blancas según pintura real (continuas / discontinuas)
 * - Coche rojo: #E63946 (color primario de la app, fácilmente identificable)
 * - Coche azul: #2A6BFF
 * - Peatón: círculo blanco con cabeza
 * - Ciclista: rectángulo amarillo + dos ruedas
 * - Flechas de movimiento en blanco para indicar trayectoria
 */

export interface SceneEntry {
  xml: string;
  alt: string;        // accesibilidad
  source: string;     // referencia DGT o RGC que respalda la escena
  legalRef: string;   // Art. RGC
}

// ── Helper colores
const ASPHALT = '#3D4451';
const WHITE = '#FFFFFF';
const CAR_RED = '#E63946';
const CAR_BLUE = '#2A6BFF';
const BICI = '#FFD93D';
const SHOULDER = '#5C6470';     // arcén
const GRASS = '#7FB069';
const PED_SKIN = '#FFE0B2';
const SIGN_RED = '#E41408';

// ── Convención: viewBox 200×200 para todos.

export const TRAFFIC_SCENES: Record<string, SceneEntry> = {

  // ─── 1. INTERSECCIÓN SIN SEÑALIZAR — Regla de la derecha ────────────
  // Cruz simétrica; coche rojo desde la derecha, coche azul desde abajo.
  // El azul debe ceder al rojo (el rojo viene por su derecha).
  interseccion_sin_senales: {
    legalRef: 'Art. 56 RGC',
    source: 'TeoricaAbreviada DGT (Tema 12): "En los cruces sin señales debes ceder el paso a los vehículos que vienen por tu derecha"',
    alt: 'Intersección sin señalizar: el coche rojo viene desde la derecha y el coche azul desde abajo',
    xml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <!-- Suelo neutro -->
  <rect width="200" height="200" fill="${GRASS}"/>
  <!-- Calzada horizontal -->
  <rect x="0" y="75" width="200" height="50" fill="${ASPHALT}"/>
  <!-- Calzada vertical -->
  <rect x="75" y="0" width="50" height="200" fill="${ASPHALT}"/>
  <!-- Linea central horizontal (discontinua, interrumpida en el cruce) -->
  <line x1="0" y1="100" x2="65" y2="100" stroke="${WHITE}" stroke-width="1.5" stroke-dasharray="6,4"/>
  <line x1="135" y1="100" x2="200" y2="100" stroke="${WHITE}" stroke-width="1.5" stroke-dasharray="6,4"/>
  <!-- Linea central vertical (discontinua, interrumpida en el cruce) -->
  <line x1="100" y1="0" x2="100" y2="65" stroke="${WHITE}" stroke-width="1.5" stroke-dasharray="6,4"/>
  <line x1="100" y1="135" x2="100" y2="200" stroke="${WHITE}" stroke-width="1.5" stroke-dasharray="6,4"/>
  <!-- Coche ROJO viene desde la DERECHA, mira hacia la izquierda -->
  <g>
    <rect x="155" y="83" width="32" height="16" rx="3" fill="${CAR_RED}"/>
    <!-- Parabrisas indicando direccion (izquierda) -->
    <rect x="155" y="86" width="6" height="10" rx="1" fill="#FFF9E0" opacity="0.85"/>
    <!-- Faros -->
    <circle cx="155" cy="86" r="1.5" fill="#FFF"/>
    <circle cx="155" cy="96" r="1.5" fill="#FFF"/>
  </g>
  <!-- Coche AZUL viene desde ABAJO, mira hacia arriba -->
  <g>
    <rect x="84" y="140" width="16" height="32" rx="3" fill="${CAR_BLUE}"/>
    <!-- Parabrisas indicando direccion (arriba) -->
    <rect x="87" y="140" width="10" height="6" rx="1" fill="#FFF9E0" opacity="0.85"/>
    <!-- Faros -->
    <circle cx="87" cy="140" r="1.5" fill="#FFF"/>
    <circle cx="97" cy="140" r="1.5" fill="#FFF"/>
  </g>
  <!-- Flechas de trayectoria -->
  <path d="M 150 91 L 137 91 L 140 88 M 137 91 L 140 94" stroke="${WHITE}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <path d="M 91 135 L 91 122 L 88 125 M 91 122 L 94 125" stroke="${WHITE}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
</svg>`,
  },

  // ─── 2. ROTONDA / GLORIETA ──────────────────────────────────────────
  // Glorieta circular. Coche azul dentro, coche rojo afuera intentando
  // entrar. Rojo debe ceder al azul (que ya circula dentro).
  rotonda_simple: {
    legalRef: 'Art. 57 RGC',
    source: 'TeoricaAbreviada DGT (Tema 12): "Los vehículos que ya están dentro de una rotonda antes que los que quieren entrar a la rotonda"',
    alt: 'Rotonda con coche azul circulando dentro y coche rojo entrando',
    xml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${GRASS}"/>
  <!-- Calzada de aproximacion por abajo -->
  <rect x="80" y="120" width="40" height="80" fill="${ASPHALT}"/>
  <line x1="100" y1="200" x2="100" y2="140" stroke="${WHITE}" stroke-width="1.5" stroke-dasharray="6,4"/>
  <!-- Calzada de aproximacion derecha (de salida) -->
  <rect x="120" y="80" width="80" height="40" fill="${ASPHALT}"/>
  <line x1="200" y1="100" x2="140" y2="100" stroke="${WHITE}" stroke-width="1.5" stroke-dasharray="6,4"/>
  <!-- Anillo de la rotonda -->
  <circle cx="100" cy="100" r="55" fill="${ASPHALT}"/>
  <circle cx="100" cy="100" r="22" fill="${GRASS}"/>
  <circle cx="100" cy="100" r="22" fill="none" stroke="${WHITE}" stroke-width="1.5"/>
  <!-- Coche AZUL ya dentro, en la parte superior del anillo, circulando hacia la derecha -->
  <g transform="translate(100 55) rotate(35)">
    <rect x="-8" y="-16" width="16" height="32" rx="3" fill="${CAR_BLUE}"/>
    <rect x="-5" y="-16" width="10" height="6" rx="1" fill="#FFF9E0" opacity="0.85"/>
  </g>
  <!-- Coche ROJO esperando entrar desde abajo -->
  <g>
    <rect x="92" y="135" width="16" height="28" rx="3" fill="${CAR_RED}"/>
    <rect x="95" y="135" width="10" height="6" rx="1" fill="#FFF9E0" opacity="0.85"/>
  </g>
  <!-- Triangulo CEDA EL PASO en suelo (apex hacia abajo) -->
  <polygon points="100,128 96,121 104,121" fill="${WHITE}"/>
  <!-- Flecha curva indicando sentido antihorario de la rotonda (Espana = derecha) -->
  <path d="M 130 65 A 35 35 0 0 1 145 95" stroke="${WHITE}" stroke-width="1.5" fill="none"/>
  <polygon points="145,95 142,88 148,90" fill="${WHITE}"/>
</svg>`,
  },

  // ─── 3. PASO DE PEATONES ───────────────────────────────────────────
  // Calzada con paso cebra; peaton cruzando, coche rojo aproximandose.
  paso_peatones: {
    legalRef: 'Art. 124 RGC',
    source: 'TeoricaAbreviada DGT (Tema 12): "Los peatones tienen preferencia para pasar en los pasos de peatones, en las aceras y en las demás zonas peatonales"',
    alt: 'Coche rojo aproximándose a un paso de peatones con un peatón cruzando',
    xml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${SHOULDER}"/>
  <!-- Calzada vertical (sentido del coche: arriba) -->
  <rect x="50" y="0" width="100" height="200" fill="${ASPHALT}"/>
  <!-- Linea central -->
  <line x1="100" y1="0" x2="100" y2="80" stroke="${WHITE}" stroke-width="1.5" stroke-dasharray="6,4"/>
  <line x1="100" y1="120" x2="100" y2="200" stroke="${WHITE}" stroke-width="1.5" stroke-dasharray="6,4"/>
  <!-- Paso cebra (5 franjas blancas anchas) -->
  <rect x="50"  y="84" width="100" height="6" fill="${WHITE}"/>
  <rect x="50"  y="94" width="100" height="6" fill="${WHITE}"/>
  <rect x="50"  y="104" width="100" height="6" fill="${WHITE}"/>
  <rect x="50"  y="114" width="100" height="6" fill="${WHITE}"/>
  <!-- Coche ROJO debajo del paso, mira hacia arriba -->
  <g>
    <rect x="84" y="140" width="16" height="32" rx="3" fill="${CAR_RED}"/>
    <rect x="87" y="140" width="10" height="6" rx="1" fill="#FFF9E0" opacity="0.85"/>
    <circle cx="87" cy="140" r="1.5" fill="#FFF"/>
    <circle cx="97" cy="140" r="1.5" fill="#FFF"/>
  </g>
  <!-- Peaton cruzando de izquierda a derecha (a la altura del paso) -->
  <g>
    <!-- Cuerpo -->
    <rect x="78" y="100" width="6" height="10" rx="2" fill="#2C3E50"/>
    <!-- Cabeza -->
    <circle cx="81" cy="96" r="3.5" fill="${PED_SKIN}"/>
    <!-- Piernas -->
    <line x1="79" y1="110" x2="78" y2="115" stroke="#2C3E50" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="83" y1="110" x2="85" y2="115" stroke="#2C3E50" stroke-width="1.6" stroke-linecap="round"/>
    <!-- Flecha de direccion -->
    <path d="M 88 102 L 96 102 L 94 100 M 96 102 L 94 104" stroke="${WHITE}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  </g>
</svg>`,
  },

  // ─── 4. STOP en intersección ───────────────────────────────────────
  // Coche rojo aproximandose a un STOP en T-junction. Tiene linea de
  // detencion blanca pintada en el suelo + senial STOP a la derecha.
  stop_interseccion: {
    legalRef: 'Art. 56.3 RGC',
    source: 'TeoricaAbreviada DGT (Tema 8): "El conductor debe parar su vehículo antes de la línea de detención para ceder el paso"',
    alt: 'Coche rojo aproximándose a una intersección con señal STOP',
    xml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${GRASS}"/>
  <!-- Calzada horizontal (via principal) -->
  <rect x="0" y="60" width="200" height="50" fill="${ASPHALT}"/>
  <line x1="0" y1="85" x2="200" y2="85" stroke="${WHITE}" stroke-width="1.5" stroke-dasharray="6,4"/>
  <!-- Calzada vertical (via secundaria, viene desde abajo) -->
  <rect x="75" y="110" width="50" height="90" fill="${ASPHALT}"/>
  <line x1="100" y1="200" x2="100" y2="120" stroke="${WHITE}" stroke-width="1.5" stroke-dasharray="6,4"/>
  <!-- LINEA DE DETENCION blanca gruesa al cruzar a la principal -->
  <rect x="75" y="113" width="50" height="4" fill="${WHITE}"/>
  <!-- Coche ROJO esperando antes del STOP -->
  <g>
    <rect x="84" y="123" width="16" height="32" rx="3" fill="${CAR_RED}"/>
    <rect x="87" y="123" width="10" height="6" rx="1" fill="#FFF9E0" opacity="0.85"/>
    <circle cx="87" cy="123" r="1.5" fill="#FFF"/>
    <circle cx="97" cy="123" r="1.5" fill="#FFF"/>
  </g>
  <!-- Señal STOP octogonal a la derecha de la via secundaria -->
  <g transform="translate(140 120)">
    <polygon points="0,-12 8.5,-8.5 12,0 8.5,8.5 0,12 -8.5,8.5 -12,0 -8.5,-8.5" fill="${SIGN_RED}"/>
    <text x="0" y="3" text-anchor="middle" font-family="Arial,sans-serif" font-size="7" font-weight="bold" fill="${WHITE}">STOP</text>
  </g>
  <!-- Poste de la senal -->
  <rect x="139" y="132" width="2" height="6" fill="#666"/>
</svg>`,
  },

  // ─── 5. ADELANTAMIENTO a CICLISTA (1,5 m separación lateral) ──────────
  // Coche rojo en calzada con ciclista delante. Distancia visible.
  adelantar_ciclista: {
    legalRef: 'Art. 85 RGC',
    source: 'TeoricaAbreviada DGT (Tema 11): "Guardar una separación de, al menos, un metro y medio con el ciclomotor o el ciclo"',
    alt: 'Coche rojo adelantando a un ciclista en carretera de doble sentido',
    xml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${SHOULDER}"/>
  <!-- Calzada vertical (sentido coche: arriba) -->
  <rect x="40" y="0" width="120" height="200" fill="${ASPHALT}"/>
  <!-- Linea central DISCONTINUA (permitido adelantar) -->
  <line x1="100" y1="0" x2="100" y2="200" stroke="${WHITE}" stroke-width="2" stroke-dasharray="10,6"/>
  <!-- Lineas de borde -->
  <line x1="42" y1="0" x2="42" y2="200" stroke="${WHITE}" stroke-width="1.5"/>
  <line x1="158" y1="0" x2="158" y2="200" stroke="${WHITE}" stroke-width="1.5"/>
  <!-- CICLISTA delante (eje del carril derecho) -->
  <g>
    <!-- Sombra/vehiculo -->
    <rect x="73" y="60" width="10" height="20" rx="2" fill="${BICI}"/>
    <!-- Cabeza -->
    <circle cx="78" cy="58" r="3.5" fill="${PED_SKIN}"/>
    <!-- Ruedas -->
    <circle cx="78" cy="65" r="3" fill="none" stroke="#1A1A1A" stroke-width="1"/>
    <circle cx="78" cy="78" r="3" fill="none" stroke="#1A1A1A" stroke-width="1"/>
  </g>
  <!-- Coche ROJO adelantando, INVADIENDO el carril contrario, dejando 1,5 m -->
  <g>
    <rect x="100" y="105" width="22" height="40" rx="4" fill="${CAR_RED}"/>
    <rect x="104" y="106" width="14" height="8" rx="1" fill="#FFF9E0" opacity="0.85"/>
    <circle cx="104" cy="106" r="1.5" fill="#FFF"/>
    <circle cx="118" cy="106" r="1.5" fill="#FFF"/>
  </g>
  <!-- Lineas de cota 1,5 m entre coche y ciclista -->
  <line x1="84" y1="70" x2="99" y2="70" stroke="#FFEB3B" stroke-width="1.4" stroke-dasharray="3,2"/>
  <text x="91" y="64" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" font-weight="bold" fill="#FFEB3B">1,5 m</text>
  <!-- Flecha de movimiento del coche (sube) -->
  <path d="M 111 100 L 111 90 L 108 93 M 111 90 L 114 93" stroke="${WHITE}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
</svg>`,
  },

  // ─── 6. CAMBIO DE CARRIL en autovía ──────────────────────────────
  // Calzada 2 carriles en mismo sentido (autovia). Coche rojo cambiando
  // del derecho al izquierdo. Coche azul ya circulando en el izquierdo
  // (más atrás). El rojo debe asegurarse de no estorbarle.
  cambio_carril: {
    legalRef: 'Arts. 74-76 RGC',
    source: 'TeoricaAbreviada DGT (Tema 11): "Para cambiar de carril hay que tomar las siguientes precauciones: empezar a distancia suficiente del vehículo que va por el otro carril"',
    alt: 'Coche rojo cambiando del carril derecho al izquierdo con coche azul atrás en el carril izquierdo',
    xml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${SHOULDER}"/>
  <!-- Calzada con 2 carriles mismo sentido -->
  <rect x="30" y="0" width="140" height="200" fill="${ASPHALT}"/>
  <!-- Linea central (entre los dos carriles, DISCONTINUA) -->
  <line x1="100" y1="0" x2="100" y2="200" stroke="${WHITE}" stroke-width="1.8" stroke-dasharray="10,6"/>
  <!-- Bordes (CONTINUOS) -->
  <line x1="32" y1="0" x2="32" y2="200" stroke="${WHITE}" stroke-width="1.5"/>
  <line x1="168" y1="0" x2="168" y2="200" stroke="${WHITE}" stroke-width="1.5"/>
  <!-- Coche ROJO cambiando del carril derecho al izquierdo (en transicion) -->
  <g transform="rotate(-20 95 100)">
    <rect x="83" y="80" width="22" height="40" rx="4" fill="${CAR_RED}"/>
    <rect x="87" y="80" width="14" height="8" rx="1" fill="#FFF9E0" opacity="0.85"/>
    <circle cx="87" cy="80" r="1.5" fill="#FFF"/>
    <circle cx="101" cy="80" r="1.5" fill="#FFF"/>
    <!-- Intermitente izquierdo encendido -->
    <circle cx="86" cy="84" r="2.2" fill="#FFC107"/>
  </g>
  <!-- Coche AZUL en carril izquierdo, mas atras -->
  <g>
    <rect x="55" y="140" width="22" height="40" rx="4" fill="${CAR_BLUE}"/>
    <rect x="59" y="140" width="14" height="8" rx="1" fill="#FFF9E0" opacity="0.85"/>
    <circle cx="59" cy="140" r="1.5" fill="#FFF"/>
    <circle cx="73" cy="140" r="1.5" fill="#FFF"/>
  </g>
  <!-- Flecha indicando el cambio del rojo -->
  <path d="M 120 110 Q 100 105 80 90 L 84 89 M 80 90 L 84 94" stroke="${WHITE}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
</svg>`,
  },

  // ─── 7. INCORPORACIÓN a AUTOPISTA / AUTOVÍA (carril de aceleración) ─────
  incorporacion_autopista: {
    legalRef: 'Art. 72 RGC',
    source: 'TeoricaAbreviada DGT (Tema 12): "Cuando tengas que ceder el paso a otro vehículo mientras estás en el carril de aceleración para entrar a una carretera, detente al principio del carril hasta que el vehículo que ya está dentro de la carretera pase de largo"',
    alt: 'Carril de aceleración de autovía con coche rojo incorporándose y coche azul circulando por el carril derecho',
    xml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${SHOULDER}"/>
  <rect x="45" y="0" width="100" height="200" fill="${ASPHALT}"/>
  <line x1="95" y1="0" x2="95" y2="200" stroke="${WHITE}" stroke-width="1.8" stroke-dasharray="10,6"/>
  <line x1="47" y1="0" x2="47" y2="200" stroke="${WHITE}" stroke-width="1.5"/>
  <line x1="143" y1="0" x2="143" y2="105" stroke="${WHITE}" stroke-width="1.5"/>
  <path d="M 170 200 L 118 118 Q 110 105 143 105 L 143 200 Z" fill="${ASPHALT}"/>
  <path d="M 170 200 L 118 118 Q 110 105 143 105" stroke="${WHITE}" stroke-width="1.5" fill="none" stroke-dasharray="8,5"/>
  <g>
    <rect x="110" y="55" width="20" height="38" rx="4" fill="${CAR_BLUE}"/>
    <rect x="114" y="55" width="12" height="7" rx="1" fill="#FFF9E0" opacity="0.85"/>
  </g>
  <g transform="rotate(-28 146 150)">
    <rect x="136" y="130" width="20" height="38" rx="4" fill="${CAR_RED}"/>
    <rect x="140" y="130" width="12" height="7" rx="1" fill="#FFF9E0" opacity="0.85"/>
    <circle cx="139" cy="134" r="2.2" fill="#FFC107"/>
  </g>
  <path d="M 150 132 Q 135 112 120 98 L 124 98 M 120 98 L 123 102" stroke="${WHITE}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
</svg>`,
  },

  // ─── 8. AUTOBÚS urbano saliendo de parada ──────────────────────────
  // Manual DGT Lectura Fácil no redacta esta situación literalmente.
  // Respaldado por el articulado oficial del RGC (BOE, RD 1428/2003, art. 73).
  bus_parada_urbana: {
    legalRef: 'Art. 73 RGC',
    source: 'Reglamento General de Circulación (RD 1428/2003), art. 73: en poblado, los conductores deben facilitar al transporte colectivo señalizado la salida de la parada, reduciendo la velocidad o deteniéndose si fuera preciso',
    alt: 'Autobús urbano saliendo de una parada señalizada con coche rojo aproximándose por detrás',
    xml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#B8C0C8"/>
  <rect x="40" y="0" width="110" height="200" fill="${ASPHALT}"/>
  <line x1="95" y1="0" x2="95" y2="200" stroke="${WHITE}" stroke-width="1.5" stroke-dasharray="8,5"/>
  <rect x="150" y="0" width="50" height="200" fill="#D8DDE3"/>
  <rect x="154" y="45" width="38" height="18" rx="2" fill="#2A6BFF"/>
  <text x="173" y="58" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" font-weight="bold" fill="${WHITE}">BUS</text>
  <g>
    <rect x="112" y="70" width="28" height="58" rx="5" fill="#F4C430"/>
    <rect x="117" y="76" width="18" height="8" rx="1" fill="#DFF3FF"/>
    <rect x="117" y="90" width="18" height="8" rx="1" fill="#DFF3FF"/>
    <rect x="117" y="104" width="18" height="8" rx="1" fill="#DFF3FF"/>
    <circle cx="112" cy="82" r="2.4" fill="#FFC107"/>
  </g>
  <g>
    <rect x="112" y="145" width="22" height="38" rx="4" fill="${CAR_RED}"/>
    <rect x="116" y="145" width="14" height="7" rx="1" fill="#FFF9E0" opacity="0.85"/>
  </g>
  <path d="M 126 135 Q 105 124 85 116 L 89 115 M 85 116 L 88 120" stroke="${WHITE}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
</svg>`,
  },

  // ─── 9. PASO PARA CICLISTAS señalizado ─────────────────────────────
  // Manual DGT Lectura Fácil no redacta esta situación literalmente.
  // Respaldado por el articulado oficial del RGC (BOE, RD 1428/2003, art. 64).
  paso_ciclistas: {
    legalRef: 'Art. 64 RGC',
    source: 'Reglamento General de Circulación (RD 1428/2003), art. 64: los ciclistas tienen prioridad cuando circulen por un paso para ciclistas debidamente señalizado',
    alt: 'Ciclista cruzando por un paso para ciclistas señalizado delante de un coche rojo',
    xml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${SHOULDER}"/>
  <rect x="50" y="0" width="100" height="200" fill="${ASPHALT}"/>
  <line x1="100" y1="0" x2="100" y2="78" stroke="${WHITE}" stroke-width="1.5" stroke-dasharray="6,4"/>
  <line x1="100" y1="122" x2="100" y2="200" stroke="${WHITE}" stroke-width="1.5" stroke-dasharray="6,4"/>
  <g stroke="${WHITE}" stroke-width="3" stroke-linecap="square">
    <line x1="55" y1="86" x2="65" y2="86"/><line x1="75" y1="86" x2="85" y2="86"/><line x1="95" y1="86" x2="105" y2="86"/><line x1="115" y1="86" x2="125" y2="86"/><line x1="135" y1="86" x2="145" y2="86"/>
    <line x1="55" y1="114" x2="65" y2="114"/><line x1="75" y1="114" x2="85" y2="114"/><line x1="95" y1="114" x2="105" y2="114"/><line x1="115" y1="114" x2="125" y2="114"/><line x1="135" y1="114" x2="145" y2="114"/>
  </g>
  <g transform="translate(83 94) rotate(90)">
    <rect x="-5" y="-10" width="10" height="20" rx="2" fill="${BICI}"/>
    <circle cx="0" cy="-13" r="3.3" fill="${PED_SKIN}"/>
    <circle cx="0" cy="-7" r="3" fill="none" stroke="#1A1A1A" stroke-width="1"/>
    <circle cx="0" cy="8" r="3" fill="none" stroke="#1A1A1A" stroke-width="1"/>
  </g>
  <g>
    <rect x="84" y="140" width="22" height="38" rx="4" fill="${CAR_RED}"/>
    <rect x="88" y="140" width="14" height="7" rx="1" fill="#FFF9E0" opacity="0.85"/>
  </g>
  <path d="M 111 98 L 125 98 L 122 95 M 125 98 L 122 101" stroke="${WHITE}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
</svg>`,
  },

  // ─── 10. FINAL DE ATASCO en AUTOPISTA ──────────────────────────────
  final_atasco_autopista: {
    legalRef: 'Art. 109 RGC',
    source: 'TeoricaAbreviada DGT (Tema 11): "En autopistas, autovías y lugares cerrados o que no se ve bien, debes encender las luces de emergencia y posición siempre que tengas que detener el vehículo"',
    alt: 'Coche rojo llegando al final de un atasco en autovía con luces de emergencia encendidas',
    xml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${SHOULDER}"/>
  <rect x="35" y="0" width="130" height="200" fill="${ASPHALT}"/>
  <line x1="100" y1="0" x2="100" y2="200" stroke="${WHITE}" stroke-width="1.8" stroke-dasharray="10,6"/>
  <line x1="37" y1="0" x2="37" y2="200" stroke="${WHITE}" stroke-width="1.5"/>
  <line x1="163" y1="0" x2="163" y2="200" stroke="${WHITE}" stroke-width="1.5"/>
  <rect x="58" y="34" width="22" height="36" rx="4" fill="${CAR_BLUE}"/>
  <rect x="120" y="42" width="22" height="36" rx="4" fill="#6C757D"/>
  <rect x="58" y="84" width="22" height="36" rx="4" fill="#6C757D"/>
  <g>
    <rect x="120" y="142" width="22" height="38" rx="4" fill="${CAR_RED}"/>
    <rect x="124" y="142" width="14" height="7" rx="1" fill="#FFF9E0" opacity="0.85"/>
    <circle cx="121" cy="148" r="2.2" fill="#FFC107"/>
    <circle cx="141" cy="148" r="2.2" fill="#FFC107"/>
  </g>
  <text x="132" y="134" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="bold" fill="#FFC107">!</text>
  <path d="M 131 138 L 131 125" stroke="#FFC107" stroke-width="1.4" stroke-dasharray="3,2"/>
</svg>`,
  },

  // ─── 11. MARCHA ATRÁS hacia garaje cercano ─────────────────────────
  marcha_atras_garaje: {
    legalRef: 'Art. 80 RGC',
    source: 'TeoricaAbreviada DGT (Tema 11): "Está prohibido circular marcha atrás en cualquier vía o camino. Solo se puede circular marcha atrás en los siguientes casos: ■ Al hacer maniobras para aparcar el vehículo. […] En estos dos casos no se podrá circular hacia atrás más de 15 metros ni entrar en un cruce de caminos o vías marcha atrás"',
    alt: 'Coche rojo retrocediendo pocos metros para entrar en un garaje señalizado',
    xml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#B8C0C8"/>
  <rect x="35" y="0" width="100" height="200" fill="${ASPHALT}"/>
  <line x1="85" y1="0" x2="85" y2="200" stroke="${WHITE}" stroke-width="1.5" stroke-dasharray="8,5"/>
  <rect x="135" y="0" width="65" height="200" fill="#D8DDE3"/>
  <rect x="142" y="58" width="48" height="34" rx="2" fill="#5C6470"/>
  <text x="166" y="78" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="${WHITE}">GARAJE</text>
  <g transform="rotate(88 105 112)">
    <rect x="94" y="92" width="22" height="40" rx="4" fill="${CAR_RED}"/>
    <rect x="98" y="92" width="14" height="8" rx="1" fill="#FFF9E0" opacity="0.85"/>
  </g>
  <path d="M 125 112 Q 145 105 152 88 L 148 90 M 152 88 L 153 93" stroke="${WHITE}" stroke-width="1.4" fill="none" stroke-dasharray="4,3" stroke-linecap="round"/>
  <text x="126" y="130" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" fill="${WHITE}">marcha atrás corta</text>
</svg>`,
  },

  // ─── 12. SALIDA DE ESTACIONAMIENTO EN LÍNEA ────────────────────────
  // Manual DGT Lectura Fácil no redacta esta situación literalmente.
  // Respaldado por el articulado oficial del RGC (BOE, RD 1428/2003, art. 72).
  salida_estacionamiento: {
    legalRef: 'Arts. 72 y 109 RGC',
    source: 'Reglamento General de Circulación (RD 1428/2003), art. 72: al incorporarse a la circulación desde un estacionamiento se debe ceder el paso a los demás usuarios de la vía y advertir la maniobra mediante señales ópticas',
    alt: 'Coche rojo saliendo de un estacionamiento en línea mientras un coche azul circula por la vía',
    xml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#B8C0C8"/>
  <rect x="45" y="0" width="110" height="200" fill="${ASPHALT}"/>
  <line x1="100" y1="0" x2="100" y2="200" stroke="${WHITE}" stroke-width="1.5" stroke-dasharray="8,5"/>
  <rect x="155" y="0" width="35" height="200" fill="#66717E"/>
  <line x1="155" y1="0" x2="155" y2="200" stroke="${WHITE}" stroke-width="1.5"/>
  <line x1="155" y1="54" x2="190" y2="54" stroke="${WHITE}" stroke-width="1.2"/>
  <line x1="155" y1="104" x2="190" y2="104" stroke="${WHITE}" stroke-width="1.2"/>
  <line x1="155" y1="154" x2="190" y2="154" stroke="${WHITE}" stroke-width="1.2"/>
  <rect x="161" y="10" width="22" height="34" rx="4" fill="#6C757D"/>
  <rect x="161" y="160" width="22" height="34" rx="4" fill="#6C757D"/>
  <g transform="rotate(-18 155 112)">
    <rect x="144" y="93" width="22" height="38" rx="4" fill="${CAR_RED}"/>
    <rect x="148" y="93" width="14" height="7" rx="1" fill="#FFF9E0" opacity="0.85"/>
    <circle cx="145" cy="99" r="2.2" fill="#FFC107"/>
  </g>
  <g>
    <rect x="72" y="128" width="22" height="38" rx="4" fill="${CAR_BLUE}"/>
    <rect x="76" y="128" width="14" height="7" rx="1" fill="#FFF9E0" opacity="0.85"/>
  </g>
  <path d="M 143 117 Q 122 121 105 129 L 109 125 M 105 129 L 110 131" stroke="${WHITE}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
</svg>`,
  },
};
