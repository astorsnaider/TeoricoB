/**
 * Manual del Conductor — TeoricoB
 *
 * Contenido basado en:
 * - "Manual del conductor" (DGT, edición vigente) — dgt.es/conoce-la-dgt/publicaciones/
 * - Reglamento General de Circulación (RD 1428/2003)
 * - Ley sobre Tráfico, Circulación de Vehículos a Motor y Seguridad Vial (RDL 6/2015)
 * - Reglamento General de Conductores (RD 818/2009)
 *
 * Resumen de elaboración propia. No es reproducción literal de los documentos oficiales.
 * Para acceder al manual oficial completo: https://www.dgt.es
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Linking, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../theme';
import {
  SignStop, SignCedaElPaso, SignVelocidadMaxima, SignProhibidoAdelantar,
  SignPasoPeatones, SignAutopista, SignSemaforoRojo, SignSemaforoAmbar,
  SignSemaforoVerde, MarkLineaContinua, MarkLineaDiscontinua,
  SignPasoNivelSinBarreras, SignEntradaProhibida, SignSentidoObligatorio,
  SignPeligroGenerico, SignObras, SignNinos, SignVientoLateral,
  SignFinLimitaciones, SignAutovia, SignPrioridadSentidoContrario,
} from '../components/TrafficSign';
import Svg from 'react-native-svg';

// ─── TIPOS ──────────────────────────────────────────────────────

interface ManualChapter {
  id: string;
  title: string;
  emoji: string;
  summary: string;
  legalRef: string;
  sections: ManualSection[];
}

interface ManualSection {
  subtitle: string;
  content: string[];
  tip?: string;
  warning?: string;
  signs?: React.ReactElement[];
}

// ─── CONTENIDO DEL MANUAL ───────────────────────────────────────

const CHAPTERS: ManualChapter[] = [
  {
    id: 'senales_peligro',
    title: 'Señales de Peligro',
    emoji: '⚠️',
    summary: 'Señales triangulares que advierten de riesgos próximos.',
    legalRef: 'Art. 132–140 RGC · Anexo I RGC',
    sections: [
      {
        subtitle: '¿Qué son?',
        content: [
          'Las señales de peligro son triangulares, con vértice hacia arriba, fondo blanco y borde rojo.',
          'Advierten de la existencia próxima de un peligro en la vía que el conductor debe conocer.',
          'En carretera se colocan entre 150 y 250 m antes del peligro. En ciudad, entre 50 y 100 m.',
        ],
        tip: 'Al ver una señal de peligro, reduce la velocidad y aumenta la atención aunque no veas el riesgo todavía.',
        signs: [
          <Svg width={70} height={70} viewBox="0 0 100 100" key="peligro"><SignPeligroGenerico /></Svg>,
          <Svg width={70} height={70} viewBox="0 0 100 100" key="peatones"><SignPasoPeatones /></Svg>,
          <Svg width={70} height={70} viewBox="0 0 100 100" key="obras"><SignObras /></Svg>,
          <Svg width={70} height={70} viewBox="0 0 100 100" key="ninos"><SignNinos /></Svg>,
        ],
      },
      {
        subtitle: 'Señales más importantes',
        content: [
          '🔺 Peligro genérico (!): indica un peligro no especificado por otra señal.',
          '🔺 Paso de peatones: posible presencia de peatones cruzando.',
          '🔺 Niños: zona escolar o parque infantil próximo.',
          '🔺 Obras: trabajos en la calzada o sus proximidades.',
          '🔺 Viento lateral: rachas de viento que pueden desestabilizar vehículos.',
          '🔺 Pavimento deslizante: calzada con baja adherencia.',
          '🔺 Paso a nivel sin barreras: cruzamiento ferroviario sin protección automática.',
          '🔺 Semáforos: intersección regulada por semáforos más adelante.',
        ],
        warning: 'El paso a nivel sin barreras es especialmente peligroso. SIEMPRE para, mira y escucha antes de cruzar.',
      },
    ],
  },
  {
    id: 'senales_reglamentacion',
    title: 'Señales de Reglamentación',
    emoji: '🚫',
    summary: 'Prohibiciones, restricciones y obligaciones que el conductor debe respetar.',
    legalRef: 'Art. 141–155 RGC · Anexo I RGC',
    sections: [
      {
        subtitle: 'Señales de prohibición y restricción',
        content: [
          'Son circulares con fondo blanco y borde rojo. Prohíben o restringen una acción.',
          'Su cumplimiento es obligatorio para todos los conductores.',
          'Entran en vigor en el punto donde están colocadas, salvo indicación en contrario.',
        ],
        signs: [
          <Svg width={70} height={70} viewBox="0 0 100 100" key="vm50"><SignVelocidadMaxima limit={50} /></Svg>,
          <Svg width={70} height={70} viewBox="0 0 100 100" key="noadelant"><SignProhibidoAdelantar /></Svg>,
          <Svg width={70} height={70} viewBox="0 0 100 100" key="entrada"><SignEntradaProhibida /></Svg>,
          <Svg width={70} height={70} viewBox="0 0 100 100" key="fin"><SignFinLimitaciones /></Svg>,
        ],
        tip: 'La señal de "fin de limitaciones" (círculo con rayas diagonales) cancela todas las restricciones anteriores, excepto la de no adelantar.',
      },
      {
        subtitle: 'Señales de prioridad',
        content: [
          'STOP (octogonal roja): detención obligatoria y completa, aunque no haya tráfico.',
          'Ceda el Paso (triángulo invertido): ceder el paso; no es obligatorio parar si no hay tráfico.',
          'Prioridad en sentido contrario: ceder el paso a los vehículos que circulan en sentido contrario.',
        ],
        signs: [
          <Svg width={70} height={70} viewBox="0 0 100 100" key="stop"><SignStop /></Svg>,
          <Svg width={70} height={70} viewBox="0 0 100 100" key="ceda"><SignCedaElPaso /></Svg>,
          <Svg width={70} height={70} viewBox="0 0 100 100" key="prior"><SignPrioridadSentidoContrario /></Svg>,
        ],
        warning: 'Con la señal STOP SIEMPRE debes detener completamente el vehículo, aunque tengas perfecta visibilidad y no venga nadie.',
      },
      {
        subtitle: 'Señales de obligación',
        content: [
          'Son circulares con fondo azul. Imponen una obligación al conductor.',
          'Dirección obligatoria: debes circular en la dirección indicada por la flecha.',
          'Velocidad mínima obligatoria: no puedes circular por debajo de esa velocidad.',
          'Uso de cadenas: obligatorio llevar cadenas montadas o disponibles.',
        ],
        signs: [
          <Svg width={70} height={70} viewBox="0 0 100 100" key="recto"><SignSentidoObligatorio direction="straight" /></Svg>,
          <Svg width={70} height={70} viewBox="0 0 100 100" key="derecha"><SignSentidoObligatorio direction="right" /></Svg>,
        ],
      },
    ],
  },
  {
    id: 'semaforos',
    title: 'Semáforos',
    emoji: '🚦',
    summary: 'Señales luminosas que regulan la circulación en intersecciones.',
    legalRef: 'Art. 156–159 RGC',
    sections: [
      {
        subtitle: 'Significado de cada luz',
        content: [
          '🔴 Rojo: parada obligatoria antes de la línea de stop. No puedes cruzar.',
          '🟡 Ámbar: precaución. Debes detenerte a menos que estés tan cerca que frenar sea peligroso.',
          '🟢 Verde: puedes avanzar, respetando siempre a peatones que ya estén cruzando.',
        ],
        signs: [
          <Svg width={70} height={100} viewBox="0 0 100 100" key="rojo"><SignSemaforoRojo /></Svg>,
          <Svg width={70} height={100} viewBox="0 0 100 100" key="ambar"><SignSemaforoAmbar /></Svg>,
          <Svg width={70} height={100} viewBox="0 0 100 100" key="verde"><SignSemaforoVerde /></Svg>,
        ],
        warning: 'La luz ámbar NO significa "acelera para pasar". Si puedes frenar con seguridad, debes hacerlo.',
      },
      {
        subtitle: 'Semáforos apagados o averiados',
        content: [
          'Si el semáforo está apagado o averiado, se aplica la regla general de prioridad: ceder el paso al vehículo de la derecha.',
          'Actúa como si fuera una intersección no señalizada.',
        ],
        tip: 'En caso de semáforo averiado, reduce la velocidad, cruza con precaución y cede el paso a la derecha.',
      },
      {
        subtitle: 'Semáforos especiales',
        content: [
          'Flecha verde: solo puedes circular en la dirección de la flecha, aunque el resto del semáforo esté en rojo.',
          'Luz roja intermitente: señal de paso a nivel o apertura de puente. Para y no cruces.',
          'Luz verde intermitente: el semáforo va a pasar a ámbar en breve. Prepárate para detenerte.',
        ],
      },
    ],
  },
  {
    id: 'marcas_viales',
    title: 'Marcas Viales',
    emoji: '🛣️',
    summary: 'Líneas, flechas y símbolos pintados en el asfalto.',
    legalRef: 'Art. 162–168 RGC · Anexo II RGC',
    sections: [
      {
        subtitle: 'Líneas longitudinales',
        content: [
          'Línea continua: PROHIBIDO cruzarla o circular sobre ella. Separa sentidos de circulación.',
          'Línea discontinua: PUEDES cruzarla para adelantar u otras maniobras, si es seguro.',
          'Doble línea continua: prohibido para ambos sentidos.',
          'Línea continua + discontinua: el conductor junto a la continua NO puede cruzar; junto a la discontinua, sí puede.',
        ],
        signs: [
          <Svg width={70} height={70} viewBox="0 0 100 100" key="cont"><MarkLineaContinua /></Svg>,
          <Svg width={70} height={70} viewBox="0 0 100 100" key="disc"><MarkLineaDiscontinua /></Svg>,
        ],
        warning: 'Circular sobre la línea continua o cruzarla está sancionado con pérdida de 4 puntos.',
      },
      {
        subtitle: 'Marcas transversales',
        content: [
          'Línea de stop: detención obligatoria en ese punto exacto.',
          'Línea de ceda el paso (líneas discontinuas): ceder el paso sin parar necesariamente.',
          'Paso de peatones (zebra): prioridad de los peatones cuando cruzan.',
          'Paso para ciclistas: prioridad de los ciclistas en ese paso.',
        ],
      },
      {
        subtitle: 'Flechas y otros símbolos',
        content: [
          'Flechas en el carril: indican la dirección obligatoria o permitida desde ese carril.',
          'Símbolo de ceda el paso en el suelo: refuerza la señal vertical.',
          'Marcas amarillas: son provisionales (obras) y PREVALECEN sobre las blancas permanentes.',
          'Zigzag amarillo: prohibido detenerse en esa zona (paradas de autobús o similares).',
        ],
        tip: 'Si ves marcas amarillas, ignora las blancas que pueda haber debajo. Lo amarillo siempre manda en obras.',
      },
    ],
  },
  {
    id: 'velocidad',
    title: 'La Velocidad',
    emoji: '⚡',
    summary: 'Límites, adaptación y consecuencias del exceso de velocidad.',
    legalRef: 'Art. 48–54 LSV · Art. 44–53 RGC',
    sections: [
      {
        subtitle: 'Límites genéricos de velocidad',
        content: [
          '🛣️ Autopistas y autovías: 120 km/h (mínimo 60 km/h)',
          '🛣️ Carreteras convencionales: 90 km/h (70 si no hay arcén practicable)',
          '🏙️ Vías urbanas (2+ carriles por sentido): 50 km/h',
          '🏙️ Calles urbanas de 1 carril por sentido: 30 km/h ← DESDE MAYO 2021',
          '🏙️ Zonas de coexistencia (zona 20): 20 km/h',
        ],
        signs: [
          <Svg width={70} height={70} viewBox="0 0 100 100" key="120"><SignVelocidadMaxima limit={120} /></Svg>,
          <Svg width={70} height={70} viewBox="0 0 100 100" key="90"><SignVelocidadMaxima limit={90} /></Svg>,
          <Svg width={70} height={70} viewBox="0 0 100 100" key="50"><SignVelocidadMaxima limit={50} /></Svg>,
          <Svg width={70} height={70} viewBox="0 0 100 100" key="30"><SignVelocidadMaxima limit={30} /></Svg>,
        ],
        warning: 'Muchos conductores no conocen el cambio de 2021: en calles urbanas de un carril por sentido el límite es 30, no 50.',
      },
      {
        subtitle: 'Límites especiales',
        content: [
          'Vehículos con remolque >750 kg: 80 km/h en autopista, 70 en carretera.',
          'Camiones >3.500 kg MMA: 90 km/h en autopista, 80 en carretera.',
          'Autobuses: 100 km/h en autopista, 90 en carretera.',
          'Conductores noveles (2 primeros años): 100 km/h en autopista.',
        ],
      },
      {
        subtitle: 'Principio de velocidad adecuada',
        content: [
          'El límite legal es el MÁXIMO, no la velocidad que siempre debes llevar.',
          'Debes adaptar la velocidad a las condiciones de la vía, el tráfico, el tiempo y el vehículo.',
          'Con lluvia, niebla, hielo o mala visibilidad, debes reducir aunque no superes el límite.',
          'La distancia de frenado aumenta con el CUADRADO de la velocidad: al doblarla, necesitas 4 veces más distancia.',
        ],
        tip: 'Regla práctica: a 90 km/h necesitas ~45 m para frenar en seco. Con lluvia, multiplica por 2. Con hielo, por 10.',
      },
    ],
  },
  {
    id: 'prioridad',
    title: 'Prioridad de Paso',
    emoji: '🔄',
    summary: 'Quién tiene preferencia en cada situación vial.',
    legalRef: 'Art. 57–65 RGC',
    sections: [
      {
        subtitle: 'Orden de prioridad',
        content: [
          '1.º Agente de tráfico en funciones de regulación',
          '2.º Semáforos',
          '3.º Señales verticales (STOP, Ceda el Paso…)',
          '4.º Marcas viales',
          '5.º Normas generales de circulación (regla de la derecha)',
        ],
        warning: 'Si un agente te indica algo que contradice un semáforo, obedece al agente. Siempre.',
      },
      {
        subtitle: 'Regla general: la derecha',
        content: [
          'En intersecciones sin señalizar, debes ceder el paso al vehículo que viene por tu derecha.',
          'Esta regla se aplica cuando no hay señales, semáforos ni indicaciones de agentes.',
          'En vías principales, los vehículos que circulan por la principal tienen preferencia sobre los de la secundaria.',
        ],
      },
      {
        subtitle: 'Rotondas',
        content: [
          'Los vehículos que ya circulan DENTRO de la rotonda tienen prioridad.',
          'Los que quieren entrar deben ceder el paso a los que ya están dentro.',
          'Al salir de la rotonda, usa el carril más a la derecha y señaliza.',
        ],
        tip: 'Recuerda: en la rotonda, quien está dentro manda. Quien entra espera.',
      },
      {
        subtitle: 'Vehículos de emergencia',
        content: [
          'Los vehículos de emergencia con señales acústicas y luminosas tienen prioridad absoluta.',
          'Debes apartarte en cuanto puedas, incluso si debes subir al arcén o detener tu vehículo.',
          'No los sigas a menos de 50 metros ni te aproveches del espacio que abren.',
        ],
        warning: 'Obstruir el paso a un vehículo de emergencia en servicio urgente es una infracción muy grave.',
      },
    ],
  },
  {
    id: 'adelantamiento',
    title: 'Adelantamiento',
    emoji: '🏎️',
    summary: 'Cuándo y cómo adelantar con seguridad.',
    legalRef: 'Art. 82–90 RGC',
    sections: [
      {
        subtitle: 'Procedimiento correcto',
        content: [
          '1. Asegúrate de que puedes adelantar (señalización, visibilidad, espacio).',
          '2. Señaliza con el intermitente IZQUIERDO.',
          '3. Comprueba que no hay vehículos adelantando detrás de ti.',
          '4. Ocupa el carril contrario, aumenta la velocidad y pasa.',
          '5. Señaliza con el intermitente DERECHO y regresa al carril derecho.',
          '6. Deja suficiente espacio antes de regresar (especialmente con ciclistas: 1,5 m mínimo).',
        ],
      },
      {
        subtitle: 'Cuando está PROHIBIDO adelantar',
        content: [
          '❌ En curvas o cambios de rasante sin visibilidad suficiente.',
          '❌ En pasos a nivel.',
          '❌ En intersecciones (salvo adelantar a ciclistas en carril bici).',
          '❌ Cuando hay señal de prohibición de adelantamiento.',
          '❌ En pasos para peatones.',
          '❌ En túneles con carril único.',
          '❌ Cuando el vehículo de delante está parado o señaliza giro a la izquierda.',
        ],
        signs: [
          <Svg width={70} height={70} viewBox="0 0 100 100" key="noadelant"><SignProhibidoAdelantar /></Svg>,
        ],
        warning: 'Adelantar en curva sin visibilidad es la causa de muchos accidentes mortales. Si no estás seguro, no adelantes.',
      },
      {
        subtitle: 'Distancia lateral mínima',
        content: [
          'Al adelantar a un ciclista, debes dejar AL MENOS 1,5 metros de separación lateral.',
          'Puedes invadir el carril contrario para garantizar esta distancia, si la visibilidad lo permite.',
          'Con condiciones adversas (lluvia, viento), extrema las precauciones.',
        ],
        tip: 'Si no puedes dejar 1,5 m de separación a un ciclista, no adelantes. Espera a que haya espacio suficiente.',
      },
    ],
  },
  {
    id: 'alcohol_drogas',
    title: 'Alcohol, Drogas y Medicamentos',
    emoji: '🍺',
    summary: 'Efectos, límites legales y consecuencias.',
    legalRef: 'Art. 20–22 RGC · RD 1217/2009 · Ley 17/2005',
    sections: [
      {
        subtitle: 'Tasas legales de alcohol',
        content: [
          '👤 Conductores en general: 0,5 g/l en sangre · 0,25 mg/l en aire espirado',
          '🆕 Conductores noveles (<2 años): 0,3 g/l en sangre · 0,15 mg/l en aire',
          '🚛 Conductores profesionales: 0,3 g/l en sangre · 0,15 mg/l en aire',
          '⚠️ Por encima de 1,2 g/l en sangre es delito penal (no solo infracción administrativa).',
        ],
        warning: 'La negativa a realizar la prueba de alcoholemia es en sí misma una infracción muy grave, equivalente a superar 1,2 g/l.',
      },
      {
        subtitle: 'Efectos del alcohol en la conducción',
        content: [
          'Aumenta el tiempo de reacción (con 0,5 g/l puede aumentar más del 30%).',
          'Reduce la capacidad de concentración y atención.',
          'Distorsiona la percepción de distancias, velocidades y riesgos.',
          'Genera exceso de confianza y propensión a asumir riesgos.',
          'Afecta desde el primer trago. No existe una cantidad "segura".',
          'El café, el agua fría o el ejercicio NO eliminan el alcohol. Solo el tiempo.',
        ],
        tip: 'El organismo elimina el alcohol a ~0,10-0,15 g/l por hora. Si bebiste hasta medianoche, puedes seguir por encima del límite a primera hora de la mañana.',
      },
      {
        subtitle: 'Drogas y medicamentos',
        content: [
          'Conducir bajo los efectos de cualquier droga (legal o ilegal) está prohibido.',
          'Los medicamentos que afecten a la conducción también están prohibidos al volante.',
          'El cannabis puede detectarse en sangre hasta 30 días en consumidores habituales.',
          'El control de drogas se realiza mediante prueba de saliva en carretera.',
          'Si tomas medicamentos, consulta el prospecto: el símbolo de un triángulo amarillo indica que pueden afectar a la conducción.',
        ],
        warning: 'Conducir bajo los efectos de drogas o medicamentos es una infracción MUY GRAVE con pérdida de 6 puntos y posible detención.',
      },
    ],
  },
  {
    id: 'accidentes',
    title: 'Accidentes y Primeros Auxilios',
    emoji: '🚑',
    summary: 'Cómo actuar ante un accidente de tráfico.',
    legalRef: 'Art. 129–131 LSV · Protocolo PAS (Cruz Roja Española)',
    sections: [
      {
        subtitle: 'Protocolo PAS',
        content: [
          '🅿️ PROTEGER: Señalizar el accidente. Aparcar el vehículo en lugar seguro. Ponerse el chaleco reflectante ANTES de salir. Colocar los triángulos (o activar el V-16 desde el interior).',
          '🅰️ AVISAR: Llamar al 112 (gratuito, 24h). Dar la ubicación exacta, número de heridos y si hay atrapados.',
          '🆂 SOCORRER: Atender a los heridos SIN moverlos, salvo peligro de incendio, explosión o ahogamiento.',
        ],
        warning: 'No mueves a un herido por el riesgo de agravar una posible lesión medular, salvo que haya peligro inmediato de muerte.',
      },
      {
        subtitle: 'Técnicas básicas de socorro',
        content: [
          '💓 Parada cardiorrespiratoria: RCP = 30 compresiones cardíacas + 2 respiraciones boca a boca. Ritmo: 100-120 compresiones por minuto. Profundidad: 5-6 cm.',
          '🫀 Posición Lateral de Seguridad (PLS): para inconscientes que respiran. De lado para evitar atragantamiento. No usar si hay sospecha de lesión cervical.',
          '🩸 Hemorragia: presión directa y continua sobre la herida con un paño limpio. El torniquete solo como último recurso.',
        ],
      },
      {
        subtitle: 'Qué NO debes hacer',
        content: [
          '❌ No mover a los heridos salvo peligro inmediato.',
          '❌ No quitar el casco a un motorista inconsciente (riesgo de lesión cervical).',
          '❌ No dar de comer ni beber a un herido (puede necesitar anestesia).',
          '❌ No abandonar el lugar de un accidente si has participado en él (es delito).',
          '❌ No obstruir el acceso a los servicios de emergencia.',
        ],
        tip: 'El número 112 funciona aunque no tengas saldo en el móvil y aunque estés fuera de cobertura (redirige a otra antena).',
      },
    ],
  },
  {
    id: 'infracciones',
    title: 'Infracciones y Sanciones',
    emoji: '📋',
    summary: 'Sistema de permiso por puntos, multas y sanciones.',
    legalRef: 'Ley 17/2005 · RDL 6/2015 (LSV) · Cuadro de sanciones DGT',
    sections: [
      {
        subtitle: 'Sistema de permiso por puntos',
        content: [
          'Todos los conductores comienzan con 12 puntos (noveles: 8 puntos los 2 primeros años).',
          'Las infracciones graves y muy graves restan puntos según su gravedad.',
          'Si pierdes todos los puntos, el permiso queda revocado.',
          'Para recuperarlo: esperar 2 años (3 si es reincidente), curso de sensibilización y examen.',
          'Puedes recuperar hasta 2 puntos (máximo 15 en total) con cursos voluntarios.',
        ],
      },
      {
        subtitle: 'Infracciones y puntos perdidos',
        content: [
          '🔴 6 puntos: conducir bajo efectos de alcohol/drogas, saltarse semáforo en rojo, velocidad >60 km/h sobre el límite, móvil con la mano, no respetar paso de peatones.',
          '🟠 4 puntos: no cinturón o casco, velocidad >40 km/h sobre el límite, adelantamiento peligroso.',
          '🟡 3 puntos: no cinturón (pasajeros), velocidad entre 21-40 km/h sobre el límite.',
          '🟢 2 puntos: circular por el arcén, no señalizar cambio de dirección.',
        ],
        warning: 'Saltarse un semáforo en rojo cuesta 6 puntos y 200€. Con los puntos, no merece la pena arriesgarse.',
      },
      {
        subtitle: 'Pago de multas',
        content: [
          'Si pagas en los 20 días hábiles siguientes, obtienes un 50% de descuento.',
          'Al pagar con descuento, renuncias a recurrir la sanción.',
          'Puedes recurrir la multa en el plazo legal si crees que es injusta.',
        ],
        tip: 'La reducción del 50% no aplica a las infracciones más graves (alcohol, drogas, exceso de velocidad superior al límite+50%).',
      },
    ],
  },
  {
    id: 'vehiculo_mantenimiento',
    title: 'El Vehículo',
    emoji: '🔧',
    summary: 'Documentación obligatoria, ITV y mantenimiento básico.',
    legalRef: 'RD 818/2009 · RD 920/2017 (ITV) · Art. 1–5 RGC',
    sections: [
      {
        subtitle: 'Documentos obligatorios',
        content: [
          '📄 Permiso de conducción (del conductor): acredita que el conductor puede conducir.',
          '📄 Permiso de circulación (del vehículo): acredita que el vehículo está matriculado.',
          '📄 Seguro de responsabilidad civil obligatorio: cubre los daños a terceros.',
          'La ficha técnica NO es obligatorio llevarla en el vehículo (sí para la ITV).',
        ],
        warning: 'Circular sin seguro es una infracción muy grave: 6 puntos y multa de hasta 3.000 €. Además, si causas un accidente, pagas tú.',
      },
      {
        subtitle: 'ITV — Inspección Técnica de Vehículos',
        content: [
          '🆕 0-4 años: exentos (primera ITV a los 4 años)',
          '⏱️ 4-10 años: cada 2 años',
          '⏰ +10 años: cada año',
          '🚕 Taxis, ambulancias: periodicidad especial (más frecuente)',
          'Con la ITV DESFAVORABLE: 2 meses para reparar y volver a pasar. No puedes circular.',
        ],
      },
      {
        subtitle: 'Neumáticos',
        content: [
          'Profundidad mínima del dibujo: 1,6 mm.',
          'Presión correcta: consulta el manual del vehículo o la pegatina en el marco de la puerta.',
          'Revisa la presión en frío (el calor aumenta la presión y da lecturas incorrectas).',
          'Un neumático desinflado aumenta el consumo hasta un 3% y la distancia de frenado.',
        ],
        tip: 'Cuando la profundidad del dibujo llega a los indicadores de desgaste (pequeñas marcas en los canales), el neumático debe sustituirse urgentemente.',
      },
      {
        subtitle: 'Equipo de seguridad obligatorio',
        content: [
          '🦺 Chaleco reflectante: ponérselo ANTES de salir del vehículo.',
          '🔺 Dos triángulos de emergencia o dispositivo V-16 (luz LED ámbar homologada).',
          '💡 El V-16 puede activarse desde el interior del vehículo (más seguro).',
        ],
      },
    ],
  },
  {
    id: 'eficiencia',
    title: 'Conducción Eficiente y Medio Ambiente',
    emoji: '🌿',
    summary: 'Técnicas para ahorrar combustible y reducir emisiones.',
    legalRef: 'Plan MOVEA · Etiqueta energética DGT (Res. 20/01/2016)',
    sections: [
      {
        subtitle: 'Técnicas de conducción eficiente',
        content: [
          '📈 Cambia a marchas altas pronto: gasolina entre 2.000-2.500 rpm; diésel entre 1.500-2.000 rpm.',
          '🚀 Acelera suavemente y de forma progresiva.',
          '👀 Anticipa los frenados: usa el freno motor en vez del freno de pie cuando puedas.',
          '🚗 Mantén una velocidad constante (el cruise control ayuda en autopista).',
          '❄️ Reduce el uso del aire acondicionado: consume hasta un 10% más de combustible.',
          '📦 No lleves peso innecesario: 100 kg extra aumentan el consumo un 5%.',
          '🔲 Quita la baca cuando no la uses: aumenta la resistencia aerodinámica.',
        ],
        tip: 'En ciudad, a partir de ~60 segundos de parada prevista, apagar el motor es más eficiente que dejarlo al ralentí.',
      },
      {
        subtitle: 'Etiquetas medioambientales DGT',
        content: [
          '🟢 0 EMISIONES: eléctricos de batería (BEV) e hidrógeno (FCEV). Acceso a todas las zonas.',
          '🔵 ECO: híbridos enchufables (PHEV) y vehículos de gas (GNC, GLP).',
          '🟡 C: gasolina Euro 4+ y diésel Euro 6. Acceso a la mayoría de zonas.',
          '🟠 B: gasolina Euro 3 y diésel Euro 4-5. Restricciones en episodios de contaminación.',
          '⛔ Sin etiqueta: los más contaminantes. Restringidos en muchas ciudades.',
        ],
        warning: 'Las zonas de bajas emisiones (ZBE) son obligatorias en municipios >50.000 habitantes desde 2023. Sin etiqueta adecuada, no puedes circular.',
      },
    ],
  },
];

// ─── COMPONENTES UI ─────────────────────────────────────────────

function SignRow({ signs }: { signs: React.ReactElement[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
      <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 4, paddingVertical: 4 }}>
        {signs.map((sign, i) => (
          <View key={i} style={ms.signBox}>
            {sign}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function SectionCard({ section }: { section: ManualSection }) {
  return (
    <View style={ms.sectionCard}>
      <Text style={ms.sectionSubtitle}>{section.subtitle}</Text>
      {section.signs && <SignRow signs={section.signs} />}
      {section.content.map((line, i) => (
        <View key={i} style={ms.bulletRow}>
          <Text style={ms.bulletDot}>·</Text>
          <Text style={ms.bulletText}>{line}</Text>
        </View>
      ))}
      {section.tip && (
        <View style={ms.tipBox}>
          <Text style={ms.tipLabel}>💡 Consejo</Text>
          <Text style={ms.tipText}>{section.tip}</Text>
        </View>
      )}
      {section.warning && (
        <View style={ms.warningBox}>
          <Text style={ms.warningLabel}>⚠️ Importante</Text>
          <Text style={ms.warningText}>{section.warning}</Text>
        </View>
      )}
    </View>
  );
}

function ChapterView({ chapter, onBack }: { chapter: ManualChapter; onBack: () => void }) {
  return (
    <SafeAreaView style={ms.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ms.content}>
        <TouchableOpacity onPress={onBack} style={ms.backBtn}>
          <Text style={ms.backTxt}>‹ Manual</Text>
        </TouchableOpacity>

        <LinearGradient colors={['#1A237E18', '#1A237E00']} style={ms.chapterHeader}>
          <Text style={{ fontSize: 52 }}>{chapter.emoji}</Text>
          <Text style={ms.chapterTitle}>{chapter.title}</Text>
          <Text style={ms.chapterSummary}>{chapter.summary}</Text>
          <View style={ms.legalBadge}>
            <Text style={ms.legalText}>📌 {chapter.legalRef}</Text>
          </View>
        </LinearGradient>

        {chapter.sections.map((section, i) => (
          <SectionCard key={i} section={section} />
        ))}

        {/* Link to official source */}
        <TouchableOpacity
          style={ms.officialBtn}
          onPress={() => {
            Alert.alert(
              'Manual oficial DGT',
              'El manual completo está disponible gratuitamente en la web de la DGT.',
              [
                { text: 'Abrir dgt.es', onPress: () => Linking.openURL('https://www.dgt.es/conoce-la-dgt/publicaciones/') },
                { text: 'Cerrar', style: 'cancel' },
              ]
            );
          }}
        >
          <Text style={ms.officialBtnTxt}>📖 Ver manual oficial completo en dgt.es</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── PANTALLA PRINCIPAL DEL MANUAL ──────────────────────────────

export default function ManualScreen() {
  const [selectedChapter, setSelectedChapter] = useState<ManualChapter | null>(null);

  if (selectedChapter) {
    return <ChapterView chapter={selectedChapter} onBack={() => setSelectedChapter(null)} />;
  }

  return (
    <SafeAreaView style={ms.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ms.content}>
        {/* Hero */}
        <LinearGradient colors={['#1A237E', '#283593']} style={ms.hero}>
          <Text style={ms.heroEmoji}>📚</Text>
          <Text style={ms.heroTitle}>Manual del Conductor</Text>
          <Text style={ms.heroSub}>
            Basado en el manual oficial de la DGT y la normativa vigente.
            Toda la teoría que necesitas para aprobar.
          </Text>
          <TouchableOpacity
            style={ms.heroLink}
            onPress={() => Linking.openURL('https://www.dgt.es/conoce-la-dgt/publicaciones/')}
          >
            <Text style={ms.heroLinkTxt}>📖 Manual oficial DGT →</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Nota legal */}
        <View style={ms.legalNote}>
          <Text style={ms.legalNoteText}>
            ℹ️ Este resumen está basado en la normativa oficial española (RGC, LSV) y el Manual del Conductor publicado por la DGT. Para el texto legal completo, consulta el BOE o dgt.es.
          </Text>
        </View>

        {/* Capítulos */}
        <Text style={ms.sectionTitle}>Capítulos</Text>
        {CHAPTERS.map(chapter => (
          <TouchableOpacity
            key={chapter.id}
            style={[ms.chapterCard, SHADOWS.small]}
            onPress={() => setSelectedChapter(chapter)}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 32 }}>{chapter.emoji}</Text>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={ms.chapterCardTitle}>{chapter.title}</Text>
              <Text style={ms.chapterCardSummary} numberOfLines={1}>{chapter.summary}</Text>
              <Text style={ms.chapterCardRef}>{chapter.legalRef}</Text>
            </View>
            <Text style={{ fontSize: 20, color: COLORS.secondary }}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Recursos oficiales */}
        <Text style={[ms.sectionTitle, { marginTop: 8 }]}>Recursos oficiales DGT</Text>
        {[
          { label: '📖 Manual del Conductor (PDF)', url: 'https://www.dgt.es/conoce-la-dgt/publicaciones/' },
          { label: '⚖️ Reglamento General de Circulación (BOE)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23514' },
          { label: '📋 Ley de Tráfico y Seguridad Vial (BOE)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-8197' },
          { label: '🔴 Cuadro de sanciones DGT', url: 'https://www.dgt.es/el-trafico/normas-de-circulacion/infracciones-y-sanciones/' },
          { label: '🌿 Etiquetas medioambientales DGT', url: 'https://www.dgt.es/inicio/tramites-y-multas/vehiculos/etiqueta-ambiental/' },
        ].map(({ label, url }) => (
          <TouchableOpacity
            key={url}
            style={[ms.linkCard, SHADOWS.small]}
            onPress={() => Linking.openURL(url)}
            activeOpacity={0.85}
          >
            <Text style={ms.linkLabel}>{label}</Text>
            <Text style={{ fontSize: 16, color: COLORS.blue }}>↗</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── ESTILOS ────────────────────────────────────────────────────
const ms = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, gap: 12 },
  hero: { borderRadius: 20, padding: 24, alignItems: 'center', gap: 10 },
  heroEmoji: { fontSize: 52 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#fff', textAlign: 'center' },
  heroSub: { fontSize: 13, color: '#ffffffCC', textAlign: 'center', lineHeight: 20 },
  heroLink: { backgroundColor: '#ffffff20', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  heroLinkTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  legalNote: { backgroundColor: '#1A237E12', borderRadius: 12, padding: 12, borderLeftWidth: 3, borderLeftColor: '#1A237E' },
  legalNoteText: { fontSize: 12, color: COLORS.secondary, lineHeight: 18 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.dark },
  chapterCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.card, borderRadius: 16, padding: 16 },
  chapterCardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.dark },
  chapterCardSummary: { fontSize: 12, color: COLORS.secondary },
  chapterCardRef: { fontSize: 10, color: COLORS.blue, fontWeight: '600' },
  linkCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, borderRadius: 12, padding: 14 },
  linkLabel: { fontSize: 14, color: COLORS.dark, flex: 1 },
  // Chapter view
  backBtn: { marginBottom: 8 },
  backTxt: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  chapterHeader: { borderRadius: 20, padding: 24, alignItems: 'center', gap: 8, marginBottom: 4 },
  chapterTitle: { fontSize: 22, fontWeight: '800', color: COLORS.dark },
  chapterSummary: { fontSize: 13, color: COLORS.secondary, textAlign: 'center' },
  legalBadge: { backgroundColor: '#1A237E15', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  legalText: { fontSize: 11, color: '#1A237E', fontWeight: '600' },
  sectionCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, gap: 8, ...SHADOWS.small },
  sectionSubtitle: { fontSize: 15, fontWeight: '700', color: COLORS.dark, marginBottom: 4 },
  signBox: { backgroundColor: COLORS.bg, borderRadius: 10, padding: 6, alignItems: 'center', justifyContent: 'center' },
  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bulletDot: { fontSize: 16, color: COLORS.primary, lineHeight: 22, width: 14 },
  bulletText: { flex: 1, fontSize: 13, color: COLORS.dark, lineHeight: 21 },
  tipBox: { backgroundColor: '#FFF9C4', borderRadius: 10, padding: 12, marginTop: 4, borderLeftWidth: 3, borderLeftColor: '#F9A825' },
  tipLabel: { fontSize: 12, fontWeight: '700', color: '#F57F17', marginBottom: 3 },
  tipText: { fontSize: 13, color: '#5D4037', lineHeight: 19 },
  warningBox: { backgroundColor: '#FFEBEE', borderRadius: 10, padding: 12, marginTop: 4, borderLeftWidth: 3, borderLeftColor: COLORS.wrong },
  warningLabel: { fontSize: 12, fontWeight: '700', color: COLORS.wrong, marginBottom: 3 },
  warningText: { fontSize: 13, color: '#B71C1C', lineHeight: 19 },
  officialBtn: { backgroundColor: '#1A237E', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  officialBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
