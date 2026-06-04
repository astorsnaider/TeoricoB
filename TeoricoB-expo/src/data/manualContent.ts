/**
 * Contenido del Manual del Permiso B — Teoric.
 *
 * Estructura organizada siguiendo los 17 temas oficiales del temario DGT
 * (estructura temática es de dominio público; el contenido es de elaboración
 * propia basado en la normativa publicada en el BOE).
 *
 * Fuentes:
 * - Reglamento General de Circulación (RD 1428/2003) — BOE-A-2003-23514
 * - Ley sobre Tráfico y Seguridad Vial (RDL 6/2015) — BOE-A-2015-8197
 * - Reglamento General de Conductores (RD 818/2009) — BOE-A-2009-9481
 * - Estructura temática inspirada en el Manual del Permiso B en Lectura Fácil
 *   (DGT, edición 2023), publicación oficial accesible en dgt.es.
 */

import { Ionicons } from '@expo/vector-icons';

// ─── TIPOS ───────────────────────────────────────────────────────

export type IconName = keyof typeof Ionicons.glyphMap;

export type ContentBlock =
  | { type: 'text'; content: string }
  | { type: 'list'; items: ListItem[]; ordered?: boolean }
  | { type: 'signsRow'; signIds: string[]; caption?: string }
  | { type: 'signCard'; signId: string; name: string; description: string; action?: string }
  | { type: 'quote'; text: string; source: string }
  | { type: 'tip'; text: string }
  | { type: 'warning'; text: string }
  | { type: 'table'; headers?: [string, string]; rows: Array<[string, string]> }
  | { type: 'definition'; term: string; definition: string }
  | { type: 'subsection'; title: string };

export interface ListItem {
  text: string;
  detail?: string;
  emphasis?: boolean;
}

export interface ManualSection {
  id: string;
  title: string;
  blocks: ContentBlock[];
}

export interface ManualChapter {
  id: string;
  number: number;
  title: string;
  shortDesc: string;
  icon: IconName;
  color: string;
  legalRefs: string[];
  sections: ManualSection[];
}

// ─── CAPÍTULOS ───────────────────────────────────────────────────

export const MANUAL_CHAPTERS: ManualChapter[] = [
  // ───── TEMA 1 ─────────────────────────────────────────────────
  {
    id: 'definiciones', number: 1, title: 'Definiciones',
    shortDesc: 'Tipos de vehículos, personas y categorías básicas',
    icon: 'list-outline', color: '#5C6BC0',
    legalRefs: ['Anexo I LSV', 'Art. 2 RGC'],
    sections: [
      {
        id: 'def_vehiculos', title: 'Definiciones de vehículos',
        blocks: [
          { type: 'text', content: 'Un vehículo es cualquier aparato preparado para circular por vías, calles, carreteras o terrenos. La normativa los clasifica en tres grandes grupos según su motorización y uso.' },
          { type: 'subsection', title: 'Vehículos sin motor' },
          { type: 'list', items: [
            { text: 'Vehículo de tracción animal', detail: 'Carro, coche de caballos. Conducido por animales.' },
            { text: 'Ciclo', detail: 'Vehículo de dos o más ruedas movido por la energía del conductor (pedales).' },
            { text: 'Bicicleta', detail: 'Ciclo de dos ruedas. Es el ciclo más común.' },
            { text: 'Remolque', detail: 'Plataforma con ruedas enganchada por un eje a un vehículo a motor. Se diferencia en ligero (≤750 kg) y no ligero (>750 kg).' },
            { text: 'Semirremolque', detail: 'Remolque que se acopla directamente al vehículo tractor sin eje delantero. Apoya parte de su peso en el tractor.' },
          ]},
          { type: 'subsection', title: 'Vehículos a motor' },
          { type: 'list', items: [
            { text: 'Automóvil', detail: 'Vehículo de motor que sirve para transportar personas o mercancías. Engloba turismos, furgonetas, camiones y autobuses.' },
            { text: 'Motocicleta', detail: 'Vehículo a motor de dos o tres ruedas con cilindrada superior a 50 cm³ (o velocidad máxima superior a 45 km/h).' },
            { text: 'Ciclomotor', detail: 'Vehículo a motor de dos o tres ruedas con cilindrada hasta 50 cm³ y velocidad máxima por construcción no superior a 45 km/h.' },
            { text: 'Vehículo especial', detail: 'Diseñado para trabajos o servicios específicos (tractores agrícolas, maquinaria de obras).' },
          ]},
          { type: 'tip', text: 'El permiso B permite conducir automóviles con MMA ≤ 3.500 kg y hasta 8 plazas además del conductor. NO permite motocicletas (necesitas A1, A2 o A) ni camiones grandes (C).' },
        ],
      },
      {
        id: 'def_personas', title: 'Definiciones de personas',
        blocks: [
          { type: 'definition', term: 'Conductor', definition: 'Persona que maneja un vehículo. Incluye también a la persona que guía animales sueltos o en manada por una vía.' },
          { type: 'definition', term: 'Peatón', definition: 'Persona que circula a pie por la vía. También se considera peatón quien empuja un coche de niños, una silla de ruedas, una moto o bicicleta a mano.' },
          { type: 'definition', term: 'Titular del vehículo', definition: 'Persona física o jurídica a cuyo nombre figura el vehículo en el Registro de Vehículos de la DGT.' },
          { type: 'definition', term: 'Conductor habitual', definition: 'Persona que conduce más habitualmente el vehículo. Puede coincidir o no con el titular. Es relevante para el seguro y la responsabilidad ante multas.' },
          { type: 'quote', text: 'A los efectos de esta Ley se considera peatón quien empuja o arrastra un coche de niño o de impedido o cualquier otro vehículo sin motor de pequeñas dimensiones.', source: 'Anexo I, ap. 35, LSV' },
        ],
      },
      {
        id: 'def_categorias', title: 'Categorías por uso',
        blocks: [
          { type: 'table', headers: ['Categoría', 'Uso'], rows: [
            ['Privado', 'Uso personal del titular. No genera ingresos.'],
            ['Servicio público', 'Transporte de pasajeros o mercancías por dinero (taxi, autobús, transporte mercancías).'],
            ['Servicio oficial', 'Vehículos del Estado (policía, ambulancias, bomberos).'],
            ['Vehículo de emergencia', 'Autorizados para emitir señales luminosas y acústicas especiales.'],
          ]},
          { type: 'tip', text: 'Los vehículos de emergencia con señales en uso (sirena + rotativo) tienen prioridad ABSOLUTA sobre cualquier otro vehículo.' },
        ],
      },
    ],
  },

  // ───── TEMA 2 ─────────────────────────────────────────────────
  {
    id: 'documentacion', number: 2, title: 'Documentación',
    shortDesc: 'Permisos, autorizaciones y documentos obligatorios',
    icon: 'document-text-outline', color: '#26A69A',
    legalRefs: ['Art. 1-5 RGC', 'Art. 25-33 LSV', 'RD 818/2009'],
    sections: [
      {
        id: 'doc_obligatoria', title: 'Documentación obligatoria del conductor',
        blocks: [
          { type: 'text', content: 'Todo conductor debe llevar consigo o en el vehículo los siguientes documentos. Pueden ser exigidos por los agentes de la autoridad en cualquier control.' },
          { type: 'list', ordered: true, items: [
            { text: 'Permiso de conducción', detail: 'Acredita la autorización administrativa para conducir el tipo de vehículo. En vigor y de la categoría adecuada.', emphasis: true },
            { text: 'Permiso de circulación del vehículo', detail: 'Documento que acredita que el vehículo está matriculado y registrado en la DGT. Lo emite la DGT al titular.', emphasis: true },
            { text: 'Acreditación del seguro obligatorio', detail: 'Recibo del seguro o ticket digital que demuestra cobertura de responsabilidad civil en vigor.', emphasis: true },
            { text: 'Documento Nacional de Identidad (DNI) o equivalente', detail: 'Permiso de residencia para extranjeros o pasaporte.' },
          ]},
          { type: 'tip', text: 'Desde 2022 puedes acreditar el permiso de conducir mediante la app miDGT. Ten cuidado: solo es válido en España, no en otros países.' },
        ],
      },
      {
        id: 'doc_no_obligatoria', title: 'Documentos NO obligatorios en el vehículo',
        blocks: [
          { type: 'list', items: [
            { text: 'Ficha técnica (Tarjeta ITV)', detail: 'No es obligatorio llevarla en el vehículo, pero sí debe estar disponible al pasar la ITV.' },
            { text: 'Manual del vehículo', detail: 'Recomendado pero no obligatorio.' },
            { text: 'Justificante de pago del impuesto de circulación', detail: 'No se exige llevarlo encima, aunque debe estar al corriente.' },
          ]},
          { type: 'warning', text: 'Aunque la ficha técnica no es obligatorio llevarla, conviene tenerla por si surgen reparaciones o necesitas demostrar características técnicas del vehículo.' },
        ],
      },
      {
        id: 'doc_tipos_permiso', title: 'Tipos de permiso de conducción',
        blocks: [
          { type: 'text', content: 'Cada permiso autoriza a conducir una categoría concreta de vehículos. Los más habituales:' },
          { type: 'table', headers: ['Permiso', 'Qué permite'], rows: [
            ['AM', 'Ciclomotores (hasta 50 cm³, máx. 45 km/h). Edad mínima: 15 años.'],
            ['A1', 'Motocicletas hasta 125 cm³ y 11 kW. Edad: 16 años.'],
            ['A2', 'Motocicletas hasta 35 kW. Edad: 18 años.'],
            ['A', 'Cualquier motocicleta. Edad: 20 años (con A2 desde hace 2 años) o 24 años directo.'],
            ['B', 'Automóviles ≤ 3.500 kg MMA y ≤ 8 plazas además del conductor. Edad: 18 años.'],
            ['B+E', 'B con remolque de más de 750 kg. Curso específico.'],
            ['C1', 'Camiones de 3.500 a 7.500 kg. Edad: 18 años.'],
            ['C', 'Camiones de más de 3.500 kg. Edad: 21 años.'],
            ['D1', 'Autobuses hasta 16 plazas. Edad: 21 años.'],
            ['D', 'Autobuses con más de 8 plazas. Edad: 24 años.'],
          ]},
          { type: 'quote', text: 'El permiso de conducción autoriza para conducir vehículos de motor y ciclomotores cuyas características técnicas se correspondan con los del permiso obtenido.', source: 'Art. 4 RD 818/2009' },
        ],
      },
      {
        id: 'doc_periodo_prueba', title: 'Período de prueba (conductores noveles)',
        blocks: [
          { type: 'text', content: 'Los conductores que obtienen su primer permiso entran automáticamente en un período de prueba de 2 años con condiciones más estrictas.' },
          { type: 'list', items: [
            { text: '8 puntos en lugar de 12', detail: 'Si pierdes todos, el permiso queda revocado.' },
            { text: 'Tasa de alcohol más baja', detail: '0,3 g/l en sangre (0,15 mg/l en aire) en vez de la genérica de 0,5 g/l.' },
            { text: 'Velocidad máxima en autopista', detail: '100 km/h durante el primer año en vez de los 120 km/h genéricos.', emphasis: true },
            { text: 'L de novel obligatoria', detail: 'Pegatina blanca con la letra L verde, visible desde fuera del vehículo, durante el primer año.' },
          ]},
          { type: 'warning', text: 'Si pierdes los 8 puntos en período de prueba, debes esperar 6 meses (sin reincidencia) o 12 meses (con reincidencia) antes de poder recuperar el permiso, y deberás superar un curso y un examen.' },
        ],
      },
    ],
  },

  // ───── TEMA 3 ─────────────────────────────────────────────────
  {
    id: 'estado_conductor', number: 3, title: 'El estado del conductor',
    shortDesc: 'Alcohol, drogas, fatiga y medicamentos',
    icon: 'medkit-outline', color: '#7B1FA2',
    legalRefs: ['Art. 17-22 RGC', 'RD 1217/2009', 'Art. 27-32 LSV'],
    sections: [
      {
        id: 'est_aptitud', title: 'Aptitud para conducir',
        blocks: [
          { type: 'text', content: 'Para conducir con seguridad, el conductor debe estar en plenitud de sus facultades físicas y mentales. La normativa prohíbe conducir bajo los efectos de cualquier sustancia o circunstancia que disminuya la capacidad.' },
          { type: 'quote', text: 'No podrá circular por las vías objeto de esta Ley el conductor de cualquier vehículo con tasas superiores a las reglamentariamente establecidas de bebidas alcohólicas, estupefacientes, psicotrópicos, estimulantes u otras sustancias análogas.', source: 'Art. 14 LSV' },
        ],
      },
      {
        id: 'est_alcohol', title: 'Alcohol',
        blocks: [
          { type: 'text', content: 'El alcohol es la causa principal de muerte por accidente de tráfico en España. Sus efectos comienzan desde la primera dosis: reduce reflejos, aumenta el tiempo de reacción, distorsiona la percepción y genera exceso de confianza.' },
          { type: 'subsection', title: 'Tasas máximas permitidas' },
          { type: 'table', headers: ['Tipo de conductor', 'En sangre / aire espirado'], rows: [
            ['Conductor general', '0,5 g/l  ·  0,25 mg/l'],
            ['Conductor novel (<2 años)', '0,3 g/l  ·  0,15 mg/l'],
            ['Conductor profesional', '0,3 g/l  ·  0,15 mg/l'],
          ]},
          { type: 'warning', text: 'Superar 1,2 g/l en sangre (0,60 mg/l en aire) es DELITO PENAL, no solo infracción administrativa. Conlleva multa, retirada de carné y posible prisión de hasta 6 meses.' },
          { type: 'subsection', title: 'Negarse al control' },
          { type: 'text', content: 'Negarse a realizar la prueba de alcoholemia es una infracción muy grave equivalente a haber dado positivo con tasa máxima. Es además delito penal del Art. 383 del Código Penal.' },
          { type: 'tip', text: 'El alcohol se elimina del cuerpo a un ritmo de 0,10–0,15 g/l por hora. No hay forma de acelerar el proceso: ni café, ni agua, ni ducha fría, ni ejercicio.' },
        ],
      },
      {
        id: 'est_drogas', title: 'Drogas y medicamentos',
        blocks: [
          { type: 'text', content: 'Conducir bajo el efecto de drogas (legales o ilegales) está prohibido y se controla con prueba salival en carretera.' },
          { type: 'list', items: [
            { text: 'Drogas ilegales', detail: 'Cannabis, cocaína, anfetaminas, opiáceos, etc. Cualquier presencia en saliva es infracción muy grave.' },
            { text: 'Medicamentos', detail: 'Los que llevan en el prospecto un triángulo rojo o el icono de "no conducir" pueden afectar a la conducción. Antihistamínicos, ansiolíticos, antidepresivos, analgésicos opioides...' },
          ]},
          { type: 'quote', text: 'No podrá circular por las vías objeto de esta Ley el conductor de cualquier vehículo bajo los efectos de estupefacientes, psicotrópicos, estimulantes u otras sustancias análogas.', source: 'Art. 14.1 LSV' },
          { type: 'warning', text: 'El cannabis puede detectarse en saliva hasta 30 días después del consumo en consumidores habituales. Su sola presencia en el organismo constituye infracción, aunque no haya intoxicación aguda.' },
        ],
      },
      {
        id: 'est_fatiga', title: 'Fatiga, sueño y enfermedad',
        blocks: [
          { type: 'text', content: 'La fatiga al volante reduce la atención y los reflejos de manera comparable al alcohol. El sueño es una de las principales causas de accidentes en autopista.' },
          { type: 'list', items: [
            { text: 'Señales de fatiga', detail: 'Bostezos, parpadeo lento, dificultad para mantener la velocidad o el carril, sensación de aturdimiento.' },
            { text: 'Qué hacer', detail: 'Parar en un área de descanso, dormir 15-20 minutos, tomar algo, no conducir más de 2 horas seguidas en autopista.' },
            { text: 'Enfermedad', detail: 'Si te encuentras mal, no conduzcas. La fiebre, mareos o dolor intenso afectan a la concentración.' },
          ]},
          { type: 'tip', text: 'Para combatir el sueño, la mejor solución es parar y dormir un poco (siesta del café: tomar un café y dormir 15 minutos justo después). Bajar la ventanilla o poner música alta NO funciona.' },
        ],
      },
    ],
  },

  // ───── TEMA 4 ─────────────────────────────────────────────────
  {
    id: 'obligaciones', number: 4, title: 'Obligaciones de conductores y peatones',
    shortDesc: 'Deberes básicos en la vía pública',
    icon: 'people-outline', color: '#EF6C00',
    legalRefs: ['Art. 8-13 RGC', 'Art. 121-126 RGC (peatones)'],
    sections: [
      {
        id: 'obl_conductor', title: 'Obligaciones del conductor',
        blocks: [
          { type: 'list', items: [
            { text: 'Conducir con diligencia y precaución', detail: 'Mantener el control del vehículo, evitar todo daño a terceros y respetar la prioridad de peatones.' },
            { text: 'Mantener su propia libertad de movimientos', detail: 'No usar el móvil con la mano, no comer, no realizar actividades que comprometan la conducción.' },
            { text: 'Vigilar continuamente la vía', detail: 'Estar atento al tráfico, a las señales y a los demás usuarios.' },
            { text: 'Usar adecuadamente el alumbrado', detail: 'Según la normativa de luces y las condiciones de visibilidad.' },
            { text: 'Conservar la distancia de seguridad', detail: 'Suficiente para frenar si el vehículo de delante frena bruscamente.' },
            { text: 'Auxiliar en caso de accidente', detail: 'Detenerse, prestar socorro y avisar a los servicios de emergencia.' },
          ]},
          { type: 'warning', text: 'No detenerse en un accidente en el que has participado es delito de omisión del deber de socorro (Art. 195 CP) y puede conllevar prisión.' },
        ],
      },
      {
        id: 'obl_peaton', title: 'Obligaciones del peatón',
        blocks: [
          { type: 'list', items: [
            { text: 'Circular por la acera', detail: 'Cuando exista, por la zona destinada a peatones. Si no hay acera, por el arcén, preferentemente por el lado izquierdo de la calzada.' },
            { text: 'Cruzar por pasos señalizados', detail: 'Cuando estén próximos, antes de cruzar por otro punto.' },
            { text: 'No detenerse ni jugar en la calzada', detail: 'Evitar comportamientos que pongan en peligro la circulación.' },
            { text: 'Llevar prenda reflectante de noche', detail: 'Obligatorio en interurbano cuando se camina por la calzada o el arcén.', emphasis: true },
            { text: 'Respetar señales y semáforos', detail: 'Las señales también obligan a peatones cuando corresponda.' },
          ]},
          { type: 'tip', text: 'Los peatones con problemas de movilidad tienen prioridad absoluta y los conductores deben extremar las precauciones al adelantarles o ceder el paso.' },
        ],
      },
      {
        id: 'obl_carga', title: 'Obligación de carga máxima de pasajeros',
        blocks: [
          { type: 'text', content: 'El permiso B permite transportar hasta 8 pasajeros además del conductor. Cada plaza debe tener su cinturón de seguridad y los menores deben llevar sistema de retención adecuado.' },
          { type: 'list', items: [
            { text: 'Menores con altura inferior a 135 cm', detail: 'Deben ir en sistema de retención infantil homologado (alzador, silla, capazo) en plaza trasera.' },
            { text: 'Menores entre 135-150 cm', detail: 'Pueden ir con cinturón si así lo decide quien los lleva, aunque se recomienda mantener el alzador.' },
            { text: 'Excepción', detail: 'Pueden ir delante en taxis y cuando todas las plazas traseras estén ocupadas por otros menores en sus sillas.' },
          ]},
        ],
      },
    ],
  },

  // ───── TEMA 5 ─────────────────────────────────────────────────
  {
    id: 'seguridad', number: 5, title: 'Dispositivos de seguridad',
    shortDesc: 'Cinturón, airbag, casco, sistemas de retención',
    icon: 'shield-checkmark-outline', color: '#43A047',
    legalRefs: ['Art. 117 RGC (cinturón)', 'Art. 119 RGC (casco)', 'Anexo IX RGC'],
    sections: [
      {
        id: 'seg_cinturon', title: 'Cinturón de seguridad',
        blocks: [
          { type: 'text', content: 'El cinturón de seguridad es el dispositivo de seguridad pasiva más eficaz. Reduce el riesgo de muerte en accidente en un 45-50% para los ocupantes delanteros y un 25% para los traseros.' },
          { type: 'subsection', title: 'Obligación' },
          { type: 'list', items: [
            { text: 'Todos los ocupantes', detail: 'Es obligatorio para conductor y pasajeros en TODAS las plazas y en TODAS las vías (urbanas e interurbanas).', emphasis: true },
            { text: 'En vehículos que dispongan de él', detail: 'Los más antiguos sin cinturón están exentos.' },
            { text: 'Sin holguras ni torceduras', detail: 'Bien ajustado al cuerpo, ni demasiado flojo ni torcido.' },
          ]},
          { type: 'subsection', title: 'Exenciones (Art. 119 RGC)' },
          { type: 'list', items: [
            { text: 'Conductores haciendo marcha atrás o aparcando', detail: 'Pero solo durante la maniobra.' },
            { text: 'Personas con certificado médico justificado', detail: 'Acreditando imposibilidad por razón de salud.' },
            { text: 'Repartidores en vía urbana con paradas frecuentes', detail: 'En vehículos de reparto.' },
            { text: 'Taxistas en servicio urbano', detail: 'Mientras realizan el servicio en la ciudad.' },
          ]},
          { type: 'warning', text: 'No llevar el cinturón conlleva multa de 200€ y pérdida de 3 puntos. Si el conductor lleva pasajeros menores sin cinturón, además se le sanciona por la responsabilidad de los menores.' },
        ],
      },
      {
        id: 'seg_sri', title: 'Sistemas de retención infantil (SRI)',
        blocks: [
          { type: 'text', content: 'Los menores deben usar sistemas adaptados a su altura y peso. La normativa española es de las más estrictas de Europa.' },
          { type: 'table', headers: ['Altura del menor', 'Sistema'], rows: [
            ['Hasta 135 cm', 'Sistema de retención infantil (SRI) obligatorio. Plaza trasera (salvo excepciones).'],
            ['135–150 cm', 'Se permite cinturón, pero se recomienda mantener el SRI.'],
            ['Más de 150 cm', 'Cinturón de seguridad como un adulto.'],
          ]},
          { type: 'tip', text: 'Los SRI deben estar homologados (etiqueta ECE R44/04 o R129 i-Size) y adecuados al peso/altura del niño. Una silla mal elegida o mal instalada pierde gran parte de su eficacia.' },
          { type: 'warning', text: 'Llevar un menor sin sistema de retención adecuado es infracción grave: 200€ + 3 puntos al conductor.' },
        ],
      },
      {
        id: 'seg_airbag', title: 'Airbag',
        blocks: [
          { type: 'text', content: 'El airbag es un dispositivo de seguridad COMPLEMENTARIO al cinturón. Nunca lo sustituye: actúan juntos. Sin cinturón, el airbag puede causar lesiones graves.' },
          { type: 'list', items: [
            { text: 'Airbag frontal del conductor', detail: 'Protege contra impacto en pecho y cabeza en colisión frontal.' },
            { text: 'Airbag del acompañante', detail: 'Igual que el del conductor. DEBE desactivarse si llevamos un SRI a contramarcha en esa plaza.', emphasis: true },
            { text: 'Airbags laterales y de cortina', detail: 'Protegen contra impactos laterales.' },
            { text: 'Airbag de rodillas y de cinturón', detail: 'Reducen lesiones en piernas y abdomen.' },
          ]},
          { type: 'warning', text: 'NUNCA coloques un sistema de retención infantil a contramarcha en una plaza con airbag frontal activo. El despliegue puede ser mortal para el bebé.' },
        ],
      },
      {
        id: 'seg_otros', title: 'Otros dispositivos de seguridad',
        blocks: [
          { type: 'list', items: [
            { text: 'ABS (frenado antibloqueo)', detail: 'Evita que las ruedas se bloqueen al frenar fuerte. Permite mantener el control direccional durante la frenada.' },
            { text: 'ESP / ESC (control de estabilidad)', detail: 'Detecta y corrige derrapes laterales. Obligatorio en vehículos nuevos desde 2014.' },
            { text: 'Reposacabezas', detail: 'Reduce el latigazo cervical en alcances traseros. Ajustar a la altura adecuada (parte superior alineada con la coronilla).' },
            { text: 'Casco', detail: 'Obligatorio para motocicletas, ciclomotores y bicicletas en vías interurbanas (recomendado en urbano para ciclistas).' },
          ]},
        ],
      },
    ],
  },

  // ───── TEMA 6 ─────────────────────────────────────────────────
  {
    id: 'elementos', number: 6, title: 'Elementos del vehículo',
    shortDesc: 'Espejos, alumbrado, claxon, neumáticos y otros componentes',
    icon: 'cog-outline', color: '#546E7A',
    legalRefs: ['Anexo IX RGC', 'Art. 18 RGC'],
    sections: [
      {
        id: 'el_espejos', title: 'Espejos retrovisores',
        blocks: [
          { type: 'text', content: 'Los espejos retrovisores te permiten ver lo que ocurre detrás y a los lados del vehículo. Son imprescindibles antes de cualquier maniobra: cambio de carril, adelantamiento, salida de aparcamiento.' },
          { type: 'list', items: [
            { text: 'Retrovisor interior', detail: 'Vista panorámica trasera a través de la luna posterior.' },
            { text: 'Retrovisores exteriores (izquierdo y derecho)', detail: 'Cubren los laterales. El izquierdo es obligatorio en todos los vehículos; el derecho en turismos modernos.' },
            { text: 'Punto muerto (ángulo ciego)', detail: 'Zona lateral-trasera que no cubren los espejos. Antes de cambiar de carril gira la cabeza para comprobarlo.', emphasis: true },
          ]},
          { type: 'tip', text: 'Para reducir el ángulo ciego, ajusta los retrovisores exteriores de forma que apenas veas el lateral de tu propio coche. Verás más espacio lateral.' },
        ],
      },
      {
        id: 'el_claxon', title: 'Dispositivos acústicos (claxon)',
        blocks: [
          { type: 'text', content: 'El claxon o señal acústica solo debe usarse para evitar un peligro, no para protestar o reclamar atención.' },
          { type: 'list', items: [
            { text: 'En zona urbana', detail: 'Solo en caso de peligro inminente. Está prohibido entre las 22h y 7h salvo emergencia.' },
            { text: 'En carretera (zona interurbana)', detail: 'Sí puede usarse, por ejemplo, para avisar de la intención de adelantar a un vehículo que no nos ve.' },
            { text: 'De noche', detail: 'Se recomienda sustituir el claxon por destellos breves de luz larga.' },
          ]},
          { type: 'quote', text: 'Las señales acústicas no se podrán emplear sino en los casos en que sea necesario advertir a otros usuarios un posible accidente.', source: 'Art. 110 RGC' },
        ],
      },
      {
        id: 'el_neumaticos', title: 'Neumáticos',
        blocks: [
          { type: 'text', content: 'Los neumáticos son el único punto de contacto del vehículo con el asfalto. Su estado determina la adherencia, la distancia de frenado y la respuesta en curvas.' },
          { type: 'list', items: [
            { text: 'Profundidad mínima del dibujo', detail: '1,6 mm en toda la banda de rodadura. Por debajo, el neumático no expulsa el agua y pierde adherencia.', emphasis: true },
            { text: 'Presión correcta', detail: 'La que indica el manual del vehículo o la pegatina en el marco de la puerta. Revisar en frío al menos una vez al mes.' },
            { text: 'Mismo tipo en cada eje', detail: 'Los dos neumáticos del mismo eje deben ser de la misma marca, modelo y dimensiones.' },
            { text: 'Antigüedad', detail: 'Aunque la profundidad sea correcta, los neumáticos envejecen. Se recomienda sustituirlos a los 5–6 años incluso si están poco usados.' },
          ]},
          { type: 'warning', text: 'Un neumático desinflado un 20% aumenta el consumo en un 3% y la distancia de frenado en mojado considerablemente. Además se desgasta el doble de rápido por los bordes.' },
        ],
      },
      {
        id: 'el_otros', title: 'Otros componentes obligatorios',
        blocks: [
          { type: 'list', items: [
            { text: 'Sistema de frenos', detail: 'Freno de servicio (pedal), freno de socorro (auxiliar) y freno de estacionamiento.' },
            { text: 'Sistema de dirección', detail: 'Asistido (con dirección hidráulica o eléctrica) o no asistido.' },
            { text: 'Cinturones de seguridad en todas las plazas', detail: 'Obligatorio uso por todos los ocupantes.' },
            { text: 'Limpiaparabrisas y lavaparabrisas', detail: 'Funcionando correctamente. Si fallan en carretera con lluvia, debes detenerte.' },
            { text: 'Cuentakilómetros y velocímetro', detail: 'En perfecto estado de funcionamiento.' },
          ]},
        ],
      },
    ],
  },

  // ───── TEMA 7 ─────────────────────────────────────────────────
  {
    id: 'luces', number: 7, title: 'Sistema de luces',
    shortDesc: 'Tipos de alumbrado y cuándo usarlos',
    icon: 'flashlight-outline', color: '#FBC02D',
    legalRefs: ['Arts. 98–115 RGC'],
    sections: [
      {
        id: 'lu_tipos', title: 'Tipos de luces del vehículo',
        blocks: [
          { type: 'subsection', title: 'Luces de uso habitual' },
          { type: 'list', items: [
            { text: 'Luces de posición (piloto)', detail: 'Las más débiles. Hacen visible el vehículo sin iluminar la vía. Para parar en lugar iluminado o complementarias.' },
            { text: 'Luces de cruce (cortas)', detail: 'Iluminan unos 40 metros sin deslumbrar. Son las habituales de circulación.', emphasis: true },
            { text: 'Luces de carretera (largas)', detail: 'Iluminan hasta 100 metros. Solo de noche en carretera sin tráfico que pueda deslumbrarse.' },
            { text: 'Luces de freno', detail: 'Se encienden automáticamente al pisar el freno. Avisan al de detrás.' },
            { text: 'Luz de marcha atrás', detail: 'Blanca, en la parte trasera. Se enciende automáticamente al meter la marcha atrás.' },
            { text: 'Intermitentes', detail: 'Para señalizar maniobras: cambios de dirección, carril, salida y entrada de aparcamiento.' },
          ]},
          { type: 'subsection', title: 'Luces especiales' },
          { type: 'list', items: [
            { text: 'Antiniebla delantera', detail: 'Solo con niebla, lluvia o nieve intensa. NO sustituye a las luces de cruce.' },
            { text: 'Antiniebla trasera', detail: 'Solo con visibilidad reducida a menos de 50 m. Es muy potente y deslumbra si se usa mal.', emphasis: true },
            { text: 'Luces de emergencia (warning)', detail: 'Los 4 intermitentes a la vez. Para avería, accidente, atasco repentino o vehículo escolar parado.' },
          ]},
        ],
      },
      {
        id: 'lu_cuando', title: 'Cuándo es obligatorio cada tipo',
        blocks: [
          { type: 'table', headers: ['Situación', 'Luz obligatoria'], rows: [
            ['De noche en cualquier vía', 'Cruce; carretera fuera de poblado sin tráfico contrario'],
            ['En túnel iluminado', 'Cruce'],
            ['En túnel no iluminado', 'Cruce y posición'],
            ['Con lluvia o nieve intensa de día', 'Cruce'],
            ['Visibilidad <100 m por niebla', 'Cruce + antiniebla delantera'],
            ['Visibilidad <50 m', 'Cruce + antinieblas delantera y trasera'],
            ['Parado en arcén por avería', 'Emergencia + posición'],
            ['Atasco repentino en autopista', 'Emergencia (advierte a los de detrás)'],
          ]},
          { type: 'tip', text: 'En autopista, si te encuentras un atasco súbito, enciende los warning aunque sea de día. Salva vidas: avisa a quien viene detrás de que hay un obstáculo.' },
          { type: 'warning', text: 'Llevar la antiniebla trasera encendida con buena visibilidad es infracción (multa) y deslumbra al de atrás. Solo úsala cuando realmente la necesites.' },
        ],
      },
      {
        id: 'lu_deslumbramiento', title: 'Evitar el deslumbramiento',
        blocks: [
          { type: 'list', items: [
            { text: 'A vehículos que vienen de frente', detail: 'Cambia de carretera a cruce con tiempo suficiente. Como regla, cuando puedas ver las luces de carretera del otro vehículo durante varios segundos.' },
            { text: 'A vehículos a los que sigues', detail: 'Cambia a cruce cuando estés a menos de 150 metros del de delante.' },
            { text: 'Si te deslumbran', detail: 'Reduce la velocidad, mira hacia el borde derecho de la calzada, y si es necesario, detente.' },
          ]},
        ],
      },
    ],
  },

  // ───── TEMA 8 ─────────────────────────────────────────────────
  {
    id: 'senales_t', number: 8, title: 'Señales de circulación',
    shortDesc: 'Verticales, horizontales, semáforos y agentes',
    icon: 'warning-outline', color: '#E53935',
    legalRefs: ['Arts. 132–168 RGC', 'Anexo I RGC (catálogo de señales)'],
    sections: [
      {
        id: 'sen_jerarquia', title: 'Jerarquía de las señales',
        blocks: [
          { type: 'text', content: 'Cuando hay varias señales o indicaciones que pueden contradecirse, prevalecen siempre por este orden:' },
          { type: 'list', ordered: true, items: [
            { text: 'Agentes de tráfico', detail: 'Sus instrucciones tienen prioridad absoluta. Aunque haya un semáforo en verde, si un agente te indica parar, paras.', emphasis: true },
            { text: 'Semáforos', detail: 'Prevalecen sobre las señales verticales.' },
            { text: 'Señales verticales (STOP, Ceda el Paso, prohibiciones, obligaciones…)', detail: 'Prevalecen sobre las marcas viales.' },
            { text: 'Marcas viales (líneas, flechas, símbolos en el asfalto)', detail: 'Última en jerarquía, pero obligatorias cuando no hay contradicción superior.' },
          ]},
          { type: 'quote', text: 'El orden de preferencia entre los distintos tipos de señales de circulación es el siguiente: 1.º Señales y órdenes de los agentes. 2.º Señalización circunstancial que modifique el régimen normal. 3.º Semáforos. 4.º Señales verticales. 5.º Marcas viales.', source: 'Art. 5 RGC' },
        ],
      },
      {
        id: 'sen_tipos', title: 'Tipos de señales',
        blocks: [
          { type: 'text', content: 'En la sección Manual > Señales tienes el catálogo completo, ordenado por tipo. Aquí un resumen:' },
          { type: 'table', headers: ['Tipo', 'Forma y color'], rows: [
            ['Peligro', 'Triángulo con vértice arriba, fondo blanco, borde rojo'],
            ['Prohibición / Restricción', 'Círculo blanco con borde rojo'],
            ['Obligación', 'Círculo azul'],
            ['Indicación', 'Rectangular o cuadrada azul (servicios) o verde (autovía)'],
            ['Prioridad', 'Especiales: STOP (octógono rojo), Ceda el Paso (triángulo invertido)'],
            ['Fin de prohibición', 'Círculo blanco con rayas diagonales negras'],
          ]},
          { type: 'tip', text: 'Las señales de FONDO AMARILLO son provisionales (obras) y PREVALECEN sobre las permanentes blancas. Aunque la línea continua sea blanca, si hay una marca amarilla discontinua encima, manda la amarilla.' },
        ],
      },
      {
        id: 'sen_semaforos', title: 'Semáforos',
        blocks: [
          { type: 'list', items: [
            { text: 'Rojo', detail: 'Detención obligatoria antes de la línea de stop. No cruces bajo ningún concepto.', emphasis: true },
            { text: 'Ámbar', detail: 'Detente, salvo que estés tan cerca que frenar sea peligroso. NO es señal para acelerar y pasar.', emphasis: true },
            { text: 'Verde', detail: 'Puedes avanzar. Respeta a los peatones que ya estén cruzando.' },
            { text: 'Ámbar intermitente', detail: 'Precaución. Puedes pasar, pero la prioridad la determinan las señales o normas generales.' },
            { text: 'Rojo intermitente', detail: 'Paso a nivel o puente móvil. Detente y no cruces.' },
            { text: 'Flecha verde', detail: 'Puedes circular en la dirección indicada, aunque el semáforo principal esté en rojo.' },
          ]},
          { type: 'warning', text: 'Saltarse un semáforo en rojo es infracción muy grave: 200€ de multa y pérdida de 4 puntos. Si causa un accidente, las consecuencias pueden ser penales.' },
        ],
      },
    ],
  },

  // ───── TEMA 9 ─────────────────────────────────────────────────
  {
    id: 'la_via', number: 9, title: 'La vía',
    shortDesc: 'Tipos de vías, carriles, arcenes y sentidos',
    icon: 'map-outline', color: '#00838F',
    legalRefs: ['Anexo I LSV', 'Art. 119–122 RGC'],
    sections: [
      {
        id: 'via_tipos', title: 'Tipos de vías',
        blocks: [
          { type: 'subsection', title: 'Vías interurbanas' },
          { type: 'list', items: [
            { text: 'Autopista', detail: 'Vía especialmente proyectada para circulación rápida, con calzadas separadas para cada sentido y al menos 2 carriles por sentido. Accesos solo por entrada/salida específicos. Prohibido peatones, ciclos y vehículos lentos.' },
            { text: 'Autovía', detail: 'Características similares a la autopista pero puede tener cruces a nivel y accesos directos. Misma velocidad máxima (120 km/h).' },
            { text: 'Carretera convencional', detail: 'Calzada única con dos sentidos de circulación. Velocidad máxima genérica 90 km/h.' },
            { text: 'Travesía', detail: 'Tramo de carretera que atraviesa un núcleo urbano. Aplican normas urbanas: 50 km/h máximo.' },
          ]},
          { type: 'subsection', title: 'Vías urbanas' },
          { type: 'list', items: [
            { text: 'Vía urbana 2+ carriles por sentido', detail: 'Límite genérico 50 km/h.' },
            { text: 'Calle de un carril por sentido (desde 2021)', detail: 'Límite genérico 30 km/h.' },
            { text: 'Zona de coexistencia (zona 20)', detail: 'Peatones y ciclistas tienen prioridad. 20 km/h máximo.' },
            { text: 'Zona peatonal', detail: 'Reservada a peatones. Solo acceden vehículos autorizados.' },
          ]},
        ],
      },
      {
        id: 'via_partes', title: 'Partes de la vía',
        blocks: [
          { type: 'definition', term: 'Calzada', definition: 'Parte de la vía destinada a la circulación de vehículos. Puede tener uno o varios carriles.' },
          { type: 'definition', term: 'Carril', definition: 'Banda longitudinal de la calzada de anchura suficiente para una fila de automóviles en circulación.' },
          { type: 'definition', term: 'Arcén', definition: 'Franja longitudinal pavimentada y a nivel con la calzada, situada a su derecha. NO es para circular: solo emergencias, vehículos lentos en algunos casos, y peatones/ciclistas cuando no hay otro lugar.' },
          { type: 'definition', term: 'Mediana', definition: 'Zona longitudinal que separa los dos sentidos de circulación en una vía con calzadas separadas. Está prohibido circular o detenerse en ella.' },
          { type: 'definition', term: 'Acera', definition: 'Zona elevada destinada a peatones, separada de la calzada. Prohibida la circulación de vehículos.' },
          { type: 'definition', term: 'Intersección', definition: 'Nudo de la red vial donde confluyen dos o más vías. Punto crítico por mayor probabilidad de accidente.' },
        ],
      },
      {
        id: 'via_carriles', title: 'Carriles especiales',
        blocks: [
          { type: 'list', items: [
            { text: 'Carril BUS', detail: 'Reservado a autobuses (y taxis donde se permita). Marcado con la palabra BUS.' },
            { text: 'Carril VAO', detail: 'Vehículos de Alta Ocupación. Para vehículos con 2 o más ocupantes (o moto, o ECO).' },
            { text: 'Carril bici', detail: 'Reservado para bicicletas. Identificable por su pavimento o señalización.' },
            { text: 'Carril adicional', detail: 'En cuestas, para vehículos lentos. Se incorporan a la derecha y deben usarlo.' },
            { text: 'Carril reversible', detail: 'Cambia de sentido según la hora. Señalizado con paneles luminosos.' },
          ]},
        ],
      },
    ],
  },

  // ───── TEMA 10 ────────────────────────────────────────────────
  {
    id: 'velocidad', number: 10, title: 'Velocidad y distancias',
    shortDesc: 'Límites, distancia de seguridad, frenado',
    icon: 'speedometer-outline', color: '#E65100',
    legalRefs: ['Arts. 45–54 RGC', 'Art. 48 LSV'],
    sections: [
      {
        id: 'vel_genericos', title: 'Límites genéricos por tipo de vía',
        blocks: [
          { type: 'table', headers: ['Tipo de vía (turismos)', 'Máxima / Mínima'], rows: [
            ['Autopista y autovía', '120 km/h  ·  60 km/h'],
            ['Carretera convencional con arcén ≥1,5m', '90 km/h  ·  no hay mínima'],
            ['Carretera convencional sin arcén practicable', '70 km/h'],
            ['Travesía', '50 km/h'],
            ['Vía urbana 2+ carriles por sentido', '50 km/h'],
            ['Calle urbana 1 carril por sentido (2021)', '30 km/h'],
            ['Zona 20 / coexistencia', '20 km/h'],
            ['Zona peatonal', 'Paso a paso (~10 km/h)'],
          ]},
          { type: 'warning', text: 'Cambio importante 2021: en calles urbanas con un carril por sentido y aceras, el límite es 30 km/h (no 50). Es el error más frecuente del examen.' },
        ],
      },
      {
        id: 'vel_especiales', title: 'Límites para casos especiales',
        blocks: [
          { type: 'list', items: [
            { text: 'Conductor novel en autopista', detail: '100 km/h máximo durante el primer año.', emphasis: true },
            { text: 'Turismo con remolque ligero (≤750 kg)', detail: 'Misma velocidad que sin remolque.' },
            { text: 'Turismo con remolque pesado (>750 kg)', detail: '80 km/h en autopista, 70 en carretera.' },
            { text: 'Camiones >3.500 kg', detail: '100 km/h autopista, 80 carretera convencional.' },
            { text: 'Autobuses', detail: '100 km/h autopista, 90 carretera.' },
          ]},
        ],
      },
      {
        id: 'vel_distancia', title: 'Distancia de seguridad',
        blocks: [
          { type: 'text', content: 'La distancia de seguridad es la que permite frenar sin colisionar si el vehículo de delante frena bruscamente. Depende de la velocidad, el estado del vehículo, la vía y la atención del conductor.' },
          { type: 'subsection', title: 'Regla práctica' },
          { type: 'list', items: [
            { text: 'Regla de los 2 segundos', detail: 'Cuenta 2 segundos desde que el vehículo de delante pasa un punto fijo hasta que tú lo pasas. Si llegas antes, estás demasiado cerca.' },
            { text: 'Con lluvia, niebla o de noche', detail: 'Multiplica por 2 la distancia: regla de los 4 segundos.' },
            { text: 'En autopista a >100 km/h', detail: 'Mínimo 50 metros. Señalización en el suelo (galones) ayuda a medir.', emphasis: true },
          ]},
          { type: 'quote', text: 'Todo conductor de un vehículo que circule detrás de otro deberá dejar entre ambos un espacio libre que le permita detenerse, en caso de frenado brusco, sin colisionar con él.', source: 'Art. 54 RGC' },
        ],
      },
      {
        id: 'vel_frenado', title: 'Distancias de frenado',
        blocks: [
          { type: 'text', content: 'La distancia total de detención incluye dos fases:' },
          { type: 'list', items: [
            { text: 'Distancia de reacción', detail: 'Lo que recorre el vehículo desde que detectas el peligro hasta que pisas el freno. Aproximadamente 1 segundo (más si estás cansado, drogado o usando el móvil).' },
            { text: 'Distancia de frenado propiamente dicha', detail: 'Lo que recorre el vehículo desde que pisas el freno hasta que se detiene. Aumenta con el CUADRADO de la velocidad.' },
          ]},
          { type: 'table', headers: ['Velocidad', 'Distancia total seca'], rows: [
            ['50 km/h', '~25 m'],
            ['90 km/h', '~70 m'],
            ['120 km/h', '~110 m'],
          ]},
          { type: 'warning', text: 'Con lluvia, multiplica por 2. Con hielo o nieve, puede multiplicarse por 5–10. Estas distancias son orientativas: con neumáticos viejos o frenos en mal estado, son aún mayores.' },
        ],
      },
    ],
  },

  // ───── TEMA 11 ────────────────────────────────────────────────
  {
    id: 'maniobras', number: 11, title: 'Maniobras',
    shortDesc: 'Adelantamiento, cambio de dirección, marcha atrás, parada',
    icon: 'arrow-redo-outline', color: '#1565C0',
    legalRefs: ['Arts. 73–94 RGC'],
    sections: [
      {
        id: 'man_general', title: 'Reglas generales',
        blocks: [
          { type: 'text', content: 'Toda maniobra debe avisarse con antelación suficiente para que los demás puedan preverla. Antes de iniciarla: comprueba que no causa peligro a nadie.' },
          { type: 'list', ordered: true, items: [
            { text: 'MIRAR', detail: 'Espejos y giro de cabeza para puntos ciegos.' },
            { text: 'SEÑALIZAR', detail: 'Intermitente con tiempo suficiente.' },
            { text: 'MANIOBRAR', detail: 'Con suavidad, sin obligar a nadie a frenar bruscamente.' },
          ]},
        ],
      },
      {
        id: 'man_adelantamiento', title: 'Adelantamiento',
        blocks: [
          { type: 'subsection', title: 'Procedimiento correcto' },
          { type: 'list', ordered: true, items: [
            { text: 'Comprueba que es legal', detail: 'No hay señal R-305, ni línea continua, ni cruce próximo.' },
            { text: 'Intermitente izquierdo', detail: 'Avisas de tu intención.' },
            { text: 'Mira el espejo y el punto ciego', detail: 'Comprueba que nadie te adelanta a ti.' },
            { text: 'Acelera y desplázate al carril izquierdo', detail: 'Con decisión, sin titubear.' },
            { text: 'Rebasa con margen lateral', detail: 'Mínimo 1,5 m a ciclistas.' },
            { text: 'Intermitente derecho y regresa al carril', detail: 'Cuando veas el vehículo adelantado por el retrovisor interior.' },
          ]},
          { type: 'subsection', title: 'Cuándo está PROHIBIDO adelantar' },
          { type: 'list', items: [
            { text: 'Curvas y cambios de rasante sin visibilidad', emphasis: true },
            { text: 'Pasos a nivel y sus proximidades' },
            { text: 'Pasos de peatones (con peatones)' },
            { text: 'Cuando hay línea continua a tu izquierda' },
            { text: 'Cuando hay señal R-305 (prohibido adelantar)' },
            { text: 'Cuando obligues al de frente a apartarse o frenar' },
          ]},
          { type: 'warning', text: 'El 30% de los accidentes mortales en carretera secundaria son por adelantamientos indebidos. Si tienes dudas, NO adelantes.' },
        ],
      },
      {
        id: 'man_giros', title: 'Cambios de dirección',
        blocks: [
          { type: 'list', items: [
            { text: 'Giro a la derecha', detail: 'Acércate a la derecha de la calzada. Señaliza con anticipación.' },
            { text: 'Giro a la izquierda', detail: 'Acércate al eje de la calzada (sin invadir el carril contrario). Señaliza. Cede el paso al tráfico contrario.' },
            { text: 'Cambio de sentido', detail: 'Solo donde esté permitido. Asegúrate de tener visibilidad y espacio para completar la maniobra.' },
          ]},
          { type: 'warning', text: 'NUNCA se puede cambiar de sentido en autopista, autovía, túnel, puente, paso a nivel, o donde haya señal R-404 (prohibido cambio de sentido).' },
        ],
      },
      {
        id: 'man_atras', title: 'Marcha atrás',
        blocks: [
          { type: 'text', content: 'La marcha atrás es una maniobra de bajas velocidades, peligrosa por la limitación de visibilidad.' },
          { type: 'list', items: [
            { text: 'No se considera maniobra de circulación', detail: 'Se usa solo para complementar otra (aparcar, salir de aparcamiento, rectificar posición).' },
            { text: 'Distancia máxima reglamentaria', detail: 'En autopista o autovía: PROHIBIDA. En carretera: solo lo imprescindible para completar una maniobra.' },
            { text: 'Velocidad', detail: 'Como máximo 15 km/h.' },
            { text: 'Vigilancia', detail: 'Gira la cabeza, usa el retrovisor interior. Si no ves: bájate o pide a alguien que te guíe.' },
          ]},
        ],
      },
      {
        id: 'man_parada', title: 'Parada y estacionamiento',
        blocks: [
          { type: 'definition', term: 'Parada', definition: 'Inmovilización del vehículo por menos de 2 minutos sin abandonarlo. Para tomar/dejar pasajeros o realizar carga rápida.' },
          { type: 'definition', term: 'Estacionamiento', definition: 'Inmovilización del vehículo que no es parada ni se debe a las circunstancias del tráfico.' },
          { type: 'subsection', title: 'Dónde está prohibido (Arts. 91-94 RGC)' },
          { type: 'list', items: [
            { text: 'A menos de 5 m de un cruce, paso peatones o señal que impide la visibilidad', emphasis: true },
            { text: 'En curvas, túneles, cambios de rasante' },
            { text: 'En pasos a nivel (y sus proximidades)' },
            { text: 'Sobre la acera, carril bici, paso peatonal' },
            { text: 'En zonas reservadas (PMR, taxis, carga/descarga)' },
            { text: 'En doble fila' },
            { text: 'Delante de vado (acceso de vehículos)' },
          ]},
        ],
      },
    ],
  },

  // ───── TEMA 12 ────────────────────────────────────────────────
  {
    id: 'preferencia', number: 12, title: 'Normas de preferencia',
    shortDesc: 'Quién pasa primero en cada situación',
    icon: 'git-merge-outline', color: '#2E7D32',
    legalRefs: ['Arts. 56–72 RGC'],
    sections: [
      {
        id: 'pref_general', title: 'Regla general',
        blocks: [
          { type: 'text', content: 'Cuando no hay señales que indiquen otra cosa, la regla general es ceder el paso al vehículo que viene por la DERECHA.' },
          { type: 'quote', text: 'En las intersecciones sin señalizar, todo conductor está obligado a ceder el paso a los vehículos que se aproximen por su derecha.', source: 'Art. 57.1 RGC' },
        ],
      },
      {
        id: 'pref_orden', title: 'Orden de prioridad',
        blocks: [
          { type: 'list', ordered: true, items: [
            { text: 'Vehículos de emergencia en servicio urgente', detail: 'Con sirena y luces. Prioridad absoluta.', emphasis: true },
            { text: 'Vehículos en vía principal', detail: 'Sobre los que vienen de vía secundaria.' },
            { text: 'Tren', detail: 'En cruces (pasos a nivel) tiene prioridad absoluta.' },
            { text: 'El que ya está dentro de una rotonda', detail: 'Sobre el que pretende entrar.' },
            { text: 'Vehículos del lado derecho', detail: 'Regla general en intersecciones no señalizadas.' },
          ]},
        ],
      },
      {
        id: 'pref_rotondas', title: 'Rotondas',
        blocks: [
          { type: 'list', items: [
            { text: 'Al entrar', detail: 'Cede el paso al tráfico que ya circula por la rotonda.' },
            { text: 'Dentro', detail: 'Circula por el carril que más se ajuste a tu salida. Para salir en la primera o segunda, usa el carril exterior; para salidas posteriores, el interior.' },
            { text: 'Al salir', detail: 'Señaliza con el intermitente derecho. Cede el paso a peatones que crucen.' },
          ]},
          { type: 'tip', text: 'En la rotonda manda quien está dentro. Quien entra espera. La regla de "ceder a la derecha" NO se aplica en rotondas.' },
        ],
      },
      {
        id: 'pref_emergencia', title: 'Vehículos de emergencia',
        blocks: [
          { type: 'list', items: [
            { text: 'Tienen prioridad absoluta', detail: 'Cuando llevan en servicio sirena + luces (rotativo azul o amarillo).' },
            { text: 'Debes facilitar el paso', detail: 'Apartándote a la derecha, subiéndote al arcén si es necesario, o deteniéndote.' },
            { text: 'No los sigas a menos de 50 metros', detail: 'No te aproveches del espacio que abren.' },
            { text: 'En un semáforo rojo', detail: 'Puedes saltártelo SOLO para facilitar el paso a la emergencia, con extrema precaución.' },
          ]},
          { type: 'warning', text: 'Obstaculizar deliberadamente el paso a una emergencia en servicio urgente es infracción muy grave: 200€ + 6 puntos. Puede ser delito si se demuestra dolo.' },
        ],
      },
      {
        id: 'pref_estrechamientos', title: 'Estrechamientos y pendientes',
        blocks: [
          { type: 'list', items: [
            { text: 'Estrechamiento (paso por donde no caben dos)', detail: 'Pasa primero quien llegue antes. Si llegan a la vez, el que tenga prioridad por señal o el que conduzca el vehículo más fácil de mover hacia atrás.' },
            { text: 'En pendiente sin señalización', detail: 'Prioridad al que SUBE, porque al que baja le resulta más fácil retroceder y reiniciar la marcha.', emphasis: true },
          ]},
        ],
      },
    ],
  },

  // ───── TEMA 13 ────────────────────────────────────────────────
  {
    id: 'transporte', number: 13, title: 'Transportar personas y cargas',
    shortDesc: 'Pasajeros, mercancías y restricciones',
    icon: 'cube-outline', color: '#6D4C41',
    legalRefs: ['Arts. 9–13 RGC', 'Arts. 14–20 RGC'],
    sections: [
      {
        id: 'tr_personas', title: 'Transporte de personas',
        blocks: [
          { type: 'list', items: [
            { text: 'Número máximo de pasajeros', detail: 'El que indique la ficha técnica (en permiso B: hasta 8 además del conductor).' },
            { text: 'Cada plaza con cinturón', detail: 'No puedes llevar más pasajeros que cinturones disponibles.' },
            { text: 'Asiento delantero con menores', detail: 'Solo permitido si los menores miden más de 135 cm o si las plazas traseras están ocupadas por otros menores en SRI.' },
            { text: 'Personas en remolque', detail: 'PROHIBIDO transportar personas en remolques (salvo casos muy específicos de remolques diseñados a tal fin).', emphasis: true },
            { text: 'Personas en zona de carga', detail: 'PROHIBIDO en cajas de furgonetas o pick-ups no diseñadas para transporte de pasajeros.' },
          ]},
        ],
      },
      {
        id: 'tr_cargas', title: 'Transporte de cargas',
        blocks: [
          { type: 'text', content: 'La carga debe ir bien colocada y sujeta. No puede sobresalir, dificultar la conducción ni desplazarse durante el trayecto.' },
          { type: 'subsection', title: 'Reglas de carga' },
          { type: 'list', items: [
            { text: 'Sin sobrepasar la MMA', detail: 'El peso total (vehículo + carga + pasajeros) no debe superar la Masa Máxima Autorizada que figura en la ficha técnica.' },
            { text: 'Bien distribuida', detail: 'Lo pesado abajo y cerca del eje. La carga mal distribuida cambia el centro de gravedad y aumenta el riesgo de vuelco.' },
            { text: 'Sujeta y cubierta', detail: 'Con redes, cuerdas o lonas para que no se caiga ni se mueva.' },
            { text: 'Sin obstruir visibilidad', detail: 'Ni los espejos, ni las luces, ni la matrícula, ni las señales del vehículo.' },
          ]},
          { type: 'subsection', title: 'Carga que sobresale' },
          { type: 'list', items: [
            { text: 'Por detrás (vehículos sin remolque)', detail: 'Puede sobresalir hasta el 10% de la longitud del vehículo.' },
            { text: 'Por detrás (vehículos con remolque)', detail: 'Hasta el 15% si el vehículo tiene un solo eje, 10% en otros casos.' },
            { text: 'Por delante', detail: 'PROHIBIDO sobresalir por delante de la cabina (salvo vehículos especiales).' },
            { text: 'Lateralmente', detail: 'No puede sobresalir más allá de los retrovisores.' },
            { text: 'Señalización', detail: 'Si la carga sobresale, debe señalizarse con un panel V-20 (rectángulo a rayas rojas y blancas reflectantes).' },
          ]},
          { type: 'warning', text: 'Llevar carga mal sujeta es infracción grave. Si la carga cae y causa un accidente, el conductor es responsable civil y penalmente.' },
        ],
      },
    ],
  },

  // ───── TEMA 14 ────────────────────────────────────────────────
  {
    id: 'conducir_seguro', number: 14, title: 'Conducir de forma segura',
    shortDesc: 'Conducción defensiva, anticipación y prevención',
    icon: 'shield-outline', color: '#00897B',
    legalRefs: ['Art. 3 LSV', 'Arts. 23–30 RGC'],
    sections: [
      {
        id: 'cs_defensiva', title: 'Conducción defensiva',
        blocks: [
          { type: 'text', content: 'La conducción defensiva consiste en anticipar posibles peligros antes de que se conviertan en emergencias. Implica observar continuamente el entorno, evaluar riesgos y mantener márgenes de seguridad.' },
          { type: 'list', items: [
            { text: 'Mira lejos', detail: 'No te fijes solo en el coche de delante: observa hasta donde alcance la vista.' },
            { text: 'Espera lo inesperado', detail: 'Un peatón puede salir de detrás de un coche aparcado. Un coche puede saltarse el stop.' },
            { text: 'Mantén espacio', detail: 'Distancia con el de delante, separación lateral, y siempre una ruta de escape.' },
            { text: 'Sé visible', detail: 'Luces, posición en el carril, intermitentes para que los demás te vean y entiendan.' },
            { text: 'No asumas', detail: 'No supongas que el otro conductor te ha visto o va a respetar la señal.' },
          ]},
        ],
      },
      {
        id: 'cs_atencion', title: 'Atención y concentración',
        blocks: [
          { type: 'list', items: [
            { text: 'Móvil: cero', detail: 'Ni con la mano, ni leyendo notificaciones. Incluso manos libres distrae cognitivamente.', emphasis: true },
            { text: 'Comida y bebida', detail: 'Evita comer al volante. Si necesitas beber, espera a estar parado.' },
            { text: 'GPS y radio', detail: 'Configura el destino antes de arrancar. Ajusta volumen y emisora antes de salir.' },
            { text: 'Conversación', detail: 'Si la conversación se vuelve intensa, pídela que pause o pide tú que esperen.' },
          ]},
          { type: 'warning', text: 'Usar el móvil al volante multiplica por 4 el riesgo de accidente y supone pérdida de 6 puntos + 200€ de multa.' },
        ],
      },
      {
        id: 'cs_condiciones', title: 'Conducir en condiciones adversas',
        blocks: [
          { type: 'subsection', title: 'Lluvia' },
          { type: 'list', items: [
            { text: 'Reduce la velocidad', detail: 'En lluvia intensa: 80 km/h máximo aunque la señal permita más.' },
            { text: 'Aumenta distancia de seguridad', detail: 'Multiplica por 2 (regla de 4 segundos en vez de 2).' },
            { text: 'Luces de cruce siempre', detail: 'Aunque sea de día.' },
            { text: 'Cuidado con el aquaplaning', detail: 'Si el coche flota sobre el agua: NO frenes, NO gires bruscamente. Levanta el pie del acelerador y mantén el volante recto.' },
          ]},
          { type: 'subsection', title: 'Niebla' },
          { type: 'list', items: [
            { text: 'Luces de cruce y antiniebla delantera', detail: 'Nunca uses luces largas: el haz se refleja en la niebla y reduce más la visibilidad.' },
            { text: 'Visibilidad < 50 m', detail: 'Enciende también la antiniebla trasera.' },
            { text: 'Velocidad muy reducida', detail: 'Ajustada a la visibilidad real. Si no ves a 30 metros, no vayas a 50 km/h.' },
          ]},
          { type: 'subsection', title: 'Hielo / nieve' },
          { type: 'list', items: [
            { text: 'Cadenas o neumáticos de invierno', detail: 'Obligatorios donde lo indique la señal R-409.' },
            { text: 'Conducción ultra-suave', detail: 'Acelera, frena y gira con suavidad extrema. Cualquier movimiento brusco provoca derrape.' },
            { text: 'Marchas largas', detail: 'Para que las ruedas tiren menos. Evitar primera salvo al arrancar.' },
          ]},
        ],
      },
    ],
  },

  // ───── TEMA 15 ────────────────────────────────────────────────
  {
    id: 'mecanica', number: 15, title: 'Mecánica y mantenimiento',
    shortDesc: 'Revisiones, ITV, averías comunes',
    icon: 'build-outline', color: '#455A64',
    legalRefs: ['RD 920/2017 (ITV)', 'Art. 7 LSV'],
    sections: [
      {
        id: 'mec_itv', title: 'Inspección Técnica de Vehículos (ITV)',
        blocks: [
          { type: 'text', content: 'La ITV comprueba que el vehículo cumple los requisitos técnicos y de seguridad para circular. Es obligatoria con la siguiente periodicidad para turismos:' },
          { type: 'table', headers: ['Antigüedad del vehículo', 'Periodicidad'], rows: [
            ['0 – 4 años', 'EXENTO (primera ITV a los 4 años)'],
            ['4 – 10 años', 'Cada 2 años'],
            ['Más de 10 años', 'Cada año'],
          ]},
          { type: 'subsection', title: 'Resultado de la ITV' },
          { type: 'list', items: [
            { text: 'Favorable', detail: 'Sin defectos o solo leves. Puedes circular normalmente.' },
            { text: 'Favorable con defectos leves', detail: 'Puedes circular pero debes corregirlos antes de la siguiente ITV.' },
            { text: 'Desfavorable', detail: 'Defectos graves. Tienes 2 meses para repararlos y volver a pasarla. NO puedes circular salvo para ir al taller o a la ITV.', emphasis: true },
            { text: 'Negativa', detail: 'Defectos muy graves. NO puedes circular bajo ningún concepto.' },
          ]},
          { type: 'warning', text: 'Circular con la ITV caducada es infracción grave: 200€ de multa. Si la ITV es desfavorable y circulas, la multa es de 500€.' },
        ],
      },
      {
        id: 'mec_revisiones', title: 'Revisiones rutinarias del conductor',
        blocks: [
          { type: 'text', content: 'Independientemente de la ITV, el conductor debe verificar periódicamente:' },
          { type: 'list', items: [
            { text: 'Niveles de fluidos', detail: 'Aceite, refrigerante, líquido de frenos, líquido limpiaparabrisas. Mensualmente.' },
            { text: 'Presión de los neumáticos', detail: 'Al menos una vez al mes, siempre en frío.' },
            { text: 'Estado de los neumáticos', detail: 'Profundidad mínima 1,6 mm. Sin cortes ni deformaciones.' },
            { text: 'Luces', detail: 'Todas funcionando: cruce, posición, intermitentes, freno, marcha atrás.' },
            { text: 'Limpiaparabrisas y escobillas', detail: 'Sustituir cuando dejan rayas o salten.' },
            { text: 'Frenos', detail: 'Si el pedal está blando, si pita al frenar o si tira a un lado: al taller.' },
          ]},
        ],
      },
      {
        id: 'mec_averias', title: 'Qué hacer en caso de avería',
        blocks: [
          { type: 'list', ordered: true, items: [
            { text: 'Si es posible, abandona la calzada', detail: 'Aparca en el arcén o en una zona segura. En autopista, lo más a la derecha posible.' },
            { text: 'Enciende las luces de emergencia (warning)', detail: 'Inmediatamente al detectar el problema.' },
            { text: 'Chaleco reflectante ANTES de salir', detail: 'Visible desde fuera. Es obligatorio ponérselo dentro del vehículo.', emphasis: true },
            { text: 'Coloca el dispositivo V-16 o triángulos', detail: 'El V-16 (luz LED ámbar) puede activarse desde el coche, más seguro. Los triángulos hay que colocarlos a 50 m delante y detrás (en autopista solo detrás, a 50 m).' },
            { text: 'Aleja a los ocupantes del vehículo', detail: 'Que se sitúen detrás del guardarraíl o en zona segura, NUNCA dentro del coche en arcén de autopista.' },
            { text: 'Llama al 112 o al seguro', detail: 'Si necesitas asistencia.' },
          ]},
          { type: 'quote', text: 'Es obligatorio el uso del dispositivo luminoso de preseñalización de peligro (V-16) o de los dos triángulos de preseñalización en los supuestos previstos reglamentariamente.', source: 'Art. 130 RGC' },
        ],
      },
    ],
  },

  // ───── TEMA 16 ────────────────────────────────────────────────
  {
    id: 'accidentes', number: 16, title: 'Accidentes de tráfico',
    shortDesc: 'Protocolo PAS, primeros auxilios, obligaciones legales',
    icon: 'pulse-outline', color: '#C62828',
    legalRefs: ['Arts. 129–131 LSV', 'Protocolo PAS'],
    sections: [
      {
        id: 'acc_pas', title: 'Protocolo PAS',
        blocks: [
          { type: 'text', content: 'Las siglas PAS (Proteger, Avisar, Socorrer) son el protocolo internacional de actuación ante un accidente. SIEMPRE en este orden.' },
          { type: 'subsection', title: 'PROTEGER' },
          { type: 'list', items: [
            { text: 'Tu seguridad primero', detail: 'No te conviertas en otra víctima. Aparca a distancia segura, chaleco antes de salir.' },
            { text: 'Señaliza el lugar', detail: 'Triángulos o V-16, luces de emergencia.' },
            { text: 'Aleja a curiosos y posibles fuentes de ignición', detail: 'No fumes cerca, apaga motores cercanos.' },
          ]},
          { type: 'subsection', title: 'AVISAR' },
          { type: 'list', items: [
            { text: 'Llama al 112', detail: 'Gratuito, 24h, funciona sin saldo y sin cobertura del operador (busca otra antena).' },
            { text: 'Informa con calma', detail: 'Lugar exacto (km, punto kilométrico), número de heridos, si hay atrapados, si hay riesgo de incendio.' },
            { text: 'No cuelgues', detail: 'Espera a que te lo indiquen. Pueden necesitar más información.' },
          ]},
          { type: 'subsection', title: 'SOCORRER' },
          { type: 'list', items: [
            { text: 'NO MOVER A LOS HERIDOS', detail: 'Salvo peligro inminente (fuego, ahogamiento, explosión). El movimiento puede agravar lesiones de columna.', emphasis: true },
            { text: 'Habla y tranquiliza', detail: 'Mantén consciente al herido. Pregúntale cómo se llama, qué le duele.' },
            { text: 'Cubre con manta para evitar shock térmico', detail: 'Pero sin presionar zonas con heridas.' },
            { text: 'Si está inconsciente y respira', detail: 'Posición lateral de seguridad (PLS), boca abajo de lado, para evitar atragantamiento.' },
            { text: 'Si no respira', detail: 'Inicia RCP: 30 compresiones torácicas + 2 ventilaciones boca a boca. Ritmo 100-120/min, 5-6 cm profundidad.' },
          ]},
          { type: 'warning', text: 'NUNCA quites el casco a un motorista inconsciente, salvo que sea imprescindible para la RCP. Solo los profesionales sanitarios deberían hacerlo.' },
        ],
      },
      {
        id: 'acc_obligaciones', title: 'Obligaciones legales del conductor',
        blocks: [
          { type: 'list', items: [
            { text: 'Detenerse', detail: 'Aunque no hayas sido responsable, si has estado implicado debes detenerte.' },
            { text: 'Prestar auxilio', detail: 'A los heridos en la medida de lo que sepas hacer.' },
            { text: 'Identificarse', detail: 'A los demás implicados y a la autoridad.' },
            { text: 'No abandonar el lugar', detail: 'Hasta que llegue la autoridad o estés autorizado a marcharte.', emphasis: true },
            { text: 'Rellenar el parte amigable', detail: 'Si los daños son materiales y ambos conductores están de acuerdo.' },
          ]},
          { type: 'warning', text: 'Abandonar el lugar del accidente sin auxiliar es DELITO de omisión del deber de socorro (Art. 195 CP): hasta 4 años de prisión. Si causaste el accidente y huyes, es delito de fuga (Art. 382 bis CP): prisión de 6 meses a 4 años.' },
        ],
      },
      {
        id: 'acc_partamigable', title: 'Parte amigable de accidente',
        blocks: [
          { type: 'text', content: 'Es el documento que rellenan los conductores tras un accidente con daños materiales. Lo proporciona el seguro al contratarlo.' },
          { type: 'list', items: [
            { text: 'Solo daños materiales', detail: 'Si hay heridos, debe intervenir la policía.' },
            { text: 'Ambos conductores firman', detail: 'Si uno se niega, deja constancia y llama a la policía.' },
            { text: 'Una copia para cada uno', detail: 'Cada parte conserva el original y entrega copia a su aseguradora.' },
            { text: 'Plazo de comunicación', detail: 'Tu seguro debe recibirlo en máximo 7 días.' },
          ]},
        ],
      },
    ],
  },

  // ───── TEMA 17 ────────────────────────────────────────────────
  {
    id: 'eficiente', number: 17, title: 'Conducción preventiva y eficiente',
    shortDesc: 'Ahorrar combustible, contaminar menos, anticiparse',
    icon: 'leaf-outline', color: '#558B2F',
    legalRefs: ['Resolución DGT 20/01/2016 (etiquetas)'],
    sections: [
      {
        id: 'ef_tecnicas', title: 'Técnicas de conducción eficiente',
        blocks: [
          { type: 'text', content: 'La conducción eficiente reduce el consumo (y por tanto la contaminación) hasta un 15-20% sin alargar significativamente el tiempo de viaje.' },
          { type: 'list', items: [
            { text: 'Cambia de marcha pronto', detail: 'En gasolina: 2.000-2.500 rpm. En diésel: 1.500-2.000 rpm.' },
            { text: 'Mantén una velocidad constante', detail: 'El cruise control ayuda en autopista.' },
            { text: 'Anticipa frenadas y aceleraciones', detail: 'Usa el freno motor levantando el pie en vez de frenar.' },
            { text: 'Apaga el motor en paradas largas', detail: 'A partir de ~60 segundos compensa apagarlo.' },
            { text: 'Mantén los neumáticos a la presión correcta', detail: 'Un neumático bajo aumenta el consumo un 3%.' },
            { text: 'Quita peso innecesario', detail: '100 kg extra aumenta el consumo un 5%. Vacía el maletero de cosas que no necesitas.' },
            { text: 'Quita la baca y ventanillas cerradas a alta velocidad', detail: 'Reducen la aerodinámica.' },
            { text: 'Aire acondicionado con moderación', detail: 'Aumenta el consumo un 10%. En autopista a más de 80 km/h compensa más que abrir ventanillas.' },
          ]},
        ],
      },
      {
        id: 'ef_etiquetas', title: 'Etiquetas medioambientales DGT',
        blocks: [
          { type: 'text', content: 'La DGT clasifica los vehículos según su impacto medioambiental con cinco categorías de etiqueta:' },
          { type: 'table', headers: ['Etiqueta', 'Vehículos'], rows: [
            ['0 emisiones (azul)', 'Eléctricos puros (BEV), de hidrógeno (FCEV)'],
            ['ECO (azul + verde)', 'Híbridos enchufables (PHEV), gas natural (GNC), GLP'],
            ['C (verde)', 'Gasolina Euro 4+ (matriculados desde 2006), diésel Euro 6 (desde 2015)'],
            ['B (amarillo)', 'Gasolina Euro 3 (2000-2005), diésel Euro 4-5 (2006-2014)'],
            ['Sin etiqueta', 'Gasolina anterior a 2000, diésel anterior a 2006. Los más contaminantes.'],
          ]},
          { type: 'warning', text: 'En las Zonas de Bajas Emisiones (ZBE) de ciudades de más de 50.000 habitantes, los vehículos sin etiqueta tienen restricciones de acceso. Multa por entrar sin autorización: 200€.' },
        ],
      },
      {
        id: 'ef_preventiva', title: 'Conducción preventiva',
        blocks: [
          { type: 'list', items: [
            { text: 'Mira lejos, no solo al coche de delante', detail: 'Detecta antes los problemas y anticipa.' },
            { text: 'Cobertura visual de 360º', detail: 'Espejos cada 5-10 segundos.' },
            { text: 'Deja salida de emergencia', detail: 'Si estás detrás de un camión y necesitas frenar, ¿tienes hueco para esquivarlo?' },
            { text: 'Adáptate al tráfico', detail: 'No vayas más rápido ni más lento que el resto sin necesidad.' },
            { text: 'Pausa cada 2 horas o 200 km', detail: 'Especialmente en autopista. Estírate, hidrátate, ventila la cara.' },
          ]},
        ],
      },
    ],
  },

  // ───── ANEXO PUNTOS ───────────────────────────────────────────
  {
    id: 'anexo_puntos', number: 18, title: 'Anexo: Permiso por puntos',
    shortDesc: 'Sistema de pérdida y recuperación de puntos',
    icon: 'card-outline', color: '#D32F2F',
    legalRefs: ['Ley 17/2005', 'Anexo II LSV'],
    sections: [
      {
        id: 'pt_sistema', title: 'Cómo funciona',
        blocks: [
          { type: 'text', content: 'El permiso de conducir por puntos entró en vigor en España en julio de 2006. Cada conductor tiene un saldo de puntos que se reduce con las infracciones graves y muy graves.' },
          { type: 'list', items: [
            { text: 'Saldo inicial', detail: '12 puntos para conductores con más de 3 años de antigüedad.' },
            { text: 'Noveles', detail: '8 puntos durante los 2 primeros años de permiso.' },
            { text: 'Saldo máximo', detail: 'Hasta 15 puntos pueden acumularse con cursos de sensibilización voluntarios (2 puntos por curso).' },
            { text: 'Pérdida total', detail: 'Si llegas a 0 puntos, el permiso queda revocado. Debes esperar para recuperarlo.' },
          ]},
        ],
      },
      {
        id: 'pt_infracciones', title: 'Puntos por infracción',
        blocks: [
          { type: 'subsection', title: '6 puntos (las más graves)' },
          { type: 'list', items: [
            { text: 'Conducir bajo efectos de alcohol/drogas', emphasis: true },
            { text: 'Negarse a las pruebas de detección' },
            { text: 'Conducción temeraria, en sentido contrario o con vehículo no autorizado' },
            { text: 'Velocidad excesiva: >60 km/h en vías urbanas o >80 km/h en vías interurbanas sobre el límite' },
            { text: 'Usar el móvil sostenido con la mano' },
            { text: 'No respetar prioridad de peatones, ciclistas o emergencias' },
            { text: 'Saltarse semáforo en rojo o STOP' },
          ]},
          { type: 'subsection', title: '4 puntos' },
          { type: 'list', items: [
            { text: 'Velocidad excesiva: 41-60 km/h sobre el límite (urbano) o 51-80 (interurbano)' },
            { text: 'No usar cinturón, casco o SRI' },
            { text: 'Adelantamientos peligrosos' },
            { text: 'Llevar pasajeros en exceso (más del 50% por encima)' },
          ]},
          { type: 'subsection', title: '3 puntos' },
          { type: 'list', items: [
            { text: 'Exceso de velocidad: 21-40 km/h sobre el límite (urbano)' },
            { text: 'Tirar objetos a la calzada que puedan ocasionar fuego' },
            { text: 'Conducir con auriculares conectados a dispositivos' },
          ]},
          { type: 'subsection', title: '2 puntos' },
          { type: 'list', items: [
            { text: 'Estacionar en zonas reservadas (PMR, carga, taxis)' },
            { text: 'Circular por el arcén' },
            { text: 'No mantener la distancia de seguridad' },
            { text: 'No señalizar maniobras' },
          ]},
        ],
      },
      {
        id: 'pt_recuperar', title: 'Recuperación de puntos',
        blocks: [
          { type: 'subsection', title: 'Recuperación voluntaria (sin perder todos)' },
          { type: 'list', items: [
            { text: 'Curso de sensibilización', detail: 'De 12 horas. Recuperas hasta 6 puntos (2 puntos por curso, máximo 6 puntos por curso y hasta 15 puntos en total).' },
            { text: 'Frecuencia', detail: 'Máximo un curso cada 2 años (o cada año para profesionales).' },
            { text: 'Coste', detail: '~200€ aproximadamente.' },
          ]},
          { type: 'subsection', title: 'Recuperación automática' },
          { type: 'list', items: [
            { text: 'Si no cometes infracciones graves o muy graves durante 2 años', detail: 'Recuperas el saldo completo (12 puntos).' },
            { text: 'Si no cometes infracciones muy graves durante 3 años', detail: 'Recuperas el saldo completo aunque hayas cometido graves.' },
          ]},
          { type: 'subsection', title: 'Si pierdes todos los puntos' },
          { type: 'list', items: [
            { text: 'Plazo de espera', detail: '6 meses (sin reincidencia previa de pérdida total) o 12 meses (con reincidencia o conductor profesional).' },
            { text: 'Curso de reeducación vial', detail: 'De 24 horas. Obligatorio.' },
            { text: 'Examen teórico', detail: 'Sí o sí, aunque ya tuvieras el carné. Si no lo apruebas, sigues sin permiso.' },
            { text: 'Recuperas con saldo inicial', detail: '8 puntos.' },
          ]},
          { type: 'warning', text: 'Si pierdes los puntos siendo novel, el procedimiento es el mismo (espera + curso + examen). No hay tratamiento más leve.' },
        ],
      },
    ],
  },
];

