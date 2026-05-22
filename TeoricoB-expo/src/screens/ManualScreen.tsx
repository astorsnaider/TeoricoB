/**
 * Manual del Conductor — TeoricoB
 * Contenido basado en el Reglamento General de Circulación (RD 1428/2003),
 * la Ley sobre Tráfico (RDL 6/2015) y la normativa DGT vigente.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Linking, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { TrafficSign } from '../components/TrafficSign';
import { ALL_SIGN_GROUPS, CatalogSign, SignType } from '../data/signCatalog';
import {
  DiagramInterseccionDerecha, DiagramRotonda, DiagramAdelantamiento,
  DiagramDistanciaSeguridad, DiagramLuces, DiagramParadaEstacionamiento,
} from '../components/RoadScenario';

// ─── SECCIÓN SEÑALES ─────────────────────────────────────────────

function SignCard({ sign, theme }: { sign: CatalogSign; theme: ReturnType<typeof useTheme> }) {
  const [expanded, setExpanded] = useState(false);
  const typeColors: Record<SignType, string> = {
    peligro:    '#E63946',
    prohibicion:'#C62828',
    obligacion: '#1565C0',
    indicacion: '#006633',
    semaforo:   '#E65100',
    marca:      '#37474F',
  };
  const typeLabels: Record<SignType, string> = {
    peligro:    'Peligro',
    prohibicion:'Prohibición',
    obligacion: 'Obligación',
    indicacion: 'Indicación',
    semaforo:   'Semáforo',
    marca:      'Marca vial',
  };
  const color = typeColors[sign.type];

  return (
    <View style={[sc.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={sc.main}>
        {/* Sign SVG */}
        <View style={[sc.signBox, { backgroundColor: theme.bg2 }]}>
          <TrafficSign signId={sign.signId} size={72} />
        </View>
        {/* Info */}
        <View style={sc.info}>
          <View style={[sc.codeBadge, { backgroundColor: color + '18' }]}>
            <Text style={[sc.code, { color }]}>{sign.code}</Text>
          </View>
          <Text style={[sc.name, { color: theme.textPrimary }]}>{sign.name}</Text>
          {sign.legalRef && (
            <Text style={[sc.legal, { color: theme.textTertiary }]}>{sign.legalRef}</Text>
          )}
        </View>
        <TouchableOpacity onPress={() => setExpanded(e => !e)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textTertiary} />
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={sc.expanded}>
          <View style={[sc.divider, { backgroundColor: theme.border }]} />
          <Text style={[sc.sectionLabel, { color: theme.textTertiary }]}>Qué significa</Text>
          <Text style={[sc.descText, { color: theme.textSecondary }]}>{sign.description}</Text>
          <View style={[sc.actionBox, { backgroundColor: color + '10', borderLeftColor: color }]}>
            <Ionicons name="car" size={14} color={color} />
            <View style={{ flex: 1 }}>
              <Text style={[sc.actionLabel, { color }]}>Qué debes hacer</Text>
              <Text style={[sc.actionText, { color: theme.textPrimary }]}>{sign.action}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function SignGroupView({ group, theme, onBack }: {
  group: typeof ALL_SIGN_GROUPS[0];
  theme: ReturnType<typeof useTheme>;
  onBack: () => void;
}) {
  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Ionicons name="arrow-back" size={16} color={theme.primary} />
          <Text style={[s.backTxt, { color: theme.primary }]}>Señales</Text>
        </TouchableOpacity>

        <LinearGradient colors={[group.color + '22', group.color + '04']} style={s.groupHeader}>
          <View style={[s.groupIconBg, { backgroundColor: group.color + '20' }]}>
            <Ionicons name="warning-outline" size={32} color={group.color} />
          </View>
          <Text style={[s.groupTitle, { color: theme.textPrimary }]}>{group.title}</Text>
          <Text style={[s.groupSubtitle, { color: theme.textSecondary }]}>{group.subtitle}</Text>
          <Text style={[s.groupCount, { color: group.color }]}>{group.signs.length} señales</Text>
        </LinearGradient>

        <Text style={[s.tapHint, { color: theme.textTertiary }]}>
          Pulsa sobre una señal para ver su significado completo
        </Text>

        {group.signs.map((sign, i) => (
          <SignCard key={`${sign.code}-${i}`} sign={sign} theme={theme} />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── SECCIÓN NORMATIVA ───────────────────────────────────────────

interface RuleSection {
  title: string;
  rules: { text: string; sub?: string }[];
  note?: string;
  warning?: string;
  diagram?: React.ReactElement;
  legalRef?: string;
}

interface NormChapter {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  sections: RuleSection[];
}

const NORM_CHAPTERS: NormChapter[] = [
  {
    id: 'velocidad', title: 'Velocidad', icon: 'speedometer-outline', color: '#E65100',
    sections: [
      {
        title: 'Límites genéricos para turismos',
        legalRef: 'Art. 48 LSV · Instrucción 2021/V-046 DGT',
        rules: [
          { text: 'Autopistas y autovías: 120 km/h máximo · 60 km/h mínimo' },
          { text: 'Carreteras convencionales: 90 km/h (70 sin arcén practicable)' },
          { text: 'Travesías (carretera en núcleo urbano): 50 km/h' },
          { text: 'Vías urbanas con 2+ carriles por sentido: 50 km/h' },
          { text: 'Calles urbanas de 1 carril por sentido con aceras: 30 km/h', sub: 'Desde mayo 2021 (uno de los cambios más preguntados en el examen DGT)' },
          { text: 'Zonas de coexistencia (zona 20): 20 km/h', sub: 'Peatones y ciclistas tienen prioridad absoluta' },
        ],
        warning: 'El cambio de 2021 reduce el límite a 30 km/h en calles de un carril por sentido. Es el error más frecuente en el examen. No confundas con el límite genérico de 50 km/h.',
      },
      {
        title: 'Límites especiales',
        legalRef: 'Anexo XI LSV',
        rules: [
          { text: 'Conductores noveles (primeros 2 años): máximo 100 km/h en autopista' },
          { text: 'Vehículos con remolque >750 kg: 80 km/h en autopista, 70 en carretera' },
          { text: 'Camiones >3.500 kg: 100 km/h en autopista, 80 en carretera' },
          { text: 'Autobuses: 100 km/h en autopista, 90 en carretera' },
        ],
      },
      {
        title: 'Física del frenado',
        rules: [
          { text: 'La distancia de frenado aumenta con el CUADRADO de la velocidad' },
          { text: 'Al doblar la velocidad, necesitas CUATRO veces más distancia para frenar' },
          { text: 'A 50 km/h: ~14 m en seco · A 100 km/h: ~55 m en seco · A 120 km/h: ~80 m en seco' },
          { text: 'Con lluvia: multiplica la distancia de frenado por 2' },
          { text: 'Con hielo o nieve: multiplica la distancia de frenado por 5 a 10' },
        ],
        note: 'Distancia total de detención = distancia de reacción + distancia de frenado. A 90 km/h con 1 segundo de reacción, ya has recorrido 25 m antes de empezar a frenar.',
      },
    ],
  },
  {
    id: 'prioridad', title: 'Prioridad de Paso', icon: 'git-merge-outline', color: '#2E7D32',
    sections: [
      {
        title: 'Jerarquía: quién manda sobre quién',
        legalRef: 'Art. 5 LSV',
        rules: [
          { text: '1.º Agentes de tráfico', sub: 'Prioridad absoluta. Si contradicen una señal, obedece al agente.' },
          { text: '2.º Semáforos y señales variables' },
          { text: '3.º Señales verticales fijas (STOP, Ceda el Paso…)' },
          { text: '4.º Marcas viales (líneas, símbolos en el asfalto)' },
          { text: '5.º Norma general de la derecha' },
        ],
        diagram: <DiagramInterseccionDerecha />,
      },
      {
        title: 'Rotondas',
        legalRef: 'Art. 57 RGC',
        rules: [
          { text: 'El que ya está dentro de la rotonda tiene PRIORIDAD sobre el que quiere entrar' },
          { text: 'Al entrar: cede el paso al tráfico interior' },
          { text: 'Al salir: señaliza con el intermitente derecho' },
        ],
        diagram: <DiagramRotonda />,
        note: 'En rotondas NO aplica la regla "quien viene por la derecha tiene prioridad". El de dentro siempre tiene preferencia.',
      },
      {
        title: 'Pasos a nivel — Tren tiene prioridad absoluta',
        legalRef: 'Art. 83 RGC',
        rules: [
          { text: 'El ferrocarril tiene prioridad absoluta. Cede siempre.' },
          { text: 'Cuando bajen las barreras o haya señal roja: para completamente' },
          { text: 'Nunca te detengas sobre las vías' },
          { text: 'Paso a nivel sin barreras: para, mira y escucha en ambas direcciones' },
        ],
        warning: 'Si el vehículo se avería sobre las vías: evacúa a todos los ocupantes inmediatamente, aléjate y llama al 112.',
      },
    ],
  },
  {
    id: 'adelantamiento', title: 'Adelantamiento', icon: 'car-outline', color: '#1565C0',
    sections: [
      {
        title: 'Cómo adelantar correctamente',
        legalRef: 'Art. 82 RGC',
        rules: [
          { text: '1. Comprueba que el adelantamiento está permitido (sin señal R-305, sin línea continua)' },
          { text: '2. Señaliza con el INTERMITENTE IZQUIERDO' },
          { text: '3. Comprueba que no hay vehículos detrás adelantando' },
          { text: '4. Verifica que no viene tráfico de frente con velocidad o cantidad que impida la maniobra' },
          { text: '5. Aumenta la velocidad, desplázate al carril izquierdo y rebasa' },
          { text: '6. Señaliza con el INTERMITENTE DERECHO y regresa al carril' },
        ],
        diagram: <DiagramAdelantamiento />,
      },
      {
        title: 'Cuándo está PROHIBIDO adelantar',
        legalRef: 'Art. 84 RGC',
        rules: [
          { text: 'Hay señal R-305 (prohibición de adelantamiento) o línea continua' },
          { text: 'En curvas o cambios de rasante sin visibilidad, aunque no haya línea continua' },
          { text: 'En pasos a nivel' },
          { text: 'En pasos de peatones con peatones cruzando' },
          { text: 'Cuando hacerlo obligaría al vehículo contrario a variar trayectoria o velocidad' },
        ],
        warning: 'Adelantar en curva sin visibilidad es causa frecuente de accidentes mortales. Si tienes dudas, no adelantes.',
      },
      {
        title: 'Distancia lateral mínima al adelantar ciclistas',
        legalRef: 'Art. 84 RGC (Ley 6/2014)',
        rules: [
          { text: 'Distancia mínima obligatoria: 1,5 metros' },
          { text: 'Puedes invadir el carril contrario para garantizar esta distancia' },
          { text: 'Si no puedes mantener 1,5 m: no adelantes, espera' },
        ],
      },
    ],
  },
  {
    id: 'distancia', title: 'Distancia de Seguridad', icon: 'resize-outline', color: '#37474F',
    sections: [
      {
        title: 'Qué es y cómo calcularla',
        legalRef: 'Art. 54 RGC',
        rules: [
          { text: 'Es la distancia necesaria para frenar sin colisionar si el vehículo de delante frena bruscamente' },
          { text: 'Depende de: velocidad, estado del vehículo, condiciones de la vía y tiempo de reacción' },
          { text: 'Regla de los 2 segundos: cuenta 2 segundos desde que el vehículo de delante pasa un punto fijo' },
          { text: 'En autopista a >100 km/h: mínimo 50 metros obligatorios' },
        ],
        diagram: <DiagramDistanciaSeguridad />,
      },
    ],
  },
  {
    id: 'luces', title: 'Uso de Luces', icon: 'flashlight-outline', color: '#F57F17',
    sections: [
      {
        title: 'Cuándo usar cada tipo de luz',
        legalRef: 'Arts. 98–115 RGC',
        rules: [
          { text: 'Luces de cruce (cortas): de noche, en túneles, con lluvia/niebla intensa o visibilidad <200 m' },
          { text: 'Luces de carretera (largas): de noche en carretera cuando no hay tráfico que puedas deslumbrar' },
          { text: 'Antiniebla delantera: solo con niebla, lluvia fuerte o nieve' },
          { text: 'Antiniebla trasera: obligatoria cuando la visibilidad es inferior a 50 metros' },
          { text: 'Luces de emergencia: al parar por avería o ante peligro súbito' },
        ],
        diagram: <DiagramLuces />,
        warning: 'Usar la antiniebla trasera con buena visibilidad puede deslumbrar y molestar. Solo úsala cuando la visibilidad sea realmente reducida.',
      },
    ],
  },
  {
    id: 'parada', title: 'Parada y Estacionamiento', icon: 'pause-circle-outline', color: '#00838F',
    sections: [
      {
        title: 'Diferencia entre parada y estacionamiento',
        legalRef: 'Art. 90 RGC',
        rules: [
          { text: 'PARADA: inmovilización por menos de 2 minutos sin abandonar el vehículo' },
          { text: 'ESTACIONAMIENTO: inmovilización por más de 2 minutos o con el conductor ausente' },
        ],
        diagram: <DiagramParadaEstacionamiento />,
      },
      {
        title: 'Dónde está prohibido parar y estacionar',
        legalRef: 'Arts. 91–94 RGC',
        rules: [
          { text: 'A menos de 5 m de una intersección o cruce' },
          { text: 'A menos de 5 m de un paso de peatones' },
          { text: 'En las proximidades de un paso a nivel (25 metros)' },
          { text: 'En curvas o cambios de rasante sin visibilidad' },
          { text: 'En doble fila' },
          { text: 'Sobre aceras, pasos peatonales y carriles bici' },
          { text: 'Delante de un vado (acceso a garaje)' },
          { text: 'En zonas reservadas (PMR, taxis, carga y descarga)' },
        ],
      },
    ],
  },
  {
    id: 'alcohol', title: 'Alcohol y Drogas', icon: 'medkit-outline', color: '#7B1FA2',
    sections: [
      {
        title: 'Tasas de alcoholemia permitidas',
        legalRef: 'Art. 20 RGC · RD 1217/2009',
        rules: [
          { text: 'Conductores en general: 0,5 g/l en sangre · 0,25 mg/l en aire' },
          { text: 'Conductores noveles (<2 años) y profesionales: 0,3 g/l · 0,15 mg/l' },
          { text: 'Superar 1,2 g/l en sangre: delito penal (no solo infracción administrativa)' },
        ],
        warning: 'Negarse a la prueba de alcoholemia es infracción MUY GRAVE, equivalente a superar 1,2 g/l. Puede conllevar detención.',
      },
      {
        title: 'Efectos sobre la conducción',
        rules: [
          { text: 'Aumenta el tiempo de reacción (con 0,5 g/l puede aumentar más del 30%)' },
          { text: 'Reduce la concentración y el campo visual' },
          { text: 'Distorsiona la percepción de distancias y velocidades' },
          { text: 'Genera exceso de confianza (efecto paradójico)' },
          { text: 'Solo el tiempo elimina el alcohol: ni café, ni agua, ni ejercicio aceleran el proceso' },
        ],
        note: 'El organismo elimina el alcohol a ~0,10–0,15 g/l por hora. Si bebes hasta las 2 de la madrugada y el límite es 0,5 g/l, puedes estar por encima del límite a las 8 de la mañana.',
      },
    ],
  },
  {
    id: 'accidentes', title: 'Accidentes y Primeros Auxilios', icon: 'pulse-outline', color: '#B71C1C',
    sections: [
      {
        title: 'Protocolo PAS',
        legalRef: 'Art. 129 LSV',
        rules: [
          { text: 'PROTEGER: ponerse el chaleco ANTES de salir, señalizar el accidente, aparcar en zona segura', sub: 'Activa el V-16 desde el interior o coloca los triángulos a 50 m' },
          { text: 'AVISAR: llamar al 112 con: localización, número de heridos, si hay atrapados, riesgo de incendio' },
          { text: 'SOCORRER: atender a los heridos SIN moverlos, salvo peligro inmediato de muerte' },
        ],
        warning: 'No mover a un herido puede ser la diferencia entre recuperarse o quedar paralizado por lesión medular.',
      },
      {
        title: 'RCP — Reanimación Cardiopulmonar',
        legalRef: 'Guías ERC 2021',
        rules: [
          { text: '30 compresiones: profundidad 5-6 cm, ritmo 100-120/minuto, manos entrelazadas en el centro del pecho' },
          { text: '2 respiraciones boca a boca: inclina la cabeza, eleva el mentón, sella la boca, insufla 1 segundo' },
          { text: 'Repite la secuencia 30+2 sin descanso hasta que llegue la ayuda' },
          { text: 'Si hay desfibrilador (DEA): úsalo lo antes posible' },
        ],
      },
      {
        title: 'Lo que NUNCA debes hacer',
        rules: [
          { text: 'Mover al herido sin causa de fuerza mayor' },
          { text: 'Quitar el casco a un motorista consciente' },
          { text: 'Dar de beber o medicamentos a un herido inconsciente' },
          { text: 'Abandonar el lugar del accidente si has participado (delito de fuga)' },
        ],
      },
    ],
  },
  {
    id: 'infracciones', title: 'Infracciones y Puntos', icon: 'alert-circle-outline', color: '#BF360C',
    sections: [
      {
        title: 'Sistema de puntos',
        legalRef: 'Ley 17/2005',
        rules: [
          { text: 'Inicio: 12 puntos (noveles: 8 puntos en los primeros 2 años)' },
          { text: 'Si pierdes todos los puntos: el permiso queda revocado' },
          { text: 'Para recuperarlo: 2 años de espera + curso de sensibilización + examen de aptitud' },
          { text: 'Recuperación voluntaria de puntos: hasta 2 puntos con cursos (máximo 15 en total)' },
        ],
      },
      {
        title: 'Infracciones y puntos perdidos',
        legalRef: 'Cuadro de sanciones LSV',
        rules: [
          { text: '6 puntos: semáforo rojo · alcohol/drogas · velocidad >60 km/h del límite · móvil con la mano · no respetar paso peatones · circular sin seguro · no llevar casco' },
          { text: '4 puntos: velocidad 41-60 km/h del límite · no cinturón · adelantamiento peligroso' },
          { text: '3 puntos: velocidad 21-40 km/h del límite · neumáticos en mal estado' },
          { text: '2 puntos: circular por el arcén · no señalizar cambio de dirección · cruzar línea continua' },
        ],
      },
      {
        title: 'Multas por velocidad',
        legalRef: 'Anexo IV LSV',
        rules: [
          { text: '1-20 km/h sobre el límite: 100 euros' },
          { text: '21-30 km/h: 200 euros + 3 puntos' },
          { text: '31-40 km/h: 300 euros + 3 puntos' },
          { text: '41-50 km/h: 400 euros + 4 puntos' },
          { text: '51-60 km/h: 500 euros + 4 puntos' },
          { text: 'Más de 60 km/h: 600 euros + 6 puntos (puede conllevar retirada del permiso)' },
        ],
        note: 'Si pagas en los 20 días hábiles siguientes a la notificación: descuento del 50%. Al pagar con descuento, renuncias al recurso, pero los puntos se descuentan igualmente.',
      },
    ],
  },
];

function NormChapterView({ chapter, theme, onBack }: {
  chapter: NormChapter;
  theme: ReturnType<typeof useTheme>;
  onBack: () => void;
}) {
  const openUrl = (url: string) => Linking.openURL(url).catch(() =>
    Alert.alert('Error', 'No se pudo abrir el enlace.')
  );

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Ionicons name="arrow-back" size={16} color={theme.primary} />
          <Text style={[s.backTxt, { color: theme.primary }]}>Normativa</Text>
        </TouchableOpacity>

        <LinearGradient colors={[chapter.color + '22', chapter.color + '04']} style={s.groupHeader}>
          <View style={[s.groupIconBg, { backgroundColor: chapter.color + '20' }]}>
            <Ionicons name={chapter.icon} size={32} color={chapter.color} />
          </View>
          <Text style={[s.groupTitle, { color: theme.textPrimary }]}>{chapter.title}</Text>
        </LinearGradient>

        {chapter.sections.map((section, si) => (
          <View key={si} style={[s.normSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[s.normSectionTitle, { color: theme.textPrimary }]}>{section.title}</Text>
            {section.legalRef && (
              <Text style={[s.normLegal, { color: chapter.color, backgroundColor: chapter.color + '10' }]}>
                {section.legalRef}
              </Text>
            )}
            {section.diagram && (
              <View style={[s.diagramBox, { borderRadius: 12, overflow: 'hidden' }]}>
                {section.diagram}
              </View>
            )}
            {section.rules.map((rule, ri) => (
              <View key={ri} style={[s.ruleRow, { borderTopColor: theme.border }]}>
                <View style={[s.ruleDot, { backgroundColor: chapter.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.ruleText, { color: theme.textPrimary }]}>{rule.text}</Text>
                  {rule.sub && <Text style={[s.ruleSub, { color: theme.textSecondary }]}>{rule.sub}</Text>}
                </View>
              </View>
            ))}
            {section.note && (
              <View style={[s.noteBox, { backgroundColor: theme.yellow + '18', borderLeftColor: theme.yellow }]}>
                <Ionicons name="information-circle" size={15} color={theme.yellow} />
                <Text style={[s.noteText, { color: theme.textPrimary }]}>{section.note}</Text>
              </View>
            )}
            {section.warning && (
              <View style={[s.warnBox, { backgroundColor: theme.wrong + '12', borderLeftColor: theme.wrong }]}>
                <Ionicons name="warning" size={15} color={theme.wrong} />
                <Text style={[s.warnText, { color: theme.wrong }]}>{section.warning}</Text>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[s.officialBtn, { backgroundColor: '#1A237E' }]}
          onPress={() => openUrl('https://www.boe.es/buscar/act.php?id=BOE-A-2003-23514')}
        >
          <Ionicons name="open-outline" size={15} color="#fff" />
          <Text style={s.officialBtnTxt}>Reglamento General de Circulación — BOE</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── PANTALLA PRINCIPAL ──────────────────────────────────────────

type MainView = 'home' | { type: 'signs'; groupIndex: number } | { type: 'norm'; chapterId: string };

export default function ManualScreen() {
  const [view, setView] = useState<MainView>('home');
  const theme = useTheme();

  const openUrl = (url: string) => Linking.openURL(url).catch(() =>
    Alert.alert('Error', 'No se pudo abrir el enlace. Comprueba tu conexión.')
  );

  if (view !== 'home' && typeof view === 'object') {
    if (view.type === 'signs') {
      const group = ALL_SIGN_GROUPS[view.groupIndex];
      return <SignGroupView group={group} theme={theme} onBack={() => setView('home')} />;
    }
    if (view.type === 'norm') {
      const chapter = NORM_CHAPTERS.find(c => c.id === view.chapterId);
      if (chapter) return <NormChapterView chapter={chapter} theme={theme} onBack={() => setView('home')} />;
    }
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Hero */}
        <LinearGradient colors={['#1A237E', '#283593']} style={s.hero}>
          <Ionicons name="library" size={44} color="#fff" />
          <Text style={s.heroTitle}>Manual del Conductor</Text>
          <Text style={s.heroSub}>Señales, normativa y diagramas basados en el RGC y la LSV</Text>
          <View style={s.heroBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#90CAF9" />
            <Text style={s.heroBadgeTxt}>Contenido verificado según normativa vigente 2026</Text>
          </View>
        </LinearGradient>

        {/* Notice */}
        <View style={[s.notice, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="information-circle-outline" size={15} color={theme.textTertiary} />
          <Text style={[s.noticeTxt, { color: theme.textSecondary }]}>
            Contenido de elaboración propia basado en la normativa oficial. Para el texto legal completo, consulta el BOE o los recursos oficiales de la DGT.
          </Text>
        </View>

        {/* SEÑALES */}
        <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Señales de Tráfico</Text>
        <Text style={[s.sectionSub, { color: theme.textSecondary }]}>
          Cada señal con su significado completo y qué debes hacer al verla
        </Text>

        {ALL_SIGN_GROUPS.map((group, i) => (
          <TouchableOpacity
            key={group.type}
            style={[s.chapterCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setView({ type: 'signs', groupIndex: i })}
            activeOpacity={0.85}
          >
            <View style={[s.chapterIcon, { backgroundColor: group.color + '18' }]}>
              <Ionicons name="warning-outline" size={22} color={group.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.chapterTitle, { color: theme.textPrimary }]}>{group.title}</Text>
              <Text style={[s.chapterSub, { color: theme.textSecondary }]} numberOfLines={1}>{group.subtitle}</Text>
              <Text style={[s.chapterCount, { color: group.color }]}>{group.signs.length} señales</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        ))}

        {/* NORMATIVA */}
        <Text style={[s.sectionTitle, { color: theme.textPrimary, marginTop: 8 }]}>Normativa</Text>
        <Text style={[s.sectionSub, { color: theme.textSecondary }]}>
          Reglas completas del RGC con diagramas y ejemplos
        </Text>

        {NORM_CHAPTERS.map(chapter => (
          <TouchableOpacity
            key={chapter.id}
            style={[s.chapterCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setView({ type: 'norm', chapterId: chapter.id })}
            activeOpacity={0.85}
          >
            <View style={[s.chapterIcon, { backgroundColor: chapter.color + '18' }]}>
              <Ionicons name={chapter.icon} size={22} color={chapter.color} />
            </View>
            <Text style={[s.chapterTitle, { color: theme.textPrimary }]}>{chapter.title}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        ))}

        {/* Official links */}
        <Text style={[s.sectionTitle, { color: theme.textPrimary, marginTop: 8 }]}>Recursos oficiales</Text>
        {[
          { label: 'Reglamento General de Circulación (BOE)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23514', icon: 'document-text-outline' as const },
          { label: 'Ley de Tráfico y Seguridad Vial (BOE)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-8197', icon: 'document-text-outline' as const },
          { label: 'Normas de tráfico — DGT', url: 'https://www.dgt.es/muevete-con-seguridad/conoce-las-normas-de-trafico/', icon: 'globe-outline' as const },
          { label: 'Infracciones y sanciones — DGT', url: 'https://www.dgt.es/nuestros-servicios/multas-y-sanciones/conoce-los-tipos-de-infracciones-y-sanciones/', icon: 'alert-circle-outline' as const },
          { label: 'Distintivo ambiental — DGT', url: 'https://www.dgt.es/nuestros-servicios/tu-vehiculo/tus-vehiculos/distintivo-ambiental/', icon: 'leaf-outline' as const },
        ].map(({ label, url, icon }) => (
          <TouchableOpacity
            key={url}
            style={[s.linkCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => openUrl(url)}
            activeOpacity={0.85}
          >
            <Ionicons name={icon} size={17} color={theme.blue} />
            <Text style={[s.linkLabel, { color: theme.textPrimary }]}>{label}</Text>
            <Ionicons name="open-outline" size={15} color={theme.textTertiary} />
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────────

const sc = StyleSheet.create({
  card: { borderRadius: 14, padding: 14, borderWidth: 1 },
  main: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  signBox: { width: 84, height: 84, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  info: { flex: 1, gap: 3 },
  codeBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  code: { fontSize: 11, fontWeight: '700' },
  name: { fontSize: 14, fontWeight: '700', lineHeight: 19 },
  legal: { fontSize: 10 },
  expanded: { gap: 8, marginTop: 10 },
  divider: { height: 0.5, marginBottom: 4 },
  sectionLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  descText: { fontSize: 13, lineHeight: 20 },
  actionBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 10, padding: 10, borderLeftWidth: 3 },
  actionLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  actionText: { fontSize: 13, lineHeight: 19, fontWeight: '500' },
});

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 10 },
  hero: { borderRadius: 20, padding: 22, alignItems: 'center', gap: 8 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center' },
  heroSub: { fontSize: 13, color: '#ffffffCC', textAlign: 'center', lineHeight: 19 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#ffffff18', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  heroBadgeTxt: { color: '#90CAF9', fontSize: 11, fontWeight: '600' },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 12, padding: 12, borderWidth: 1 },
  noticeTxt: { flex: 1, fontSize: 11, lineHeight: 17 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 4 },
  sectionSub: { fontSize: 12, marginTop: -6 },
  tapHint: { fontSize: 12, textAlign: 'center', marginBottom: 4 },
  chapterCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, borderWidth: 1 },
  chapterIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  chapterTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  chapterSub: { fontSize: 12 },
  chapterCount: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  linkCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 14, borderWidth: 1 },
  linkLabel: { flex: 1, fontSize: 13 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  backTxt: { fontSize: 15, fontWeight: '600' },
  groupHeader: { borderRadius: 18, padding: 20, alignItems: 'center', gap: 8 },
  groupIconBg: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  groupTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  groupSubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  groupCount: { fontSize: 13, fontWeight: '700' },
  // Norm chapter
  normSection: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 0 },
  normSectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  normLegal: { fontSize: 10, fontWeight: '600', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  diagramBox: { marginVertical: 8 },
  ruleRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 7, borderTopWidth: 0.5 },
  ruleDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7, flexShrink: 0 },
  ruleText: { fontSize: 13, fontWeight: '500', lineHeight: 19, flex: 1 },
  ruleSub: { fontSize: 11, marginTop: 2, lineHeight: 16 },
  noteBox: { flexDirection: 'row', gap: 8, borderRadius: 10, padding: 10, borderLeftWidth: 3, marginTop: 8, alignItems: 'flex-start' },
  noteText: { flex: 1, fontSize: 12, lineHeight: 18 },
  warnBox: { flexDirection: 'row', gap: 8, borderRadius: 10, padding: 10, borderLeftWidth: 3, marginTop: 8, alignItems: 'flex-start' },
  warnText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  officialBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, padding: 14, justifyContent: 'center', marginTop: 4 },
  officialBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
