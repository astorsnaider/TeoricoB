/**
 * Manual del Conductor — TeoricoB
 *
 * Contenido de elaboración propia basado en:
 *   - Real Decreto 1428/2003 (Reglamento General de Circulación — RGC)
 *   - Real Decreto Legislativo 6/2015 (Ley sobre Tráfico — LSV)
 *   - Real Decreto 818/2009 (Reglamento General de Conductores — RGCond)
 *   - Real Decreto 920/2017 (Inspecciones Técnicas de Vehículos — ITV)
 *   - Ley 17/2005 (Sistema de permiso por puntos)
 *   - Instrucción 2021/V-046 DGT (Velocidades urbanas)
 *   - Convención de Viena sobre señales de tráfico (ratificada por España)
 *
 * No es reproducción del manual oficial DGT, que está protegido por copyright.
 * Para el texto legal completo: https://www.boe.es
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Linking, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import {
  SignStop, SignCedaElPaso, SignVelocidadMaxima, SignProhibidoAdelantar,
  SignPasoPeatones, SignSemaforoRojo, SignSemaforoAmbar, SignSemaforoVerde,
  MarkLineaContinua, MarkLineaDiscontinua, SignEntradaProhibida,
  SignSentidoObligatorio, SignPeligroGenerico, SignObras, SignNinos,
  SignFinLimitaciones, SignAutopista, SignPrioridadSentidoContrario,
  SignPasoNivelSinBarreras, SignPasoNivelConBarreras, SignVientoLateral,
  SignVelocidadMinima, SignCadenas, SignAutovia, SignEstacionamiento,
  SignZonaPeatonal,
} from '../components/TrafficSign';
import {
  DiagramInterseccionDerecha, DiagramRotonda, DiagramAdelantamiento,
  DiagramDistanciaSeguridad, DiagramLuces, DiagramParadaEstacionamiento,
  DiagramAparcamientoProhibido,
} from '../components/RoadScenario';

// ─── TIPOS ──────────────────────────────────────────────────────

interface RuleItem {
  text: string;
  sub?: string;
}

interface ManualSection {
  subtitle: string;
  intro?: string;
  rules: RuleItem[];
  note?: string;
  warning?: string;
  signs?: React.ReactElement[];
  diagram?: React.ReactElement;
  legalRef?: string;
}

interface ManualChapter {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  summary: string;
  legalRef: string;
  sections: ManualSection[];
}

// ─── HELPER PARA SEÑALES ────────────────────────────────────────
function sign(component: React.ReactElement, key: string) {
  return <Svg width={72} height={72} viewBox="0 0 100 100" key={key}>{component}</Svg>;
}

// ─── CAPÍTULOS DEL MANUAL ───────────────────────────────────────

const CHAPTERS: ManualChapter[] = [

  // ──────────────────────────────────────────────────────────────
  // 1. EL CONDUCTOR
  // ──────────────────────────────────────────────────────────────
  {
    id: 'conductor',
    title: 'El Conductor',
    icon: 'person-circle-outline',
    color: '#5C6BC0',
    summary: 'Tipos de permiso, requisitos, período de prueba y obligaciones generales.',
    legalRef: 'Arts. 59–75 LSV · RD 818/2009 (RGCond)',
    sections: [
      {
        subtitle: 'Tipos de permiso de conducción',
        intro: 'En España existen varios tipos de permiso (licencia). El permiso B es el más común y habilita para la mayoría de vehículos de uso privado.',
        legalRef: 'Art. 4 RGCond',
        rules: [
          { text: 'Permiso AM', sub: 'Ciclomotores y cuatriciclos ligeros. Edad mínima: 15 años.' },
          { text: 'Permiso A1', sub: 'Motocicletas hasta 125 cc y triciclos hasta 15 kW. Edad mínima: 16 años.' },
          { text: 'Permiso A2', sub: 'Motocicletas hasta 35 kW. Edad mínima: 18 años.' },
          { text: 'Permiso A', sub: 'Motocicletas sin limitación de potencia. Edad mínima: 20 años (vía progresiva) o 24 años (directa).' },
          { text: 'Permiso B', sub: 'Vehículos hasta 3.500 kg MMA y hasta 8 plazas (sin conductor). También permite conducir remolques hasta 750 kg. Edad mínima: 18 años.' },
          { text: 'Permiso BE', sub: 'Vehículo B con remolque cuyo conjunto supere los 3.500 kg. Edad mínima: 18 años.' },
          { text: 'Permisos C, CE, D, DE', sub: 'Para camiones, autobuses y sus combinaciones con remolque. Edad mínima: 21 años (C) o 24 años (D).' },
        ],
      },
      {
        subtitle: 'Permiso B — Lo que puedes conducir',
        legalRef: 'Art. 5 RGCond',
        rules: [
          { text: 'Turismos, furgonetas y vehículos hasta 3.500 kg de Masa Máxima Autorizada (MMA).' },
          { text: 'Con hasta 8 plazas (sin contar al conductor).' },
          { text: 'Con remolque o semirremolque de hasta 750 kg de MMA.' },
          { text: 'Con remolque cuyo conjunto (vehículo + remolque) no supere los 3.500 kg.' },
          { text: 'Triciclos y cuatriciclos de motor (con condiciones de potencia).' },
          { text: 'A partir de los 3 años con el permiso B: motocicletas A1 con límites de potencia.' },
        ],
        note: 'Si el conjunto vehículo + remolque supera 3.500 kg, necesitas además el permiso BE.',
      },
      {
        subtitle: 'Período de prueba (conductores noveles)',
        legalRef: 'Art. 63 LSV · Arts. 19–20 Ley 17/2005',
        rules: [
          { text: 'Duración: 2 años desde la obtención del permiso.' },
          { text: 'Puntos iniciales: 8 puntos (frente a 12 de un conductor veterano).' },
          { text: 'Si superas el período sin sanciones: se accede a los 12 puntos completos.' },
          { text: 'Tasa de alcoholemia reducida: 0,3 g/l en sangre (0,15 mg/l en aire).' },
          { text: 'Velocidad máxima en autopista: 100 km/h (frente a 120 km/h del general).' },
          { text: 'En el permiso B acompañado (BEA): se puede conducir desde los 17 años con adulto habilitado.' },
        ],
        warning: 'Si pierdes todos los puntos durante el período de prueba, debes esperar 1 año (en lugar de 2) para volver a examinarte, pero aun así debes superar el examen de aptitud completo.',
      },
      {
        subtitle: 'Obligaciones generales del conductor',
        legalRef: 'Arts. 9–18 LSV',
        rules: [
          { text: 'Llevar siempre el permiso de conducción durante la conducción.' },
          { text: 'Mantener el permiso en buen estado de conservación y legible.' },
          { text: 'No conducir bajo los efectos de alcohol, drogas o medicamentos que afecten a las capacidades.' },
          { text: 'Llevar puesto el cinturón de seguridad o el casco en todo momento.' },
          { text: 'No usar el teléfono móvil u otros dispositivos que requieran el uso de las manos.' },
          { text: 'Mantener el vehículo en perfectas condiciones de uso y seguridad.' },
          { text: 'Ceder el paso a los vehículos de emergencias.' },
          { text: 'Respetar todas las señales de tráfico y las instrucciones de los agentes.' },
          { text: 'No abandonar el lugar del accidente si has participado en él (delito de fuga).' },
        ],
      },
      {
        subtitle: 'Renovación y vigencia del permiso',
        legalRef: 'Arts. 8–12 RGCond',
        rules: [
          { text: 'Permiso B: vigente hasta los 65 años con renovaciones cada 10 años.' },
          { text: 'A partir de los 65 años: renovación cada 5 años.' },
          { text: 'Reconocimiento médico-psicológico obligatorio en cada renovación.' },
          { text: 'Si hay enfermedades sobrevenidas que afecten a la conducción, debes comunicarlo al centro médico de reconocimiento.' },
          { text: 'El permiso caducado no habilita para conducir; conducir con permiso caducado es una infracción grave.' },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 2. SEÑALES DE PELIGRO
  // ──────────────────────────────────────────────────────────────
  {
    id: 'senales_peligro',
    title: 'Señales de Peligro',
    icon: 'warning-outline',
    color: '#E63946',
    summary: 'Triángulos que advierten de riesgos en la vía. Colocación, tipos y obligaciones.',
    legalRef: 'Arts. 132–140 RGC · Catálogo oficial señales DGT',
    sections: [
      {
        subtitle: 'Características generales',
        legalRef: 'Art. 132 RGC',
        rules: [
          { text: 'Forma: triangular con vértice hacia arriba.' },
          { text: 'Fondo: blanco reflectante.' },
          { text: 'Borde: rojo.' },
          { text: 'Símbolo: negro en el interior.' },
          { text: 'Ubicación en carretera: entre 150 y 250 metros antes del peligro.' },
          { text: 'Ubicación en zona urbana: entre 50 y 100 metros antes del peligro.' },
          { text: 'Altura: el borde inferior a más de 0,5 m sobre la calzada.' },
        ],
        warning: 'Al ver una señal de peligro debes reducir la velocidad de forma anticipada, aunque no veas todavía el riesgo señalizado.',
        signs: [sign(<SignPeligroGenerico />, 'p1'), sign(<SignPasoPeatones />, 'p2'), sign(<SignObras />, 'p3'), sign(<SignNinos />, 'p4')],
      },
      {
        subtitle: 'Catálogo de señales de peligro — Vía y sus características',
        legalRef: 'Catálogo P-1 a P-8 RGC',
        rules: [
          { text: 'P-1a / P-1b: Curva peligrosa (a la derecha / a la izquierda)', sub: 'Radio de curvatura inferior al mínimo para la velocidad señalizada o menor de 45 m.' },
          { text: 'P-2a / P-2b: Doble curva (primera a la derecha / primera a la izquierda)', sub: 'Dos curvas consecutivas de radio reducido en el mismo o distinto sentido.' },
          { text: 'P-3: Badén', sub: 'Resalte transversal en la calzada que puede dañar el vehículo si se supera a alta velocidad.' },
          { text: 'P-4: Calzada con perfil irregular', sub: 'Firme deteriorado con baches, ondulaciones o irregularidades.' },
          { text: 'P-5: Pavimento deslizante', sub: 'Firme con escasa adherencia: hielo, grava suelta, aceite, etc.' },
          { text: 'P-6: Estrechamiento de calzada', sub: 'Reducción del número de carriles o del ancho de la vía.' },
          { text: 'P-7: Firme irregular o en mal estado', sub: 'Diferencia de nivel entre la calzada y el arcén.' },
          { text: 'P-8: Caída al agua', sub: 'Proximidad de un canal, río, lago u otro peligro de caída al agua.' },
        ],
      },
      {
        subtitle: 'Catálogo de señales de peligro — Obstáculos y peatones',
        legalRef: 'Catálogo P-9 a P-22 RGC',
        rules: [
          { text: 'P-9a: Paso a nivel con barreras', sub: 'Cruzamiento con vía de ferrocarril que dispone de barreras automáticas o manuales.' },
          { text: 'P-9b: Paso a nivel sin barreras', sub: 'El más peligroso: debes detener el vehículo y asegurarte de que no viene ningún tren.' },
          { text: 'P-10: Semáforos', sub: 'Intersección regulada por semáforos. Prepárate para detenerte.' },
          { text: 'P-11: Intersección con prioridad a la derecha', sub: 'Próxima intersección donde los vehículos de la derecha tienen prioridad.' },
          { text: 'P-13a / P-13b: Viento lateral (de la derecha / de la izquierda)', sub: 'Zona con frecuentes y fuertes rachas de viento transversal.' },
          { text: 'P-14: Desprendimientos', sub: 'Posibles caídas de piedras o roca desde el talud.' },
          { text: 'P-15: Animales domésticos en calzada', sub: 'Zona con paso habitual de ganado o animales de granja.' },
          { text: 'P-16: Animales salvajes en calzada', sub: 'Zona de caza o fauna silvestre que puede cruzar la vía.' },
          { text: 'P-17: Paso de peatones', sub: 'Proximidad de un paso de peatones señalizado.' },
          { text: 'P-18: Niños', sub: 'Zona próxima a un colegio, parque o área infantil.' },
          { text: 'P-19: Ciclistas en calzada', sub: 'Presencia habitual de ciclistas en la vía.' },
          { text: 'P-20: Obras', sub: 'Trabajos en la calzada o sus inmediaciones. Obedece la señalización provisional (amarilla).' },
          { text: 'P-21: Prioridad en sentido contrario', sub: 'En el estrechamiento próximo, los vehículos de sentido contrario tienen prioridad.' },
          { text: 'P-22: Peligro de incendio', sub: 'Zona con riesgo de incendio forestal. Prohibido encender fuego.' },
        ],
        signs: [sign(<SignPasoNivelSinBarreras />, 'pn1'), sign(<SignPasoNivelConBarreras />, 'pn2'), sign(<SignVientoLateral />, 'vl')],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 3. SEÑALES DE REGLAMENTACIÓN
  // ──────────────────────────────────────────────────────────────
  {
    id: 'senales_reglamentacion',
    title: 'Señales de Reglamentación',
    icon: 'ban-outline',
    color: '#C62828',
    summary: 'Prohibiciones, restricciones y obligaciones de cumplimiento inmediato.',
    legalRef: 'Arts. 141–155 RGC',
    sections: [
      {
        subtitle: 'Señales de prioridad',
        legalRef: 'Arts. 141–143 RGC',
        rules: [
          { text: 'R-1 — Ceda el Paso', sub: 'Triángulo invertido (vértice abajo), blanco y rojo. Ceder el paso a los vehículos de la vía principal. NO es obligatorio detenerse si no hay tráfico.' },
          { text: 'R-2 — Stop', sub: 'Octogonal, fondo rojo, letras blancas. DETENCIÓN TOTAL obligatoria antes de la intersección aunque no haya tráfico. Detenerse completamente, observar y reiniciar solo cuando sea seguro.' },
          { text: 'R-3 — Prohibición de paso sin detenerse (aduana o similar)', sub: 'Similar al Stop pero en puestos de control. Misma obligación de parada total.' },
          { text: 'R-4 — Fin de prioridad', sub: 'Señala que termina la vía prioritaria. A partir de ese punto se aplica la regla general.' },
          { text: 'R-5 — Prioridad respecto al sentido contrario', sub: 'Avisa de que el sentido contrario tiene preferencia en el estrechamiento próximo.' },
          { text: 'R-6 — Prioridad sobre el sentido contrario', sub: 'Informa de que tienes prioridad frente al tráfico contrario en el paso estrecho.' },
        ],
        signs: [sign(<SignStop />, 'stop'), sign(<SignCedaElPaso />, 'ceda'), sign(<SignPrioridadSentidoContrario />, 'prior')],
        warning: 'La diferencia entre STOP y Ceda el Paso es fundamental: con STOP hay que parar completamente SIEMPRE. Con Ceda el Paso solo hay que ceder; si no viene nadie, puedes seguir sin parar.',
      },
      {
        subtitle: 'Señales de prohibición de entrada',
        legalRef: 'Arts. 144–146 RGC',
        rules: [
          { text: 'R-100 — Entrada prohibida', sub: 'Círculo rojo. Prohibido entrar a cualquier vehículo en ese sentido. Diferente a "dirección prohibida".' },
          { text: 'R-101 — Prohibición de paso para vehículos de motor', sub: 'Solo para vehículos con motor. Los peatones y ciclistas pueden pasar.' },
          { text: 'R-102 — Prohibición para motocicletas', sub: 'Solo para motos y ciclomotores.' },
          { text: 'R-103 — Prohibición para ciclomotores', sub: 'Solo para ciclomotores (no afecta a motocicletas).' },
          { text: 'R-104 — Prohibición para vehículos de motor que no sean motocicletas', sub: 'Para automóviles; las motos pueden pasar.' },
          { text: 'R-105 — Prohibición para vehículos destinados al transporte de mercancías', sub: 'Camiones, furgonetas de reparto.' },
          { text: 'R-106 — Prohibición para vehículos con más de X toneladas', sub: 'Límite de masa total.' },
          { text: 'R-107 — Prohibición para vehículos con anchura superior a X metros', sub: 'Para pasos estrechos.' },
          { text: 'R-108 — Prohibición para vehículos con altura superior a X metros', sub: 'Para túneles y pasos inferiores.' },
        ],
        signs: [sign(<SignEntradaProhibida />, 'ent')],
      },
      {
        subtitle: 'Señales de prohibición de maniobras',
        legalRef: 'Arts. 147–150 RGC',
        rules: [
          { text: 'R-200 — Dirección prohibida', sub: 'Círculo blanco con barra roja horizontal. Prohibido circular en ese sentido en esa vía.' },
          { text: 'R-305 — Adelantamiento prohibido', sub: 'Dos coches, uno rojo. Prohibido adelantar a cualquier vehículo de motor. Excepto: ciclistas, peatones, animales.' },
          { text: 'R-306 — Fin de prohibición de adelantamiento' },
          { text: 'R-307 — Prohibición de adelantamiento para camiones', sub: 'Solo afecta a vehículos de más de 3.500 kg.' },
          { text: 'R-301 a R-304 — Velocidad máxima', sub: 'Círculo blanco con borde rojo y número. Indica la velocidad máxima en km/h para ese tramo.' },
          { text: 'R-400 — Dirección obligatoria', sub: 'Círculo azul con flecha. Impone seguir la dirección indicada.' },
          { text: 'R-500 — Fin de limitaciones', sub: 'Cancela todas las restricciones impuestas anteriormente excepto la prohibición de adelantamiento.' },
        ],
        signs: [
          sign(<SignVelocidadMaxima limit={30} />, 'vm30'),
          sign(<SignVelocidadMaxima limit={50} />, 'vm50'),
          sign(<SignVelocidadMaxima limit={90} />, 'vm90'),
          sign(<SignProhibidoAdelantar />, 'noadelant'),
          sign(<SignFinLimitaciones />, 'fin'),
        ],
      },
      {
        subtitle: 'Señales de obligación',
        legalRef: 'Arts. 149–151 RGC',
        rules: [
          { text: 'Fondo azul, forma circular. Imponen una obligación al conductor.' },
          { text: 'R-400a a R-400g — Dirección o sentido obligatorio', sub: 'La flecha indica la única dirección permitida en ese punto.' },
          { text: 'R-401a / R-401b — Paso obligatorio (derecha / izquierda)', sub: 'Debes pasar por el lado indicado de un obstáculo.' },
          { text: 'R-402 — Glorieta obligatoria', sub: 'Indica el sentido de circulación en una rotonda.' },
          { text: 'R-407a — Vía reservada para ciclistas', sub: 'Solo pueden circular ciclistas.' },
          { text: 'R-408 — Velocidad mínima obligatoria', sub: 'No puedes circular por debajo de esa velocidad.' },
          { text: 'R-409 — Uso obligatorio de cadenas', sub: 'Debes llevar las cadenas montadas o disponibles.' },
          { text: 'R-416 — Uso obligatorio de luces', sub: 'Obligatorio llevar las luces encendidas (túneles, etc.).' },
        ],
        signs: [
          sign(<SignSentidoObligatorio direction="straight" />, 'recto'),
          sign(<SignSentidoObligatorio direction="right" />, 'dcha'),
          sign(<SignVelocidadMinima min={60} />, 'vmin'),
          sign(<SignCadenas />, 'cadenas'),
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 4. SEÑALES DE INDICACIÓN Y SEMÁFOROS
  // ──────────────────────────────────────────────────────────────
  {
    id: 'senales_indicacion',
    title: 'Indicación y Semáforos',
    icon: 'navigate-outline',
    color: '#1565C0',
    summary: 'Señales informativas, autopistas, zonas y semáforos.',
    legalRef: 'Arts. 152–165 RGC',
    sections: [
      {
        subtitle: 'Señales de indicación — Tipos',
        legalRef: 'Art. 152 RGC',
        rules: [
          { text: 'Forma: rectangular o cuadrada.' },
          { text: 'Autopistas y autovías: fondo azul.' },
          { text: 'Carreteras convencionales fuera de poblado: fondo verde.' },
          { text: 'Rutas turísticas y señalización especial: fondo marrón.' },
          { text: 'Señales de servicio (gasolineras, hospitales…): fondo azul con símbolo blanco.' },
          { text: 'Señales de orientación: paneles de destino con flechas.' },
        ],
        signs: [sign(<SignAutopista />, 'ap'), sign(<SignAutovia />, 'av'), sign(<SignZonaPeatonal />, 'zpeat'), sign(<SignEstacionamiento />, 'park')],
      },
      {
        subtitle: 'Prioridad entre señales',
        legalRef: 'Art. 5 LSV',
        rules: [
          { text: '1.º — Agentes de circulación en funciones de regulación', sub: 'Tienen prioridad absoluta sobre cualquier señal, semáforo o norma de circulación.' },
          { text: '2.º — Señales circunstanciales y dispositivos de regulación del tráfico', sub: 'Semáforos, paneles variables, barreras de paso a nivel.' },
          { text: '3.º — Señales fijas', sub: 'Señales verticales permanentes de tráfico.' },
          { text: '4.º — Marcas viales', sub: 'Líneas, flechas y símbolos pintados en la calzada.' },
          { text: '5.º — Normas de circulación', sub: 'Las reglas generales del RGC (regla de la derecha, etc.).' },
        ],
        warning: 'Si un agente de tráfico te indica algo que contradice un semáforo o una señal, SIEMPRE obedeces al agente.',
      },
      {
        subtitle: 'Semáforos — Significado de cada luz',
        legalRef: 'Arts. 156–159 RGC',
        rules: [
          { text: 'Luz roja fija', sub: 'Parada obligatoria antes de la línea de stop. Prohibido cruzar. Infracción muy grave saltársela.' },
          { text: 'Luz ámbar (amarilla) fija', sub: 'Parada, a menos que estés tan próximo que frenar sea más peligroso que continuar. NUNCA es señal de "acelerar".' },
          { text: 'Luz verde fija', sub: 'Puedes avanzar, respetando las preferencias de peatones que ya hayan iniciado el cruce.' },
          { text: 'Luz verde intermitente', sub: 'El semáforo va a cambiar a ámbar. Prepárate para detenerte.' },
          { text: 'Luz roja intermitente', sub: 'Señal de paso a nivel o apertura de puente levadizo. Para completamente y no cruces.' },
          { text: 'Flecha verde', sub: 'Solo puedes circular en la dirección de la flecha, aunque el semáforo general esté en rojo.' },
          { text: 'Semáforo apagado', sub: 'Trata la intersección como no señalizada: regla general de ceder el paso al vehículo de la derecha.' },
        ],
        signs: [sign(<SignSemaforoRojo />, 'sr'), sign(<SignSemaforoAmbar />, 'sa'), sign(<SignSemaforoVerde />, 'sv')],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 5. MARCAS VIALES
  // ──────────────────────────────────────────────────────────────
  {
    id: 'marcas_viales',
    title: 'Marcas Viales',
    icon: 'git-commit-outline',
    color: '#37474F',
    summary: 'Líneas, flechas y marcas en el asfalto: significado y obligaciones.',
    legalRef: 'Arts. 162–168 RGC · Norma 8.2-IC (Marcas Viales)',
    sections: [
      {
        subtitle: 'Líneas longitudinales — Tipos y significado',
        legalRef: 'Art. 162 RGC',
        rules: [
          { text: 'Línea continua blanca', sub: 'Prohibido cruzarla o circular sobre ella. Separa sentidos de circulación o carriles con maniobras incompatibles.' },
          { text: 'Línea discontinua blanca (marca M-1.3)', sub: 'Puedes cruzarla para adelantar u otras maniobras si la seguridad lo permite. Solo marca una separación orientativa.' },
          { text: 'Doble línea continua (marca M-2.2)', sub: 'Prohibido para ambos sentidos. Ningún vehículo puede cruzar.' },
          { text: 'Línea continua + discontinua (M-2.3)', sub: 'El conductor contiguo a la línea CONTINUA no puede cruzar. El contiguo a la DISCONTINUA sí puede, si es seguro.' },
          { text: 'Línea de borde de calzada (M-2.6)', sub: 'Línea continua blanca en el borde de la calzada. El arcén empieza tras ella.' },
        ],
        signs: [sign(<MarkLineaContinua />, 'mc'), sign(<MarkLineaDiscontinua />, 'md')],
        warning: 'Circular sobre la línea continua o cruzarla para adelantar conlleva pérdida de 4 puntos del carné.',
      },
      {
        subtitle: 'Líneas transversales',
        legalRef: 'Art. 164 RGC',
        rules: [
          { text: 'Línea de stop (M-4.1)', sub: 'Línea continua transversal. Detenerse completamente antes de ella.' },
          { text: 'Línea de ceda el paso (M-4.2)', sub: 'Línea discontinua transversal (dos líneas discontinuas). Ceder el paso, no parar necesariamente.' },
          { text: 'Paso de peatones (M-4.3)', sub: 'Franjas longitudinales blancas (zebra). Prioridad de los peatones que cruzan o van a cruzar.' },
          { text: 'Paso para ciclistas (M-4.4)', sub: 'Franjas discontinuas blancas. Prioridad de los ciclistas que cruzan.' },
          { text: 'Señal de STOP en el suelo (M-6.4)', sub: 'Refuerza la señal vertical R-2.' },
          { text: 'Triángulo de ceda el paso en el suelo (M-6.5)', sub: 'Refuerza la señal vertical R-1.' },
        ],
      },
      {
        subtitle: 'Flechas, textos y marcas especiales',
        legalRef: 'Arts. 165–168 RGC',
        rules: [
          { text: 'Flechas de dirección (M-5.2)', sub: 'Indican la dirección obligatoria u opcional desde ese carril. Si hay flecha de giro, debes girar.' },
          { text: 'Marcas en el bordillo (M-7.2)', sub: 'Líneas amarillas en el bordillo = prohibición de estacionamiento. Zigzag amarillo = parada prohibida.' },
          { text: 'Marcas para carril bici (M-5.8)', sub: 'Símbolo de bicicleta: carril reservado para ciclistas.' },
          { text: 'Marcas provisionales amarillas', sub: 'Usadas en obras. Tienen prioridad sobre todas las marcas blancas permanentes.' },
          { text: 'Marcas de advertencia (M-4.5 a M-4.8)', sub: 'Marca en forma de V invertida que anuncia un peligro o reducción de velocidad.' },
          { text: 'Número de velocidad en la calzada', sub: 'Indica la velocidad máxima de ese tramo sin necesidad de señal vertical.' },
        ],
        note: 'Las marcas viales son de cumplimiento obligatorio exactamente igual que las señales verticales. Ignorarlas puede ser sancionado con multa y pérdida de puntos.',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 6. LA VELOCIDAD
  // ──────────────────────────────────────────────────────────────
  {
    id: 'velocidad',
    title: 'La Velocidad',
    icon: 'speedometer-outline',
    color: '#E65100',
    summary: 'Límites genéricos y especiales, velocidad adecuada y consecuencias del exceso.',
    legalRef: 'Arts. 44–53 RGC · Arts. 48–54 LSV',
    sections: [
      {
        subtitle: 'Velocidades máximas genéricas — Turismos',
        legalRef: 'Art. 48 LSV · Art. 50 RGC',
        rules: [
          { text: 'Autopistas y autovías: 120 km/h', sub: 'Velocidad mínima: 60 km/h.' },
          { text: 'Carreteras convencionales: 90 km/h', sub: 'Si no existe arcén practicable o este es inferior a 1,5 m: 70 km/h.' },
          { text: 'Travesías: 50 km/h', sub: 'Tramo de carretera que atraviesa un núcleo urbano.' },
          { text: 'Vías urbanas con 2 o más carriles por sentido: 50 km/h' },
          { text: 'Calles urbanas de 1 carril por sentido con aceras: 30 km/h', sub: 'Desde el 11 de mayo de 2021 (Instrucción 2021/V-046 DGT).' },
          { text: 'Zonas de coexistencia (zona 20): 20 km/h', sub: 'Peatones y ciclistas tienen prioridad absoluta.' },
        ],
        signs: [
          sign(<SignVelocidadMaxima limit={120} />, 'vm120'),
          sign(<SignVelocidadMaxima limit={90} />, 'vm90'),
          sign(<SignVelocidadMaxima limit={50} />, 'vm50'),
          sign(<SignVelocidadMaxima limit={30} />, 'vm30'),
          sign(<SignVelocidadMaxima limit={20} />, 'vm20'),
        ],
        warning: 'El cambio de 2021 reduce a 30 km/h las calles de un carril por sentido. Es uno de los errores más comunes en el examen y en la práctica real.',
      },
      {
        subtitle: 'Velocidades máximas especiales',
        legalRef: 'Art. 48 LSV · Anexo XI LSV',
        rules: [
          { text: 'Vehículos con remolque o semirremolque >750 kg', sub: 'Autopista: 80 km/h · Carretera: 70 km/h · Urbana: 50 km/h.' },
          { text: 'Camiones (>3.500 kg MMA)', sub: 'Autopista: 100 km/h · Carretera: 80 km/h.' },
          { text: 'Autobuses y vehículos de transporte de viajeros', sub: 'Autopista: 100 km/h · Carretera: 90 km/h.' },
          { text: 'Conductores noveles (primeros 2 años)', sub: 'Autopista y autovía: 100 km/h.' },
          { text: 'Vehículos de urgencia en servicio de urgencia', sub: 'Pueden superar los límites con las señales acústicas y luminosas activadas, en la medida que la seguridad lo permita.' },
          { text: 'Vehículos especiales (grúas, maquinaria agrícola)', sub: 'En general, no pueden superar los 40 km/h; algunos hasta 60 km/h con autorización.' },
        ],
      },
      {
        subtitle: 'Velocidades mínimas',
        legalRef: 'Art. 50 RGC',
        rules: [
          { text: 'Autopistas y autovías: 60 km/h (la mitad del máximo, que es 120 km/h).' },
          { text: 'Circular por debajo de la velocidad mínima sin causa justificada es infracción grave.' },
          { text: 'Circular a velocidad anormalmente reducida y sin causa justificada entorpece el tráfico.' },
          { text: 'Se puede circular más despacio por razones de seguridad (avería, condiciones meteorológicas, etc.).' },
        ],
        signs: [sign(<SignVelocidadMinima min={60} />, 'vmin60')],
      },
      {
        subtitle: 'El principio de velocidad adecuada',
        legalRef: 'Art. 44 RGC',
        rules: [
          { text: 'El límite legal es la velocidad MÁXIMA, no la que siempre debes llevar.' },
          { text: 'Debes adaptar la velocidad a: estado de la vía, densidad del tráfico, condiciones meteorológicas, estado del vehículo y visibilidad.' },
          { text: 'Con lluvia: la distancia de frenado puede duplicarse o triplicarse.' },
          { text: 'Con niebla densa: reduce la velocidad hasta que puedas detenerte dentro del campo de visibilidad.' },
          { text: 'Con hielo o nieve: la distancia de frenada puede multiplicarse por 5–10 respecto a asfalto seco.' },
          { text: 'Con viento lateral fuerte: mayor riesgo de pérdida de control en vehículos altos (furgonetas, camiones).' },
        ],
        note: 'Si las condiciones del tráfico o de la vía lo requieren, incluso ir a velocidad inferior al límite puede ser excesiva y sancionable si genera peligro o accidente.',
      },
      {
        subtitle: 'Física del frenado — Por qué la velocidad mata',
        rules: [
          { text: 'La distancia de frenado aumenta con el CUADRADO de la velocidad.' },
          { text: 'A 50 km/h: distancia de frenado aprox. 14 m (en seco).' },
          { text: 'A 100 km/h: distancia de frenado aprox. 55 m (en seco). Cuatro veces más, aunque solo doblas la velocidad.' },
          { text: 'A 120 km/h: distancia de frenado aprox. 80 m (en seco).' },
          { text: 'El tiempo de reacción (antes de frenar) añade: a 90 km/h → 25 m con 1 segundo de reacción.' },
          { text: 'Distancia total de detención = distancia de reacción + distancia de frenado.' },
          { text: 'Con lluvia, multiplica la distancia de frenado por 2. Con hielo, por 5–10.' },
        ],
        note: 'En el examen DGT es frecuente preguntar la relación entre velocidad y distancia de frenado. Recuerda que se cuadruplica al duplicar la velocidad.',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 7. PRIORIDAD DE PASO
  // ──────────────────────────────────────────────────────────────
  {
    id: 'prioridad',
    title: 'Prioridad de Paso',
    icon: 'git-merge-outline',
    color: '#2E7D32',
    summary: 'Quién cede el paso en cada situación: intersecciones, rotondas y casos especiales.',
    legalRef: 'Arts. 57–66 RGC',
    sections: [
      {
        subtitle: 'Jerarquía de señales de prioridad',
        legalRef: 'Art. 5 LSV',
        rules: [
          { text: '1.º Agentes de tráfico en funciones de regulación.' },
          { text: '2.º Semáforos.' },
          { text: '3.º Señales de STOP y Ceda el Paso.' },
          { text: '4.º Marcas viales (líneas de stop y ceda el paso en el suelo).' },
          { text: '5.º Norma general de la derecha.' },
        ],
        diagram: <DiagramInterseccionDerecha />,
      },
      {
        subtitle: 'Regla general: vehículo a la derecha',
        legalRef: 'Art. 57 RGC',
        rules: [
          { text: 'En intersecciones sin señalizar, debes ceder el paso al vehículo que se aproxima por tu DERECHA.' },
          { text: 'Esta regla aplica cuando todos los vehículos llegan a la intersección al mismo tiempo.' },
          { text: 'Si el vehículo viene por la derecha, tiene prioridad aunque su vía parezca secundaria.' },
          { text: 'Excepción: en intersecciones donde se accede desde un camino de tierra o similar a una carretera pavimentada, el de la carretera tiene prioridad.' },
        ],
      },
      {
        subtitle: 'Vías principales y secundarias',
        legalRef: 'Art. 57 RGC',
        rules: [
          { text: 'Los vehículos que circulan por una vía principal tienen prioridad sobre los de las vías secundarias.' },
          { text: 'La señalización (STOP, Ceda el Paso) determina qué vía es principal.' },
          { text: 'Si hay señal de Ceda el Paso: el de la vía principal tiene prioridad.' },
          { text: 'Si hay señal de STOP: debes detenerte siempre antes de ceder el paso.' },
        ],
      },
      {
        subtitle: 'Rotondas (glorietas)',
        legalRef: 'Art. 57 RGC · Circular DGT 11/1999',
        rules: [
          { text: 'Los vehículos que circulan DENTRO de la rotonda tienen prioridad sobre los que quieren entrar.' },
          { text: 'Al llegar a una rotonda, debes ceder el paso al tráfico interior.' },
          { text: 'Dentro de la rotonda: circula por el carril más a la derecha si vas a salir en la primera o segunda salida.' },
          { text: 'Para salidas más alejadas: puedes usar el carril interior, pero señaliza antes de cambiar al exterior para salir.' },
          { text: 'Al salir: señaliza con el intermitente derecho cuando estés en la salida inmediatamente anterior a la tuya.' },
        ],
        diagram: <DiagramRotonda />,
        note: 'En rotondas, no existe la regla "el que viene por la derecha tiene prioridad". La prioridad es siempre del que ya circula dentro.',
      },
      {
        subtitle: 'Vehículos de emergencia y especiales',
        legalRef: 'Arts. 60–63 RGC',
        rules: [
          { text: 'Vehículos de emergencia (policía, bomberos, ambulancias) con señales acústicas y luminosas en uso: PRIORIDAD ABSOLUTA.' },
          { text: 'Debes apartarte y facilitarles el paso, incluso si debes subir al arcén, detenerte o invadir el carril contrario.' },
          { text: 'No puedes seguir un vehículo de emergencia a menos de 50 metros.' },
          { text: 'Vehículos de conservación de vías con señales luminosas: tienen prioridad de paso en trabajos de conservación.' },
          { text: 'Convoyes militares y policiales: prioridad señalizada.' },
          { text: 'Autobús urbano: en zona urbana, al incorporarse desde una parada con la señal de intermitente activada, debes cederle el paso.' },
        ],
        warning: 'No facilitar el paso a un vehículo de emergencia en servicio urgente es una infracción muy grave con pérdida de 6 puntos.',
      },
      {
        subtitle: 'Peatones y ciclistas',
        legalRef: 'Arts. 64–65 RGC',
        rules: [
          { text: 'Los peatones tienen prioridad en los pasos de peatones señalizados cuando estén cruzando o cuando sea evidente su intención de cruzar.' },
          { text: 'Antes de un paso de peatones: reduce la velocidad hasta poder detenerte si fuera necesario.' },
          { text: 'Si hay un semáforo para peatones y está en verde para ellos: tienes que esperar aunque el tuyo esté también en verde (los peatones iniciaron el cruce).' },
          { text: 'Ciclistas en un paso para ciclistas señalizado: tienen prioridad sobre los vehículos a motor.' },
          { text: 'Los peatones que ya han iniciado el cruce por un paso de peatones tienen prioridad incluso si no hay señal.' },
        ],
      },
      {
        subtitle: 'Pasos a nivel',
        legalRef: 'Arts. 83–88 RGC',
        rules: [
          { text: 'El ferrocarril tiene PRIORIDAD ABSOLUTA en los pasos a nivel.' },
          { text: 'Aunque las barreras no estén bajadas o no haya señales: debes ceder el paso al tren.' },
          { text: 'Cuando las barreras estén bajando o haya señal roja intermitente: detenerse antes de las barreras.' },
          { text: 'Al cruzar: no detenerse nunca sobre las vías. Ni siquiera un momento.' },
          { text: 'Si el vehículo se avería sobre las vías: evacua a todos los ocupantes inmediatamente y llama al 112.' },
        ],
        warning: 'Los pasos a nivel sin barreras son los más peligrosos. Aunque no veas ni oigas ningún tren, para completamente, mira en ambas direcciones y asegúrate antes de cruzar.',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 8. EL ADELANTAMIENTO
  // ──────────────────────────────────────────────────────────────
  {
    id: 'adelantamiento',
    title: 'El Adelantamiento',
    icon: 'car-outline',
    color: '#1565C0',
    summary: 'Cuándo y cómo adelantar con seguridad. Casos prohibidos y distancias.',
    legalRef: 'Arts. 82–96 RGC',
    sections: [
      {
        subtitle: 'Procedimiento correcto de adelantamiento',
        legalRef: 'Art. 82 RGC',
        rules: [
          { text: '1. Comprobar que el adelantamiento es legal (no hay señal prohibitoria, línea continua, curva sin visibilidad, etc.).' },
          { text: '2. Asegurarse de que no hay vehículos adelantando detrás de ti que puedan verse sorprendidos.' },
          { text: '3. Señalizar con el INTERMITENTE IZQUIERDO.' },
          { text: '4. Verificar que no viene tráfico en sentido contrario en cantidad o velocidad que dificulte la maniobra.' },
          { text: '5. Aumentar la velocidad, desplazarse al carril izquierdo y rebasar al vehículo adelantado.' },
          { text: '6. Al rebasarlo completamente, señalizar con el INTERMITENTE DERECHO.' },
          { text: '7. Regresar al carril derecho dejando espacio suficiente (especialmente con ciclistas: mínimo 1,5 m lateral).' },
          { text: '8. Desactivar el intermitente.' },
        ],
        diagram: <DiagramAdelantamiento />,
      },
      {
        subtitle: 'Cuándo está PROHIBIDO adelantar',
        legalRef: 'Art. 84 RGC',
        rules: [
          { text: 'En curvas o cambios de rasante sin visibilidad suficiente, aunque no haya línea continua.' },
          { text: 'Cuando hay señal R-305 (prohibición de adelantamiento) o línea continua.' },
          { text: 'En pasos a nivel sin barreras o en sus proximidades.' },
          { text: 'En intersecciones en general, salvo casos especiales (ciclistas en carril bici, vehículos que se detienen en parada).' },
          { text: 'En pasos de peatones con peatones cruzando o a punto de cruzar.' },
          { text: 'En túneles con circulación en ambos sentidos y carril único.' },
          { text: 'Cuando el vehículo de delante ha señalizado giro a la izquierda y está deteniéndose para girar.' },
          { text: 'Cuando hacerlo obligaría al que viene de frente a variar su trayectoria o velocidad.' },
        ],
        signs: [sign(<SignProhibidoAdelantar />, 'noadel')],
      },
      {
        subtitle: 'Distancia lateral mínima al adelantar ciclistas',
        legalRef: 'Art. 84 RGC (modificado por Ley 6/2014)',
        rules: [
          { text: 'Distancia lateral mínima: 1,5 metros entre el vehículo y el ciclista.' },
          { text: 'Para garantizar esta distancia puedes invadir el carril contrario si la visibilidad es suficiente.' },
          { text: 'En doble carril por sentido: utiliza el carril izquierdo para adelantar al ciclista.' },
          { text: 'Si la distancia no puede garantizarse: no adelantas, esperas.' },
        ],
        warning: 'Adelantar a un ciclista con menos de 1,5 m de separación lateral es infracción grave.',
      },
      {
        subtitle: 'Obligaciones del adelantado',
        legalRef: 'Art. 86 RGC',
        rules: [
          { text: 'No aumentar la velocidad cuando otro vehículo te está adelantando.' },
          { text: 'Si es necesario, reducir la velocidad para facilitar el adelantamiento.' },
          { text: 'Mantenerte en tu carril sin movimientos bruscos.' },
          { text: 'Si ves que el que te adelanta tiene dificultades: reducir todavía más la velocidad.' },
          { text: 'Conducir pegado a la derecha siempre que sea posible, para dejar espacio.' },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 9. CAMBIOS DE DIRECCIÓN, SENTIDO Y MARCHA ATRÁS
  // ──────────────────────────────────────────────────────────────
  {
    id: 'cambios_direccion',
    title: 'Cambios de Dirección y Sentido',
    icon: 'return-down-forward-outline',
    color: '#6A1B9A',
    summary: 'Cómo girar, dar la vuelta y usar la marcha atrás de forma legal y segura.',
    legalRef: 'Arts. 67–81 RGC',
    sections: [
      {
        subtitle: 'Cambio de dirección (giro)',
        legalRef: 'Art. 67 RGC',
        rules: [
          { text: 'Señalizar con el intermitente con suficiente antelación.' },
          { text: 'Para girar a la izquierda: desplazarse progresivamente al carril izquierdo o al centro de la calzada.' },
          { text: 'Para girar a la derecha: desplazarse progresivamente al carril derecho y al borde de la calzada.' },
          { text: 'Al girar, hacerlo lentamente y respetando la prioridad de peatones y ciclistas.' },
          { text: 'Al girar a la izquierda, el radio del giro no debe invadir el sentido contrario más de lo necesario.' },
          { text: 'Antes de girar: asegurarse de que el carril de destino está libre.' },
        ],
      },
      {
        subtitle: 'Cambio de sentido (dar la vuelta)',
        legalRef: 'Art. 74 RGC',
        rules: [
          { text: 'Está prohibido cambiar de sentido en autopistas, autovías y vías con más de dos carriles por sentido.' },
          { text: 'Está prohibido en curvas, cambios de rasante, pasos a nivel y túneles.' },
          { text: 'En carreteras convencionales: solo se puede realizar cuando la visibilidad y el espacio lo permitan.' },
          { text: 'Se debe señalizar con el intermitente izquierdo.' },
          { text: 'Si el radio de giro no permite hacerlo en un solo movimiento: se puede hacer en varios, siempre con seguridad.' },
          { text: 'No se puede hacer cambio de sentido en zonas con prohibición señalizada.' },
        ],
        warning: 'Hacer cambio de sentido en autopista es una infracción muy grave con pérdida de 6 puntos y multa de hasta 500 euros. Además, es extremadamente peligroso.',
      },
      {
        subtitle: 'Marcha atrás',
        legalRef: 'Art. 79 RGC',
        rules: [
          { text: 'La marcha atrás solo está permitida como maniobra auxiliar de otra maniobra principal (aparcar, salir de un parking, etc.).' },
          { text: 'No puede realizarse en autopistas ni autovías.' },
          { text: 'La distancia máxima permitida es limitada a lo estrictamente necesario.' },
          { text: 'Debe realizarse despacio y con extrema precaución.' },
          { text: 'El conductor debe asegurarse de que la vía está despejada detrás.' },
          { text: 'En calles de un solo sentido: la marcha atrás debe hacerse en ese mismo sentido (de frente a la dirección de circulación, marcha atrás hacia el inicio de la calle).' },
        ],
      },
      {
        subtitle: 'Cambio de carril',
        legalRef: 'Art. 73 RGC',
        rules: [
          { text: 'Señalizar siempre con el intermitente correspondiente antes del cambio.' },
          { text: 'Comprobar los espejos y el punto ciego antes de efectuar el cambio.' },
          { text: 'Ceder el paso a los vehículos que circulan por el carril al que te incorporas.' },
          { text: 'El cambio debe ser progresivo, sin movimientos bruscos.' },
          { text: 'En atascos: respetar la cremallera (los vehículos del carril que se acaba ceden el paso uno a uno).' },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 10. PARADA Y ESTACIONAMIENTO
  // ──────────────────────────────────────────────────────────────
  {
    id: 'parada_estacionamiento',
    title: 'Parada y Estacionamiento',
    icon: 'pause-circle-outline',
    color: '#00838F',
    summary: 'Diferencia entre parada y estacionamiento, dónde está prohibido y normas de aparcamiento.',
    legalRef: 'Arts. 90–113 RGC',
    sections: [
      {
        subtitle: 'Definiciones: parada vs. estacionamiento',
        legalRef: 'Art. 90 RGC',
        rules: [
          { text: 'PARADA: inmovilización del vehículo durante un tiempo inferior a 2 minutos en zona urbana, SIN que el conductor abandone el vehículo o lo deje sin atención.' },
          { text: 'ESTACIONAMIENTO: inmovilización del vehículo por tiempo superior a 2 minutos O con el conductor abandonando el vehículo.' },
          { text: 'Un vehículo parado con el motor en marcha y el conductor dentro: es una PARADA.' },
          { text: 'Un vehículo con el motor parado y el conductor dentro más de 2 minutos: puede considerarse estacionamiento.' },
        ],
        diagram: <DiagramParadaEstacionamiento />,
      },
      {
        subtitle: 'Dónde está PROHIBIDO parar y estacionar',
        legalRef: 'Arts. 91–94 RGC',
        rules: [
          { text: 'En los 5 metros anteriores y posteriores a un cruce o intersección.' },
          { text: 'En los 5 metros anteriores a un paso de peatones.' },
          { text: 'En pasos a nivel y sus proximidades (25 metros).' },
          { text: 'En las curvas y cambios de rasante de escasa visibilidad y en las inmediaciones de los mismos.' },
          { text: 'En los carriles o partes de la vía reservados exclusivamente para la circulación.' },
          { text: 'En los carriles bici y ciclovías.' },
          { text: 'En el arcén de autopistas y autovías, salvo avería.' },
          { text: 'Sobre las aceras, paseos y demás zonas destinadas al paso de peatones.' },
          { text: 'En doble fila (paralelo a otro vehículo estacionado).' },
          { text: 'Delante de los vados (accesos a garajes), aunque no estén señalizados si el garaje existe.' },
          { text: 'En los lugares reservados para uso exclusivo de determinados usuarios (personas con movilidad reducida, taxis, carga y descarga).' },
          { text: 'En los 25 metros anteriores a una señal de tráfico o semáforo, si impide su visión.' },
        ],
        diagram: <DiagramAparcamientoProhibido />,
      },
      {
        subtitle: 'Dónde está SOLO prohibido estacionar (pero sí parar)',
        legalRef: 'Art. 94 RGC',
        rules: [
          { text: 'En los lugares habilitados como paradas de autobús, taxis u otros vehículos de transporte público.' },
          { text: 'En las zonas de carga y descarga durante su horario de funcionamiento.' },
          { text: 'En los 15 metros anteriores a una parada de transporte público.' },
        ],
      },
      {
        subtitle: 'Normas de aparcamiento',
        legalRef: 'Arts. 95–105 RGC',
        rules: [
          { text: 'Siempre que sea posible, aparcar paralelo al bordillo con las ruedas derechas a menos de 30 cm del mismo.' },
          { text: 'En vías de sentido único se puede aparcar en ambos lados salvo señal contraria.' },
          { text: 'El motor debe estar parado y el freno de estacionamiento puesto.' },
          { text: 'No se debe impedir el acceso de otros vehículos ni peatones.' },
          { text: 'Zona azul: zona de estacionamiento limitado y regulado mediante ticket. Tiempo máximo regulado por cada municipio.' },
          { text: 'Zona verde: reservada a residentes del barrio con autorizaciones.' },
        ],
        note: 'El estacionamiento en doble fila incluso brevemente está prohibido y es una infracción grave en muchos municipios.',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 11. EL USO DE LUCES
  // ──────────────────────────────────────────────────────────────
  {
    id: 'luces',
    title: 'El Uso de las Luces',
    icon: 'flashlight-outline',
    color: '#F57F17',
    summary: 'Qué luces usar en cada situación y cuándo son obligatorias.',
    legalRef: 'Arts. 98–115 RGC',
    sections: [
      {
        subtitle: 'Tipos de luces del vehículo',
        legalRef: 'Art. 98 RGC',
        rules: [
          { text: 'Luces de posición (de situación)', sub: 'Indican la posencia y tamaño del vehículo. Se usan con poca visibilidad o junto a otras luces.' },
          { text: 'Luces de cruce (cortas, de ciudad)', sub: 'Iluminan la calzada sin deslumbrar al tráfico contrario. Alcance: ~45 m.' },
          { text: 'Luces de carretera (largas)', sub: 'Mayor alcance (~100 m). Solo cuando no hay tráfico que pueda deslumbrarse.' },
          { text: 'Luces de freno', sub: 'Rojas. Se activan automáticamente al frenar.' },
          { text: 'Intermitentes (de dirección)', sub: 'Naranjas. Señalizan cambios de carril, giros, adelantamientos y paradas de emergencia.' },
          { text: 'Luz de marcha atrás', sub: 'Blanca. Se activa al meter la marcha atrás.' },
          { text: 'Luz antiniebla delantera', sub: 'Amarilla. Para niebla, lluvia intensa o nieve.' },
          { text: 'Luz antiniebla trasera', sub: 'Roja. Obligatoria en condiciones de muy escasa visibilidad.' },
          { text: 'Luces de emergencia (hazard)', sub: 'Todos los intermitentes parpadeando simultáneamente. Para señalizar paradas de emergencia.' },
        ],
        diagram: <DiagramLuces />,
      },
      {
        subtitle: 'Cuándo son obligatorias las luces de cruce',
        legalRef: 'Art. 106 RGC',
        rules: [
          { text: 'De noche o en condiciones de oscuridad, siempre.' },
          { text: 'En túneles, pasos inferiores y tramos de vía cubiertos, aunque haya iluminación artificial.' },
          { text: 'En condiciones meteorológicas adversas: lluvia intensa, niebla, nieve, humo, polvo.' },
          { text: 'Cuando la visibilidad sea inferior a 200 metros, aunque no sea de noche.' },
        ],
        warning: 'Circular sin luces de noche es infracción muy grave con pérdida de 4 puntos.',
      },
      {
        subtitle: 'Cuándo usar luces de carretera (largas)',
        legalRef: 'Art. 101 RGC',
        rules: [
          { text: 'De noche en carretera cuando no haya tráfico de sentido contrario.' },
          { text: 'Cuando no haya vehículos circulando delante que puedan ser deslumbrados.' },
          { text: 'PROHIBIDO en zonas urbanas iluminadas.' },
          { text: 'PROHIBIDO cuando hay vehículos en sentido contrario a menos de 150 m.' },
          { text: 'Al cruzarte con otro vehículo: cambia a cortas.' },
          { text: 'Se puede usar para advertir de la intención de adelantar (destellos breves).' },
        ],
      },
      {
        subtitle: 'Antiniebla y otras luces especiales',
        legalRef: 'Arts. 108–110 RGC',
        rules: [
          { text: 'Antiniebla delantera: solo con niebla, lluvia fuerte, nieve o polvo que reduzca la visibilidad.' },
          { text: 'Antiniebla trasera: obligatoria cuando la visibilidad sea inferior a 50 metros.' },
          { text: 'No usar la antiniebla trasera cuando la visibilidad es buena: puede deslumbrar y molestar.' },
          { text: 'Luces de emergencia: al parar en carretera por avería, en un atasco largo o ante un peligro súbito.' },
          { text: 'El uso de luces de emergencia NO exime de colocar los triángulos o el V-16.' },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 12. ALCOHOL, DROGAS Y DISTRACCIONES
  // ──────────────────────────────────────────────────────────────
  {
    id: 'alcohol_drogas',
    title: 'Alcohol, Drogas y Distracciones',
    icon: 'medkit-outline',
    color: '#7B1FA2',
    summary: 'Efectos, límites legales, sustancias prohibidas y uso del teléfono.',
    legalRef: 'Arts. 20–22 RGC · RD 1217/2009',
    sections: [
      {
        subtitle: 'Tasas de alcoholemia permitidas',
        legalRef: 'Art. 20 RGC · RD 1217/2009',
        rules: [
          { text: 'Conductores en general:', sub: '0,5 g/l en sangre · 0,25 mg/l en aire espirado.' },
          { text: 'Conductores noveles (< 2 años de permiso):', sub: '0,3 g/l en sangre · 0,15 mg/l en aire espirado.' },
          { text: 'Conductores profesionales (transporte de viajeros, mercancías peligrosas, etc.):', sub: '0,3 g/l en sangre · 0,15 mg/l en aire espirado.' },
          { text: 'Superación de 1,2 g/l en sangre o 0,60 mg/l en aire:', sub: 'Es delito penal (art. 379 CP), no solo infracción administrativa. Penas de cárcel y retirada de permiso.' },
        ],
        warning: 'Negarse a realizar la prueba de alcoholemia es en sí misma una infracción MUY GRAVE, equivalente en consecuencias a superar 1,2 g/l. Puede conllevar detención.',
      },
      {
        subtitle: 'Efectos del alcohol sobre la conducción',
        rules: [
          { text: 'Aumenta el tiempo de reacción: con 0,5 g/l puede aumentar más del 30%.' },
          { text: 'Reduce la capacidad de concentración y de procesamiento de información.' },
          { text: 'Distorsiona la percepción de velocidades, distancias y señales.' },
          { text: 'Aumenta la sensación de confianza (efecto paradójico: nos creemos mejores conductores).' },
          { text: 'Reduce la coordinación motora y la capacidad de reacción ante imprevistos.' },
          { text: 'Altera la visión: reduce el campo visual y empeora la visión nocturna.' },
        ],
        note: 'El organismo elimina el alcohol a 0,10–0,15 g/l por hora. Ningún remedio casero (café, ducha fría, agua) acelera este proceso. Solo el tiempo.',
      },
      {
        subtitle: 'Drogas y medicamentos',
        legalRef: 'Art. 21 RGC',
        rules: [
          { text: 'Está prohibido conducir bajo los efectos de cualquier sustancia psicotrópica, estupefaciente o cualquier otra que reduzca las facultades.' },
          { text: 'Drogas ilegales (cannabis, cocaína, anfetaminas, etc.): tolerancia cero. Cualquier presencia en sangre es infracción.' },
          { text: 'El cannabis puede detectarse en sangre hasta 30 días en consumidores habituales.' },
          { text: 'La prueba se realiza con saliva en carretera y análisis de sangre posterior.' },
          { text: 'Medicamentos: si el prospecto indica que pueden afectar a la conducción (triángulo amarillo), no debes conducir.' },
          { text: 'Antihistamínicos, ansiolíticos, hipnóticos y algunos analgésicos pueden impedir legalmente conducir.' },
        ],
      },
      {
        subtitle: 'El teléfono y otras distracciones',
        legalRef: 'Art. 18 LSV (modificado por RD-L 19/2022)',
        rules: [
          { text: 'Usar el teléfono móvil sujeto con la mano: 6 puntos y 200 euros.' },
          { text: 'Usar auriculares o cascos conectados a dispositivos de sonido: 3 puntos.' },
          { text: 'El manos libres (altavoz integrado, bluetooth, diadema con micrófono) está permitido pero distrae cognitivamente.' },
          { text: 'Escribir mensajes o usar aplicaciones, incluso en semáforo en rojo: infracción.' },
          { text: 'Usar el GPS en el móvil sujeto con la mano: infracción.' },
          { text: 'Ver vídeos o contenidos multimedia al volante: infracción muy grave.' },
          { text: 'Comer, beber, afeitarse o maquillarse al volante puede considerarse conducción negligente.' },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 13. ACCIDENTES Y PRIMEROS AUXILIOS
  // ──────────────────────────────────────────────────────────────
  {
    id: 'accidentes',
    title: 'Accidentes y Primeros Auxilios',
    icon: 'medkit-outline',
    color: '#B71C1C',
    summary: 'Protocolo PAS, técnicas básicas de socorro y lo que nunca debes hacer.',
    legalRef: 'Arts. 129–131 LSV · Protocolo ERC 2021',
    sections: [
      {
        subtitle: 'Protocolo PAS',
        rules: [
          { text: 'P — PROTEGER', sub: 'Señalizar el accidente. Ponerse el chaleco ANTES de salir. Colocar triángulos (50 m) o activar V-16 desde el interior. Aparcar el vehículo en lugar seguro.' },
          { text: 'A — AVISAR', sub: 'Llamar al 112 (gratuito, 24h, cualquier operador). Indicar: localización exacta, número de heridos, si hay atrapados, si hay riesgo de incendio.' },
          { text: 'S — SOCORRER', sub: 'Atender a los heridos SIN moverlos, salvo peligro inmediato de muerte (incendio, explosión, ahogamiento). Hablarles para tranquilizarlos.' },
        ],
        warning: 'No mover a un herido puede ser la diferencia entre recuperarse o quedar paralizado. La lesión medular es la principal razón para no moverles.',
      },
      {
        subtitle: 'Valoración inicial del herido (ABC)',
        rules: [
          { text: 'A — Airway (vía aérea)', sub: 'Comprobar que la vía aérea está abierta. Inclinar la cabeza hacia atrás y elevar el mentón (en adultos sin sospecha de lesión cervical).' },
          { text: 'B — Breathing (respiración)', sub: 'Ver, oír y sentir si respira. Mirar el pecho, acercar el oído a la boca, sentir el aliento en la mejilla.' },
          { text: 'C — Circulation (circulación)', sub: 'Comprobar si hay pulso, si hay hemorragias visibles.' },
          { text: 'Si no respira: iniciar RCP inmediatamente.' },
          { text: 'Si respira pero está inconsciente: posición lateral de seguridad (PLS).' },
          { text: 'Si hay hemorragia grave: presión directa sobre la herida.' },
        ],
      },
      {
        subtitle: 'Reanimación Cardiopulmonar (RCP)',
        legalRef: 'Guías ERC 2021',
        rules: [
          { text: 'Indica: persona inconsciente que no respira con normalidad.' },
          { text: '30 compresiones torácicas externas: profundidad 5-6 cm. Ritmo: 100-120 por minuto. Manos entrelazadas, brazos rectos, en el centro del pecho.' },
          { text: '2 respiraciones boca a boca: inclina cabeza, eleva mentón, sella la boca, insufla durante 1 segundo. El pecho debe elevarse.' },
          { text: 'Secuencia: 30 compresiones → 2 respiraciones → repetir sin descanso.' },
          { text: 'Si no se pueden o no se quieren dar respiraciones: solo compresiones continuas a 100-120/min.' },
          { text: 'Continúa hasta que lleguen los servicios de emergencia, la víctima respire o estés agotado.' },
          { text: 'Si hay un desfibrilador (DEA) disponible: usarlo lo antes posible siguiendo las instrucciones de voz.' },
        ],
      },
      {
        subtitle: 'Posición Lateral de Seguridad (PLS)',
        rules: [
          { text: 'Para personas inconscientes que SÍ respiran.' },
          { text: 'Objetivo: evitar que se atraganten con vómitos o que la lengua obstruya la vía aérea.' },
          { text: 'NO usar si hay sospecha de lesión de columna vertebral o cuello.' },
          { text: 'Procedimiento: girar al herido de lado, colocar el brazo inferior extendido, el superior flexionado apoyando la mejilla, pierna superior flexionada para estabilizar.' },
          { text: 'Mantener la vía aérea abierta: asegurarse de que la boca está hacia abajo para que fluya cualquier líquido.' },
          { text: 'Vigilar la respiración hasta que llegue la ayuda.' },
        ],
      },
      {
        subtitle: 'Control de hemorragias',
        rules: [
          { text: 'PRESIÓN DIRECTA: aplicar un paño limpio o gasa sobre la herida y presionar con fuerza sin soltar.' },
          { text: 'Mantener la presión continuada: no levantar el paño para comprobar si sigue sangrando.' },
          { text: 'Si el paño se empapa: añadir otro encima (sin retirar el primero) y seguir presionando.' },
          { text: 'Elevar el miembro herido por encima del nivel del corazón, si es posible.' },
          { text: 'Torniquete: solo como último recurso en hemorragias masivas de extremidades que no ceden con presión. Anotar la hora de aplicación.' },
        ],
      },
      {
        subtitle: 'Lo que NUNCA debes hacer',
        rules: [
          { text: 'Mover al herido sin causa de fuerza mayor (riesgo de lesión medular).' },
          { text: 'Quitar el casco a un motorista sin sospecha de parada cardiorrespiratoria.' },
          { text: 'Dar de comer, beber o medicamentos a un herido inconsciente o con heridas abdominales.' },
          { text: 'Abandonar el lugar del accidente si has participado en él (delito de fuga).' },
          { text: 'Obstruir el acceso a los servicios de emergencia.' },
          { text: 'Sacar al herido del vehículo salvo riesgo inminente (fuego, derrumbe, ahogamiento).' },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 14. EL VEHÍCULO: DOCUMENTACIÓN Y MANTENIMIENTO
  // ──────────────────────────────────────────────────────────────
  {
    id: 'vehiculo',
    title: 'El Vehículo',
    icon: 'car-outline',
    color: '#37474F',
    summary: 'Documentación obligatoria, ITV, neumáticos, luces y equipamiento de seguridad.',
    legalRef: 'RD 818/2009 · RD 920/2017 · Arts. 1–5 RGC',
    sections: [
      {
        subtitle: 'Documentos obligatorios al volante',
        legalRef: 'Art. 9 LSV · Art. 2 RGCond',
        rules: [
          { text: 'Permiso de conducción del conductor: acredita que el conductor está habilitado.' },
          { text: 'Permiso de circulación del vehículo: documento del vehículo que acredita su matriculación.' },
          { text: 'Seguro obligatorio de responsabilidad civil: la tarjeta del seguro o recibo en vigor.' },
          { text: 'La ficha técnica o tarjeta de inspección técnica NO es obligatorio llevarla en el vehículo, pero sí debe existir y estar disponible.' },
          { text: 'El DNI o documento de identidad: no es obligatorio al volante (el permiso ya acredita la identidad), pero sí recomendable.' },
        ],
        warning: 'Circular sin seguro obligatorio: 6 puntos y multa de hasta 3.000 euros. Además, si causas un accidente, pagas tú los daños.',
      },
      {
        subtitle: 'ITV — Inspección Técnica de Vehículos',
        legalRef: 'RD 920/2017',
        rules: [
          { text: '0–4 años de antigüedad: exentos de ITV.' },
          { text: '4–10 años: periodicidad bienal (cada 2 años).' },
          { text: 'Más de 10 años: periodicidad anual (cada año).' },
          { text: 'Taxis y vehículos de transporte público: inspecciones más frecuentes.' },
          { text: 'Resultado FAVORABLE: pegatina verde. Puedes circular.' },
          { text: 'Resultado DESFAVORABLE: pegatina roja. Tienes 2 meses para reparar y volver a pasar.' },
          { text: 'Resultado MUY DESFAVORABLE: pegatina negra. No puedes circular hasta pasar de nuevo con resultado favorable o desfavorable.' },
        ],
        note: 'Circular con la ITV caducada es una infracción grave. Si el resultado es MUY DESFAVORABLE y circulas, es una infracción muy grave.',
      },
      {
        subtitle: 'Neumáticos',
        legalRef: 'Reglamento técnico de vehículos',
        rules: [
          { text: 'Profundidad mínima del dibujo: 1,6 mm en toda la zona de rodadura.' },
          { text: 'Los indicadores de desgaste (TWI) son pequeñas protuberancias en los canales del dibujo que marcan los 1,6 mm.' },
          { text: 'Presión correcta: consulta el manual del fabricante o la pegatina en el marco de la puerta.' },
          { text: 'La presión se revisa en frío (el calor aumenta la presión hasta un 20%).' },
          { text: 'Un neumático desinflado 20% por debajo: aumenta el consumo un 3% y la distancia de frenado.' },
          { text: 'Neumáticos de invierno: obligatorios en algunos países europeos. En España recomendados por debajo de 7 ºC.' },
          { text: 'No mezclar neumáticos de distintas especificaciones en el mismo eje.' },
        ],
      },
      {
        subtitle: 'Equipamiento de seguridad obligatorio',
        legalRef: 'Art. 26 RGC · Instrucción DGT 2021',
        rules: [
          { text: 'Chaleco reflectante de alta visibilidad: uno por conductor más los que haya en el vehículo. Ponérselo ANTES de salir al exterior.' },
          { text: 'Dos triángulos de emergencia, o un dispositivo V-16 (luz LED ámbar homologada).' },
          { text: 'El V-16 puede activarse desde el interior del vehículo, lo que elimina el riesgo de atropello al colocar los triángulos.' },
          { text: 'Sistema de Retención Infantil (SRI) adecuado para menores de 135 cm o de hasta 12 años.' },
          { text: 'Extintor: no es obligatorio para turismos, sí para autobuses y transporte de mercancías.' },
          { text: 'Botiquín: no es obligatorio para turismos, pero muy recomendable.' },
        ],
      },
      {
        subtitle: 'El cinturón de seguridad',
        legalRef: 'Art. 118 RGC',
        rules: [
          { text: 'Obligatorio para todos los ocupantes, en todos los asientos y en cualquier tipo de vía.' },
          { text: 'El conductor es responsable de que todos los pasajeros lo lleven puesto.' },
          { text: 'No llevar cinturón: 3 puntos y multa de 200 euros.' },
          { text: 'Exenciones muy limitadas: conductores haciendo maniobras lentas, distribución de mercancías con paradas frecuentes, motivos médicos acreditados.' },
          { text: 'Nunca poner el asa del cinturón detrás del brazo o detrás de la espalda: puede ser letal en un accidente.' },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 15. INFRACCIONES Y SANCIONES
  // ──────────────────────────────────────────────────────────────
  {
    id: 'infracciones',
    title: 'Infracciones y Sanciones',
    icon: 'alert-circle-outline',
    color: '#BF360C',
    summary: 'Sistema de puntos, tipos de infracciones, multas y cómo recurrir.',
    legalRef: 'Ley 17/2005 · RDL 6/2015 (LSV) · Cuadro de sanciones DGT',
    sections: [
      {
        subtitle: 'El sistema de permiso por puntos',
        legalRef: 'Ley 17/2005',
        rules: [
          { text: 'Todos los conductores inician con 12 puntos.' },
          { text: 'Conductores noveles: 8 puntos en los 2 primeros años.' },
          { text: 'Al perder todos los puntos: permiso revocado.' },
          { text: 'Para recuperar el permiso: esperar 2 años (o 3 si ya se perdió anteriormente) + curso de sensibilización y reeducación vial + examen de aptitud.' },
          { text: 'Se pueden recuperar hasta 2 puntos (máx. 15 en total) con cursos voluntarios de sensibilización, siempre que no se hayan cometido infracciones graves en los últimos 2 años.' },
          { text: 'Si transcurren 2 años sin sanciones que conlleven pérdida de puntos y aún no se llega a 12: se recuperan 2 puntos.' },
          { text: 'Si transcurren 3 años: se recuperan 4 puntos.' },
        ],
      },
      {
        subtitle: 'Infracciones muy graves — 6 puntos',
        legalRef: 'Cuadro de sanciones LSV',
        rules: [
          { text: 'Conducir con tasa de alcoholemia superior al doble del límite permitido (1,0 g/l en sangre).' },
          { text: 'Conducir bajo los efectos de drogas (cualquier cantidad detectable).' },
          { text: 'Superar en más de 60 km/h la velocidad máxima permitida.' },
          { text: 'Saltarse un semáforo en rojo.' },
          { text: 'No respetar la prioridad de paso de los peatones en paso de peatones.' },
          { text: 'Usar el teléfono móvil sujeto con la mano mientras se conduce.' },
          { text: 'No llevar casco en moto o ciclomotor.' },
          { text: 'Conducir en dirección contraria.' },
          { text: 'No circular con las luces encendidas de noche.' },
          { text: 'Negarse a realizar las pruebas de alcoholemia o drogas.' },
          { text: 'Participar en competiciones o exhibiciones no autorizadas.' },
          { text: 'Circular sin seguro obligatorio.' },
        ],
      },
      {
        subtitle: 'Infracciones graves — 4 puntos',
        legalRef: 'Cuadro de sanciones LSV',
        rules: [
          { text: 'Superar en 41–60 km/h la velocidad máxima.' },
          { text: 'Adelantamiento peligroso (en curva sin visibilidad, paso a nivel, etc.).' },
          { text: 'No llevar cinturón de seguridad (conductor o pasajeros).' },
          { text: 'Conducir con tasa de alcoholemia entre el límite general y el doble.' },
        ],
      },
      {
        subtitle: 'Infracciones — otros puntos',
        rules: [
          { text: '3 puntos: superar la velocidad en 21–40 km/h · no señalizar parada de emergencia · circular con neumáticos en mal estado.' },
          { text: '2 puntos: circular por el arcén · no señalizar cambio de dirección · no respetar línea continua para adelantar · incumplimiento de señales de prohibición.' },
        ],
      },
      {
        subtitle: 'Cuantía de las multas por velocidad',
        legalRef: 'Anexo IV LSV',
        rules: [
          { text: '1–20 km/h sobre el límite: 100 euros.' },
          { text: '21–30 km/h sobre el límite: 200 euros (+ 3 puntos).' },
          { text: '31–40 km/h sobre el límite: 300 euros (+ 3 puntos).' },
          { text: '41–50 km/h sobre el límite: 400 euros (+ 4 puntos).' },
          { text: '51–60 km/h sobre el límite: 500 euros (+ 4 puntos).' },
          { text: 'Más de 60 km/h sobre el límite: 600 euros (+ 6 puntos). Puede conllevar retirada cautelar del permiso.' },
        ],
      },
      {
        subtitle: 'Procedimiento sancionador y recursos',
        legalRef: 'Arts. 79–104 LSV',
        rules: [
          { text: 'Pago con descuento del 50%: dentro de los 20 días hábiles siguientes a la notificación (implica renuncia al recurso).' },
          { text: 'Recurso de alzada: dentro del plazo indicado en la notificación (generalmente 1 mes).' },
          { text: 'Prescripción de infracciones leves: 3 meses. Graves: 6 meses. Muy graves: 1 año.' },
          { text: 'Si no se localiza al titular: se puede notificar por edictos.' },
          { text: 'Las sanciones de puntos no son acumulables con el descuento del 50%: si pagas con descuento, los puntos igualmente se deducen.' },
        ],
        note: 'El descuento del 50% NO se aplica a las infracciones que conllevan pérdida de puntos por conducir bajo los efectos del alcohol o drogas.',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 16. CONDUCCIÓN EFICIENTE Y MEDIO AMBIENTE
  // ──────────────────────────────────────────────────────────────
  {
    id: 'eficiencia',
    title: 'Conducción Eficiente y Medio Ambiente',
    icon: 'leaf-outline',
    color: '#2E7D32',
    summary: 'Técnicas de ahorro, etiquetas DGT y normas medioambientales.',
    legalRef: 'Estrategia Española de Movilidad Sostenible · Resolución DGT 20/01/2016',
    sections: [
      {
        subtitle: 'Técnicas de conducción eficiente',
        rules: [
          { text: 'Cambiar a marchas altas anticipadamente', sub: 'Gasolina: 2.000–2.500 rpm. Diésel: 1.500–2.000 rpm. Evita sobregirar el motor.' },
          { text: 'Acelerar de forma suave y progresiva', sub: 'Las aceleraciones bruscas pueden aumentar el consumo hasta un 40%.' },
          { text: 'Anticipar los frenados', sub: 'Levantar el pie del acelerador con antelación y usar el freno motor. Evita frenar bruscamente.' },
          { text: 'Mantener velocidad constante', sub: 'El cruise control en autopista puede reducir el consumo un 5–10%.' },
          { text: 'Reducir el uso del A/C', sub: 'El aire acondicionado aumenta el consumo hasta un 10%. Por debajo de 50 km/h, abre la ventanilla.' },
          { text: 'No llevar peso innecesario', sub: 'Cada 100 kg extra aumentan el consumo un 5%.' },
          { text: 'Quitar la baca o portaequipajes cuando no se use', sub: 'Aumenta la resistencia aerodinámica y el consumo.' },
          { text: 'Apagar el motor en paradas largas', sub: 'A partir de ~60 segundos de parada prevista, apagar el motor ahorra más que el ralentí.' },
          { text: 'Mantener la presión correcta de los neumáticos', sub: 'Desinflados 20% aumentan el consumo un 3%.' },
          { text: 'Usar la transmisión automática en modo D y no en modo manual innecesariamente.' },
        ],
      },
      {
        subtitle: 'Etiquetas medioambientales DGT',
        legalRef: 'Resolución DGT 20 enero 2016 (modificada)',
        rules: [
          { text: '"0 emisiones" (distintivo verde): vehículos eléctricos de batería (BEV) y de pila de combustible de hidrógeno (FCEV).', sub: 'Acceso a todas las zonas de bajas emisiones. Ventajas fiscales, aparcamiento gratuito en algunas ciudades.' },
          { text: '"ECO" (distintivo azul/verde): híbridos enchufables con autonomía en modo eléctrico inferior a 40 km (PHEV), y vehículos de gas (GNC, GLP).', sub: 'Muchas ventajas en ZBE. Pueden circularpor zonas restringidas.' },
          { text: '"C" (distintivo verde claro): gasolina con norma Euro 4 o superior; diésel con norma Euro 6.', sub: 'Acceso a la mayoría de ZBE salvo los episodios de alta contaminación.' },
          { text: '"B" (distintivo amarillo): gasolina Euro 3; diésel Euro 4 y Euro 5.', sub: 'Restricciones durante episodios de contaminación.' },
          { text: 'Sin etiqueta: gasolina anterior a Euro 3; diésel anterior a Euro 4.', sub: 'Los más contaminantes. Prohibición de circular en muchas ciudades en episodios de contaminación y, desde 2023, en ZBE.' },
        ],
        note: 'Las Zonas de Bajas Emisiones (ZBE) son obligatorias en municipios con más de 50.000 habitantes desde el 1 de enero de 2023 (Ley 7/2021 de Cambio Climático).',
      },
      {
        subtitle: 'Conducción y medio ambiente — Datos',
        rules: [
          { text: 'El sector del transporte es responsable del 26% de las emisiones de CO2 en España.' },
          { text: 'Conducir a 120 km/h consume un 25% más de combustible que a 100 km/h.' },
          { text: 'La conducción agresiva puede aumentar el consumo un 40% respecto a la eficiente.' },
          { text: 'Un vehículo diésel emite más partículas finas (PM2.5) que uno de gasolina, especialmente en ciudad.' },
          { text: 'Los vehículos eléctricos tienen una huella de carbono total del ciclo de vida un 50–70% menor que los de gasolina.' },
        ],
      },
    ],
  },

];

// ─── COMPONENTES DE UI ──────────────────────────────────────────

function SignRow({ signs }: { signs: React.ReactElement[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, marginBottom: 6 }}>
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 2, paddingVertical: 4 }}>
        {signs.map((s, i) => (
          <View key={i} style={{ borderRadius: 10, overflow: 'hidden', backgroundColor: '#F0F0F0', padding: 4 }}>
            {s}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function DiagramBlock({ diagram }: { diagram: React.ReactElement }) {
  return (
    <View style={{ borderRadius: 12, overflow: 'hidden', marginVertical: 10 }}>
      {diagram}
    </View>
  );
}

function SectionCard({ section, theme }: { section: ManualSection; theme: ReturnType<typeof useTheme> }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <View style={[ms.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <TouchableOpacity style={ms.sectionHeader} onPress={() => setExpanded(e => !e)} activeOpacity={0.7}>
        <Text style={[ms.sectionSubtitle, { color: theme.textPrimary }]}>{section.subtitle}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={theme.textSecondary} />
      </TouchableOpacity>

      {expanded && (
        <>
          {section.legalRef && (
            <Text style={[ms.legalRef, { color: theme.blue, backgroundColor: theme.blue + '12' }]}>
              {section.legalRef}
            </Text>
          )}
          {section.intro && (
            <Text style={[ms.intro, { color: theme.textSecondary }]}>{section.intro}</Text>
          )}
          {section.signs && <SignRow signs={section.signs} />}
          {section.diagram && <DiagramBlock diagram={section.diagram} />}
          {section.rules.map((rule, i) => (
            <View key={i} style={ms.ruleRow}>
              <View style={[ms.ruleDot, { backgroundColor: theme.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={[ms.ruleText, { color: theme.textPrimary }]}>{rule.text}</Text>
                {rule.sub && <Text style={[ms.ruleSub, { color: theme.textSecondary }]}>{rule.sub}</Text>}
              </View>
            </View>
          ))}
          {section.note && (
            <View style={[ms.noteBox, { backgroundColor: theme.yellow + '20', borderLeftColor: theme.yellow }]}>
              <Ionicons name="information-circle" size={16} color={theme.yellow} style={{ marginTop: 1 }} />
              <Text style={[ms.noteText, { color: theme.textPrimary }]}>{section.note}</Text>
            </View>
          )}
          {section.warning && (
            <View style={[ms.warningBox, { backgroundColor: theme.wrong + '12', borderLeftColor: theme.wrong }]}>
              <Ionicons name="warning" size={16} color={theme.wrong} style={{ marginTop: 1 }} />
              <Text style={[ms.warningText, { color: theme.wrong }]}>{section.warning}</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

function ChapterView({ chapter, onBack, theme }: { chapter: ManualChapter; onBack: () => void; theme: ReturnType<typeof useTheme> }) {
  const openUrl = (url: string) => {
    Alert.alert(
      'Recurso oficial',
      `Se abrirá: ${url}`,
      [
        { text: 'Abrir', onPress: () => Linking.openURL(url) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={[ms.safe, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ms.content}>
        <TouchableOpacity onPress={onBack} style={ms.backBtn}>
          <Ionicons name="arrow-back" size={16} color={theme.primary} />
          <Text style={[ms.backTxt, { color: theme.primary }]}>Manual</Text>
        </TouchableOpacity>

        <LinearGradient colors={[chapter.color + '22', chapter.color + '05']} style={ms.chapterHeader}>
          <View style={[ms.chapterIconCircle, { backgroundColor: chapter.color + '20' }]}>
            <Ionicons name={chapter.icon} size={36} color={chapter.color} />
          </View>
          <Text style={[ms.chapterTitle, { color: theme.textPrimary }]}>{chapter.title}</Text>
          <Text style={[ms.chapterSummary, { color: theme.textSecondary }]}>{chapter.summary}</Text>
          <View style={[ms.legalBadge, { backgroundColor: chapter.color + '15' }]}>
            <Ionicons name="document-text" size={11} color={chapter.color} />
            <Text style={[ms.legalBadgeTxt, { color: chapter.color }]}>{chapter.legalRef}</Text>
          </View>
        </LinearGradient>

        {chapter.sections.map((section, i) => (
          <SectionCard key={i} section={section} theme={theme} />
        ))}

        <TouchableOpacity
          style={[ms.officialBtn, { backgroundColor: '#1A237E' }]}
          onPress={() => openUrl('https://www.boe.es/buscar/act.php?id=BOE-A-2003-23514')}
        >
          <Ionicons name="open-outline" size={16} color="#fff" />
          <Text style={ms.officialBtnTxt}>Reglamento General de Circulación (BOE)</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── PANTALLA PRINCIPAL ─────────────────────────────────────────

export default function ManualScreen() {
  const [selectedChapter, setSelectedChapter] = useState<ManualChapter | null>(null);
  const theme = useTheme();

  if (selectedChapter) {
    return <ChapterView chapter={selectedChapter} onBack={() => setSelectedChapter(null)} theme={theme} />;
  }

  const openUrl = (url: string) => Linking.openURL(url).catch(() => {
    Alert.alert('Error', 'No se pudo abrir el enlace. Comprueba tu conexión a internet.');
  });

  return (
    <SafeAreaView style={[ms.safe, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ms.content}>

        {/* Hero */}
        <LinearGradient colors={['#1A237E', '#283593']} style={ms.hero}>
          <Ionicons name="library" size={48} color="#ffffff" />
          <Text style={ms.heroTitle}>Manual del Conductor</Text>
          <Text style={ms.heroSub}>
            16 capítulos basados en la normativa oficial española.{'\n'}
            Todo lo que necesitas saber para aprobar y conducir con seguridad.
          </Text>
          <View style={[ms.heroBadge]}>
            <Ionicons name="shield-checkmark" size={13} color="#90CAF9" />
            <Text style={ms.heroBadgeTxt}>Basado en RGC, LSV y normativa DGT vigente</Text>
          </View>
        </LinearGradient>

        {/* Aviso legal */}
        <View style={[ms.legalNote, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="information-circle-outline" size={16} color={theme.textSecondary} />
          <Text style={[ms.legalNoteText, { color: theme.textSecondary }]}>
            Contenido de elaboración propia basado en la normativa oficial. Para el texto legal completo, consulta el BOE o el Manual del Conductor publicado por la DGT.
          </Text>
        </View>

        {/* Chapters */}
        <Text style={[ms.sectionTitle, { color: theme.textPrimary }]}>Capítulos</Text>
        {CHAPTERS.map(chapter => (
          <TouchableOpacity
            key={chapter.id}
            style={[ms.chapterCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setSelectedChapter(chapter)}
            activeOpacity={0.85}
          >
            <View style={[ms.chapterCardIcon, { backgroundColor: chapter.color + '18' }]}>
              <Ionicons name={chapter.icon} size={24} color={chapter.color} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[ms.chapterCardTitle, { color: theme.textPrimary }]}>{chapter.title}</Text>
              <Text style={[ms.chapterCardSummary, { color: theme.textSecondary }]} numberOfLines={1}>{chapter.summary}</Text>
              <Text style={[ms.chapterCardRef, { color: chapter.color }]}>{chapter.legalRef}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        ))}

        {/* Official resources */}
        <Text style={[ms.sectionTitle, { color: theme.textPrimary }]}>Recursos oficiales</Text>
        {[
          { label: 'Reglamento General de Circulación (RGC)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23514', icon: 'document-text-outline' as const },
          { label: 'Ley de Tráfico y Seguridad Vial (LSV)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-8197', icon: 'document-text-outline' as const },
          { label: 'Normas de tráfico — DGT', url: 'https://www.dgt.es/muevete-con-seguridad/conoce-las-normas-de-trafico/', icon: 'globe-outline' as const },
          { label: 'Infracciones y sanciones — DGT', url: 'https://www.dgt.es/nuestros-servicios/multas-y-sanciones/conoce-los-tipos-de-infracciones-y-sanciones/', icon: 'alert-circle-outline' as const },
          { label: 'Distintivo ambiental — DGT', url: 'https://www.dgt.es/nuestros-servicios/tu-vehiculo/tus-vehiculos/distintivo-ambiental/', icon: 'leaf-outline' as const },
        ].map(({ label, url, icon }) => (
          <TouchableOpacity
            key={url}
            style={[ms.linkCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => openUrl(url)}
            activeOpacity={0.85}
          >
            <Ionicons name={icon} size={18} color={theme.blue} />
            <Text style={[ms.linkLabel, { color: theme.textPrimary }]}>{label}</Text>
            <Ionicons name="open-outline" size={16} color={theme.textTertiary} />
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── ESTILOS ────────────────────────────────────────────────────

const ms = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 10 },
  hero: { borderRadius: 20, padding: 24, alignItems: 'center', gap: 10 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  heroSub: { fontSize: 13, color: '#FFFFFFCC', textAlign: 'center', lineHeight: 20 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFFFFF15', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  heroBadgeTxt: { color: '#90CAF9', fontSize: 11, fontWeight: '600' },
  legalNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 12, padding: 12, borderWidth: 1 },
  legalNoteText: { flex: 1, fontSize: 12, lineHeight: 18 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 4 },
  chapterCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, borderWidth: 1 },
  chapterCardIcon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  chapterCardTitle: { fontSize: 14, fontWeight: '700' },
  chapterCardSummary: { fontSize: 12 },
  chapterCardRef: { fontSize: 10, fontWeight: '600' },
  linkCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 14, borderWidth: 1 },
  linkLabel: { flex: 1, fontSize: 13 },
  // Chapter view
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  backTxt: { fontSize: 15, fontWeight: '600' },
  chapterHeader: { borderRadius: 18, padding: 22, alignItems: 'center', gap: 8 },
  chapterIconCircle: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  chapterTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  chapterSummary: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  legalBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  legalBadgeTxt: { fontSize: 10, fontWeight: '600' },
  // Section card
  sectionCard: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 0 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionSubtitle: { fontSize: 14, fontWeight: '700', flex: 1, paddingRight: 8 },
  legalRef: { fontSize: 10, fontWeight: '600', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  intro: { fontSize: 13, lineHeight: 19, marginBottom: 8 },
  ruleRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 5, borderTopWidth: 0.5, borderTopColor: '#88888820' },
  ruleDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  ruleText: { fontSize: 13, fontWeight: '500', flex: 1, lineHeight: 19 },
  ruleSub: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  noteBox: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', borderRadius: 10, padding: 10, borderLeftWidth: 3, marginTop: 8 },
  noteText: { flex: 1, fontSize: 12, lineHeight: 18 },
  warningBox: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', borderRadius: 10, padding: 10, borderLeftWidth: 3, marginTop: 8 },
  warningText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  officialBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, padding: 14, justifyContent: 'center' },
  officialBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
