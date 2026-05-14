import { Topic } from '../types';

export const ALL_TOPICS: Topic[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. SEÑALES DE TRÁFICO
  // ─────────────────────────────────────────────────────────────
  {
    id: 'senales', name: 'Señales de Tráfico', emoji: '🚦',
    description: 'Domina todas las señales de la DGT', colorHex: '#E63946',
    lessons: [
      {
        id: 'sen_l1', title: 'Tipos de Señales', subtitle: 'Forma y color de cada señal', difficulty: 'Básico',
        questions: [
          { id: 's1q1', text: '¿Qué forma tienen las señales de peligro?', options: ['Circular', 'Triangular con vértice arriba', 'Cuadrada', 'Octogonal'], correctIndex: 1, explanation: 'Las señales de peligro son triángulos con vértice arriba, fondo blanco y borde rojo. Advierten de un riesgo próximo.', category: 'señales' },
          { id: 's1q2', text: '¿Qué indican las señales circulares con fondo blanco y borde rojo?', options: ['Peligro', 'Obligación', 'Prohibición o restricción', 'Información'], correctIndex: 2, explanation: 'Fondo blanco con borde rojo = prohibición o restricción. Ejemplo: velocidad máxima, prohibido adelantar.', category: 'señales' },
          { id: 's1q3', text: '¿Qué significa una señal circular con fondo azul?', options: ['Prohibición', 'Peligro', 'Obligación', 'Información'], correctIndex: 2, explanation: 'Las señales circulares azules indican obligación. Debes cumplir lo que indica sin excepción.', category: 'señales' },
          { id: 's1q4', text: '¿Cómo es la señal de STOP?', options: ['Triangular roja', 'Octogonal roja con letras blancas', 'Circular roja', 'Cuadrada con letras negras'], correctIndex: 1, explanation: 'La señal STOP es octogonal (8 lados), fondo rojo, letras blancas. Obligación de parada total.', category: 'señales' },
          { id: 's1q5', text: '¿Qué forma tiene la señal de Ceda el Paso?', options: ['Circular con borde rojo', 'Triangular vértice arriba', 'Triangular invertida (vértice abajo)', 'Octogonal'], correctIndex: 2, explanation: 'Ceda el Paso es un triángulo invertido con vértice abajo, fondo blanco y borde rojo.', category: 'señales' },
          { id: 's1q6', text: 'Un semáforo en ámbar significa...', options: ['Acelerar para pasar', 'Continuar normalmente', 'Detenerse salvo que frenar sea peligroso', 'Solo aplica a peatones'], correctIndex: 2, explanation: 'El ámbar obliga a detenerse. Solo puedes seguir si ya estás tan cerca que frenar sería peligroso.', category: 'señales' },
          { id: 's1q7', text: '¿Cuántas señales de peligro existen en la normativa española?', options: ['Menos de 20', 'Entre 30 y 40', 'Más de 50', 'Exactamente 25'], correctIndex: 2, explanation: 'El catálogo de señales de peligro supera las 50 variedades, cubriendo todos los riesgos posibles de la vía.', category: 'señales' },
          { id: 's1q8', text: '¿Qué tipo de señal indica el fin de una prohibición?', options: ['Un triángulo negro', 'Una circular con banda diagonal negra sobre fondo blanco', 'Una rectangular azul', 'Una circular azul'], correctIndex: 1, explanation: 'Las señales de fin de prohibición son circulares con fondo blanco y una o varias barras diagonales negras.', category: 'señales' },
        ],
      },
      {
        id: 'sen_l2', title: 'Marcas Viales', subtitle: 'Líneas y marcas en el asfalto', difficulty: 'Básico',
        questions: [
          { id: 's2q1', text: '¿Qué indica una línea longitudinal continua en el centro de la calzada?', options: ['Puedes cruzarla con visibilidad', 'Prohibido cruzarla o circular sobre ella', 'Indica carril bus', 'Solo aplica de noche'], correctIndex: 1, explanation: 'La línea continua prohíbe cruzarla. Separa sentidos y no puede sobrepasarse salvo emergencia.', category: 'señales' },
          { id: 's2q2', text: '¿Qué indica una línea longitudinal discontinua en el centro?', options: ['Prohibido adelantar siempre', 'Puedes cruzarla si la maniobra es segura', 'Carril exclusivo para motos', 'Línea de detención'], correctIndex: 1, explanation: 'La línea discontinua permite cruzarla para adelantar u otras maniobras si existe visibilidad y seguridad.', category: 'señales' },
          { id: 's2q3', text: '¿Qué indican las marcas viales amarillas?', options: ['Marcas permanentes de prioridad', 'Marcas provisionales (obras) que prevalecen sobre las blancas', 'Carril reservado para taxis', 'Zona de aparcamiento prohibido'], correctIndex: 1, explanation: 'Las marcas amarillas son provisionales, usadas principalmente en obras. Tienen prioridad sobre las marcas blancas permanentes.', category: 'señales' },
          { id: 's2q4', text: '¿Qué indica un ceda el paso pintado en el asfalto (triángulo o línea de cedas)?', options: ['Zona escolar', 'Debes ceder el paso al tráfico que circula por la vía a la que accedes', 'Paso para ciclistas', 'Inicio de autopista'], correctIndex: 1, explanation: 'La marca de ceda el paso en el suelo refuerza la señal vertical e indica que debes dar prioridad al tráfico de la vía que cruzas.', category: 'señales' },
          { id: 's2q5', text: '¿Qué indica una línea de stop pintada en el suelo?', options: ['Reducción de velocidad', 'Detenerse completamente antes de esa línea', 'Paso de peatones', 'Inicio de carril de aceleración'], correctIndex: 1, explanation: 'La línea de stop en el suelo marca exactamente dónde debes detenerte antes de incorporarte a la vía principal.', category: 'señales' },
          { id: 's2q6', text: '¿Qué indican las flechas pintadas en el carril?', options: ['Velocidad máxima recomendada', 'La dirección o sentido obligatorio de circulación en ese carril', 'Zona de aparcamiento', 'Carril reversible'], correctIndex: 1, explanation: 'Las flechas en el carril indican la dirección obligatoria. Si el carril lleva flecha de giro, debes girar.', category: 'señales' },
          { id: 's2q7', text: '¿A qué distancia mínima de un cruce deben colocarse las líneas de detención en zona urbana?', options: ['1 metro', '5 metros', 'No hay distancia mínima regulada', '10 metros'], correctIndex: 2, explanation: 'La normativa no fija una distancia mínima universal para líneas de detención en zona urbana; depende del diseño de la intersección.', category: 'señales' },
        ],
      },
      {
        id: 'sen_l3', title: 'Señales Especiales', subtitle: 'Semáforos, agentes y señales variables', difficulty: 'Intermedio',
        questions: [
          { id: 's3q1', text: '¿Qué prevalece en caso de contradicción entre señal vertical y semáforo?', options: ['La señal vertical', 'El semáforo', 'La marca vial', 'El criterio del conductor'], correctIndex: 1, explanation: 'El orden de prioridad es: agente de tráfico > semáforo > señales verticales > marcas viales.', category: 'señales' },
          { id: 's3q2', text: '¿Qué indica un semáforo apagado?', options: ['Vía libre sin restricciones', 'Ceda el paso a la derecha', 'Tratar como intersección sin señalizar (regla de la derecha)', 'Está prohibido pasar'], correctIndex: 2, explanation: 'Un semáforo apagado se trata como una intersección no señalizada: se aplica la regla de ceder el paso al vehículo de la derecha.', category: 'señales' },
          { id: 's3q3', text: 'Un panel de mensaje variable que muestra una X sobre tu carril indica...', options: ['Carril de alta ocupación', 'Carril cerrado al tráfico; debes cambiar de carril', 'Velocidad máxima 60 km/h', 'Zona de peaje'], correctIndex: 1, explanation: 'La X roja sobre un carril en un panel variable indica que ese carril está cerrado. Debes incorporarte al carril adyacente con seguridad.', category: 'señales' },
          { id: 's3q4', text: 'Las instrucciones de un agente de tráfico...', options: ['Solo son obligatorias en autopista', 'Prevalecen sobre cualquier señal o semáforo', 'Son una recomendación, no una obligación', 'Solo aplican a camiones'], correctIndex: 1, explanation: 'Los agentes de tráfico tienen la máxima autoridad sobre la circulación. Sus instrucciones prevalecen sobre señales, semáforos y marcas viales.', category: 'señales' },
          { id: 's3q5', text: '¿Qué indica un semáforo con flecha verde?', options: ['Puedes avanzar en todas las direcciones', 'Solo puedes circular en la dirección que indica la flecha', 'Prioridad para peatones', 'Carril exclusivo para autobuses'], correctIndex: 1, explanation: 'La flecha verde indica que puedes circular únicamente en la dirección señalada por la flecha, aunque el semáforo general esté en rojo.', category: 'señales' },
          { id: 's3q6', text: '¿Qué señal indica que está prohibido el acceso en ese sentido?', options: ['Triángulo rojo', 'Círculo rojo con barra horizontal blanca (dirección prohibida)', 'Cuadrado azul', 'Círculo azul con flecha'], correctIndex: 1, explanation: 'La señal de dirección prohibida es un círculo rojo con barra horizontal blanca. Prohíbe el acceso en ese sentido.', category: 'señales' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 2. VELOCIDADES
  // ─────────────────────────────────────────────────────────────
  {
    id: 'velocidades', name: 'Velocidades', emoji: '⚡',
    description: 'Límites y adaptación de la velocidad', colorHex: '#FF9800',
    lessons: [
      {
        id: 'vel_l1', title: 'Límites Generales', subtitle: 'Velocidades máximas por tipo de vía', difficulty: 'Básico',
        questions: [
          { id: 'v1q1', text: '¿Cuál es la velocidad máxima en autopista para turismos?', options: ['100 km/h', '110 km/h', '120 km/h', '130 km/h'], correctIndex: 2, explanation: 'La velocidad máxima en autopistas y autovías es 120 km/h para turismos y motocicletas.', category: 'velocidades' },
          { id: 'v1q2', text: '¿Cuál es la velocidad máxima en carretera convencional para turismos?', options: ['70 km/h', '80 km/h', '90 km/h', '100 km/h'], correctIndex: 2, explanation: 'En carreteras convencionales fuera de poblado, el límite para turismos es 90 km/h (70 km/h sin arcén practicable).', category: 'velocidades' },
          { id: 'v1q3', text: '¿Cuál es el límite genérico en vías urbanas con dos o más carriles por sentido?', options: ['30 km/h', '40 km/h', '50 km/h', '60 km/h'], correctIndex: 2, explanation: 'En vías urbanas con dos o más carriles por sentido, el límite genérico es 50 km/h.', category: 'velocidades' },
          { id: 'v1q4', text: 'Desde mayo 2021, ¿qué límite tienen las calles urbanas de un solo carril por sentido?', options: ['20 km/h', '30 km/h', '40 km/h', '50 km/h'], correctIndex: 1, explanation: 'Desde mayo 2021, las calles urbanas con un carril por sentido y aceras a ambos lados tienen límite de 30 km/h.', category: 'velocidades' },
          { id: 'v1q5', text: '¿A qué velocidad máxima circula un turismo con remolque >750 kg en autopista?', options: ['80 km/h', '90 km/h', '100 km/h', '120 km/h'], correctIndex: 0, explanation: 'Con remolque de más de 750 kg, la velocidad máxima en autopista es 80 km/h.', category: 'velocidades' },
          { id: 'v1q6', text: '¿Cuál es la velocidad mínima en autopista?', options: ['40 km/h', '50 km/h', '60 km/h', '70 km/h'], correctIndex: 2, explanation: 'La velocidad mínima en autopista es 60 km/h (la mitad del límite máximo de 120 km/h).', category: 'velocidades' },
          { id: 'v1q7', text: '¿Qué velocidad máxima tienen los camiones pesados (>3.500 kg) en autopista?', options: ['80 km/h', '90 km/h', '100 km/h', '110 km/h'], correctIndex: 2, explanation: 'Los vehículos de más de 3.500 kg de MMA tienen un límite de 100 km/h en autopista y autovía.', category: 'velocidades' },
          { id: 'v1q8', text: '¿Cuál es el límite en una zona 20?', options: ['10 km/h', '20 km/h', '30 km/h', '40 km/h'], correctIndex: 1, explanation: 'Las zonas de coexistencia (zona 20) tienen un límite de 20 km/h. Peatones y ciclistas tienen prioridad.', category: 'velocidades' },
        ],
      },
      {
        id: 'vel_l2', title: 'Velocidad y Condiciones', subtitle: 'Adaptación a situaciones adversas', difficulty: 'Intermedio',
        questions: [
          { id: 'v2q1', text: '¿Cuándo debes reducir velocidad aunque no superes el límite legal?', options: ['Nunca, si respetas el límite eres seguro', 'Solo de noche', 'Cuando las condiciones de visibilidad, adherencia o tráfico lo requieran', 'Solo con lluvia intensa'], correctIndex: 2, explanation: 'El límite legal es el máximo, no la velocidad que siempre debes llevar. Debes adaptar la velocidad a las condiciones reales.', category: 'velocidades' },
          { id: 'v2q2', text: '¿Qué ocurre con la distancia de frenado al duplicar la velocidad?', options: ['Se duplica', 'Se triplica', 'Se cuadruplica', 'Se quintuplica'], correctIndex: 2, explanation: 'La distancia de frenado aumenta con el cuadrado de la velocidad. Al doblar la velocidad, necesitas cuatro veces más distancia.', category: 'velocidades' },
          { id: 'v2q3', text: '¿Cómo afecta el alcohol al tiempo de reacción?', options: ['Lo mejora ligeramente', 'No tiene efecto hasta 1 g/l', 'Lo alarga considerablemente', 'Solo afecta la coordinación, no la reacción'], correctIndex: 2, explanation: 'Con 0,5 g/l de alcohol, el tiempo de reacción puede aumentar más de un 30%, lo que a 120 km/h supone varios metros adicionales.', category: 'velocidades' },
          { id: 'v2q4', text: 'Circulando por autopista a 120 km/h, ¿cuántos metros recorres durante 1 segundo de distracción?', options: ['20 metros', '33 metros', '50 metros', '60 metros'], correctIndex: 1, explanation: '120 km/h equivale a 33,3 m/s. En 1 segundo de distracción recorres más de 33 metros sin mirar la vía.', category: 'velocidades' },
          { id: 'v2q5', text: 'Con lluvia intensa, ¿qué ocurre con la distancia de frenado?', options: ['No varía si el coche es moderno', 'Se reduce gracias al ABS', 'Puede multiplicarse por 2 o más', 'Solo varía en carretera sin asfalto'], correctIndex: 2, explanation: 'El agua en la calzada reduce drásticamente la adherencia. La distancia de frenado puede duplicarse o triplicarse con lluvia intensa.', category: 'velocidades' },
          { id: 'v2q6', text: '¿Qué es el aquaplaning?', options: ['Técnica de conducción eficiente', 'Pérdida de contacto del neumático con el asfalto por una capa de agua', 'Sistema de frenado automático', 'Señal de desgaste del neumático'], correctIndex: 1, explanation: 'El aquaplaning ocurre cuando el neumático "surfea" sobre el agua, perdiendo contacto con el asfalto y el control del vehículo.', category: 'velocidades' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 3. PREFERENCIA DE PASO
  // ─────────────────────────────────────────────────────────────
  {
    id: 'preferencia', name: 'Preferencia de Paso', emoji: '🔄',
    description: 'Quién tiene prioridad en cada situación', colorHex: '#4CAF50',
    lessons: [
      {
        id: 'pref_l1', title: 'Reglas Básicas', subtitle: 'Intersecciones, rotondas y prioridades', difficulty: 'Básico',
        questions: [
          { id: 'p1q1', text: 'En una intersección sin señalizar, ¿quién tiene prioridad?', options: ['El que llegó primero', 'El que viene por la izquierda', 'El que viene por la derecha', 'El que lleva más velocidad'], correctIndex: 2, explanation: 'La regla general es ceder el paso al vehículo que viene por la derecha cuando no hay señales que indiquen otra cosa.', category: 'preferencia' },
          { id: 'p1q2', text: '¿Quién tiene prioridad dentro de una rotonda?', options: ['El que va a entrar', 'El que ya circula dentro', 'El que viene por la derecha fuera de la rotonda', 'Ambos tienen la misma prioridad'], correctIndex: 1, explanation: 'El vehículo que ya circula dentro de la rotonda tiene prioridad. El que entra debe ceder el paso.', category: 'preferencia' },
          { id: 'p1q3', text: 'Un vehículo de emergencias con sirena y luces activadas...', options: ['Solo tiene prioridad en autopista', 'Tiene prioridad absoluta; debes facilitar su paso', 'Solo tiene prioridad en tu mismo sentido', 'Solo prioridad de noche'], correctIndex: 1, explanation: 'Los vehículos de emergencia en servicio urgente tienen prioridad absoluta. Debes apartarte y facilitarles el paso inmediatamente.', category: 'preferencia' },
          { id: 'p1q4', text: 'En una intersección con señal de STOP, ¿cuándo puedes continuar?', options: ['Cuando frenas brevemente sin ver peligro', 'Solo con semáforo verde', 'Tras detenerte completamente y cuando sea seguro', 'Siempre que vengas por la derecha'], correctIndex: 2, explanation: 'Con STOP debes detener completamente el vehículo, aunque no venga nadie, y continuar solo cuando sea seguro.', category: 'preferencia' },
          { id: 'p1q5', text: '¿Qué vehículo tiene preferencia en un carril de aceleración de autopista?', options: ['El que entra por el carril de aceleración', 'El que ya circula por el carril lento', 'Ambos tienen la misma preferencia', 'El que lleva más velocidad'], correctIndex: 1, explanation: 'El vehículo que ya circula por la autopista tiene preferencia. El que entra por el carril de aceleración debe adaptarse.', category: 'preferencia' },
          { id: 'p1q6', text: 'Los ciclistas en un paso para ciclistas señalizado...', options: ['Deben ceder el paso siempre a los vehículos', 'Tienen prioridad frente a los vehículos', 'No tienen preferencia en ningún caso', 'Solo tienen prioridad si llevan casco'], correctIndex: 1, explanation: 'En los pasos para ciclistas señalizados, los ciclistas tienen preferencia sobre los vehículos de motor.', category: 'preferencia' },
          { id: 'p1q7', text: 'Un autobús urbano señaliza su intención de incorporarse desde una parada. Los vehículos que circulan...', options: ['Tienen siempre prioridad sobre el autobús', 'Deben ceder el paso al autobús en vía urbana', 'Solo ceden el paso si el autobús ya ha arrancado', 'No tienen que ceder el paso en ningún caso'], correctIndex: 1, explanation: 'En vías urbanas, los conductores deben ceder el paso a los autobuses de servicio público que indiquen su intención de incorporarse al tráfico.', category: 'preferencia' },
        ],
      },
      {
        id: 'pref_l2', title: 'Casos Especiales', subtitle: 'Trenes, puentes y situaciones complejas', difficulty: 'Intermedio',
        questions: [
          { id: 'p2q1', text: '¿Quién tiene prioridad absoluta en un paso a nivel?', options: ['El vehículo más grande', 'El vehículo que llegó primero', 'El ferrocarril siempre', 'El conductor que venga por la derecha'], correctIndex: 2, explanation: 'El ferrocarril tiene prioridad absoluta en los pasos a nivel. Nunca intentes cruzar si hay un tren aproximándose.', category: 'preferencia' },
          { id: 'p2q2', text: 'En un puente o paso estrecho donde dos vehículos no caben a la vez, ¿quién tiene prioridad?', options: ['El que va cuesta arriba', 'El más pequeño', 'El que llegó primero', 'El que va hacia la derecha'], correctIndex: 0, explanation: 'En pasos estrechos cuesta arriba, el vehículo que sube tiene prioridad sobre el que baja, ya que le es más difícil retroceder.', category: 'preferencia' },
          { id: 'p2q3', text: '¿Los peatones tienen preferencia en todos los pasos de peatones?', options: ['Sí, siempre y en todo caso', 'Sí, cuando estén pisando o vayan a pisar el paso', 'No, solo si hay semáforo para ellos', 'Solo en zona urbana'], correctIndex: 1, explanation: 'Los peatones tienen prioridad en los pasos señalizados cuando están cruzando o cuando es evidente su intención de cruzar.', category: 'preferencia' },
          { id: 'p2q4', text: '¿Cuál es la prioridad entre una vía principal y una secundaria?', options: ['La secundaria tiene prioridad si viene de la derecha', 'La principal siempre tiene prioridad', 'Depende del tamaño del vehículo', 'La que tenga más carriles'], correctIndex: 1, explanation: 'Los vehículos que circulan por la vía principal tienen prioridad sobre los que provienen de vías secundarias, independientemente de la regla de la derecha.', category: 'preferencia' },
          { id: 'p2q5', text: '¿Los vehículos que realizan trabajos de conservación de la vía tienen prioridad especial?', options: ['No, se rigen por las mismas normas', 'Sí, tienen prioridad similar a los de emergencia', 'Solo si llevan señales luminosas en funcionamiento', 'Solo en autopista'], correctIndex: 2, explanation: 'Los vehículos de obras y conservación de vías con señales luminosas especiales en funcionamiento tienen cierta preferencia de paso que debe ser respetada.', category: 'preferencia' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 4. ALCOHOL Y DROGAS
  // ─────────────────────────────────────────────────────────────
  {
    id: 'alcohol', name: 'Alcohol y Drogas', emoji: '🍺',
    description: 'Efectos, límites legales y sanciones', colorHex: '#9C27B0',
    lessons: [
      {
        id: 'alc_l1', title: 'Límites y Efectos', subtitle: 'Tasas legales y consecuencias', difficulty: 'Básico',
        questions: [
          { id: 'a1q1', text: '¿Cuál es el límite de alcohol en sangre para conductores en general?', options: ['0,3 g/l', '0,5 g/l', '0,8 g/l', '1,0 g/l'], correctIndex: 1, explanation: 'El límite general es 0,5 g/l en sangre (0,25 mg/l en aire espirado). Superarlo es infracción grave.', category: 'alcohol' },
          { id: 'a1q2', text: '¿Cuál es el límite para conductores noveles (menos de 2 años de permiso)?', options: ['0,5 g/l', '0,4 g/l', '0,3 g/l', '0,1 g/l'], correctIndex: 2, explanation: 'Conductores con menos de 2 años de permiso y conductores profesionales: límite de 0,3 g/l (0,15 mg/l en aire).', category: 'alcohol' },
          { id: 'a1q3', text: '¿Cuál es la tasa en aire espirado del límite general?', options: ['0,15 mg/l', '0,20 mg/l', '0,25 mg/l', '0,30 mg/l'], correctIndex: 2, explanation: 'El límite en aire espirado para conductores generales es 0,25 mg/l. Es la prueba más habitual en controles de tráfico.', category: 'alcohol' },
          { id: 'a1q4', text: '¿Puedes negarte a la prueba de alcoholemia?', options: ['Sí, es un derecho constitucional', 'Sí, pero solo de noche', 'No, negarse es infracción muy grave', 'Sí, si no has bebido nada'], correctIndex: 2, explanation: 'Negarse a la prueba de alcoholemia es infracción muy grave, equivalente a conducir con tasas muy superiores al límite. Puede implicar hasta 6 meses de prisión.', category: 'alcohol' },
          { id: 'a1q5', text: '¿Cómo afecta el alcohol a la conducción?', options: ['Mejora la concentración en dosis bajas', 'Solo afecta a partir de 0,8 g/l', 'Aumenta el tiempo de reacción y reduce la concentración', 'Mejora la visión nocturna'], correctIndex: 2, explanation: 'El alcohol aumenta el tiempo de reacción, reduce la concentración, distorsiona distancias y velocidades, y genera exceso de confianza.', category: 'alcohol' },
          { id: 'a1q6', text: '¿Cuántos puntos se pierden por conducir con tasa superior al límite general?', options: ['2 puntos', '4 puntos', '6 puntos', '8 puntos'], correctIndex: 2, explanation: 'Conducir con tasa superior al límite conlleva la pérdida de 6 puntos del carné, además de multa de 500-1.000 €.', category: 'alcohol' },
          { id: 'a1q7', text: 'El alcohol se elimina del organismo aproximadamente a...', options: ['0,1 g/l por hora', '0,15 g/l por hora', '0,3 g/l por hora', '0,5 g/l por hora'], correctIndex: 1, explanation: 'El organismo elimina el alcohol a un ritmo aproximado de 0,10-0,15 g/l por hora. El café, el agua o el ejercicio no aceleran este proceso.', category: 'alcohol' },
          { id: 'a1q8', text: '¿El café o el agua fría eliminan los efectos del alcohol?', options: ['Sí, el café estimula y compensa el alcohol', 'El agua fría sí lo reduce', 'No, solo el tiempo elimina el alcohol del organismo', 'Depende de la cantidad de alcohol ingerida'], correctIndex: 2, explanation: 'Ningún remedio casero elimina el alcohol. Solo el paso del tiempo (metabolización) reduce la tasa de alcoholemia.', category: 'alcohol' },
        ],
      },
      {
        id: 'alc_l2', title: 'Drogas y Distracciones', subtitle: 'Sustancias y comportamientos peligrosos', difficulty: 'Intermedio',
        questions: [
          { id: 'a2q1', text: '¿Qué sustancias están prohibidas al volante además del alcohol?', options: ['Solo drogas ilegales', 'Drogas ilegales y medicamentos que afecten a la conducción', 'Solo el cannabis', 'Ninguna otra'], correctIndex: 1, explanation: 'Están prohibidas todas las sustancias que deterioren las capacidades: drogas ilegales y medicamentos que adviertan de no conducir.', category: 'alcohol' },
          { id: 'a2q2', text: 'Usar el móvil sin manos libres al volante supone perder...', options: ['2 puntos', '3 puntos', '6 puntos', '4 puntos'], correctIndex: 2, explanation: 'Desde 2022, usar el móvil sin manos libres supone pérdida de 6 puntos y multa de 200 euros.', category: 'alcohol' },
          { id: 'a2q3', text: 'El cannabis, ¿cuántos días puede detectarse en sangre?', options: ['Pocas horas', '1-2 días como máximo', 'Hasta 30 días en consumidores habituales', 'Solo es detectable en orina'], correctIndex: 2, explanation: 'El THC del cannabis puede detectarse en sangre hasta 30 días en consumidores habituales. Su presencia en sangre es suficiente para sancionar.', category: 'alcohol' },
          { id: 'a2q4', text: 'Conducir bajo los efectos de medicamentos que afectan la conducción...', options: ['No está regulado en España', 'Es legal si los tomás con receta', 'Está prohibido igual que conducir drogado', 'Solo es infracción en autopista'], correctIndex: 2, explanation: 'Conducir bajo los efectos de medicamentos que deterioren las capacidades (antihistamínicos, ansiolíticos, etc.) está prohibido y sancionado igual que las drogas.', category: 'alcohol' },
          { id: 'a2q5', text: '¿Cuánto aumenta el riesgo de accidente al usar el móvil al volante?', options: ['El doble', 'El triple', 'Cuatro veces más', 'No aumenta si es manos libres'], correctIndex: 2, explanation: 'Usar el móvil multiplica por 4 el riesgo de accidente. Incluso el manos libres distrae cognitivamente al conductor.', category: 'alcohol' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 5. DISTANCIAS Y ADELANTAMIENTO
  // ─────────────────────────────────────────────────────────────
  {
    id: 'distancias', name: 'Distancias y Adelantamiento', emoji: '🚗',
    description: 'Seguridad en la distancia y cómo adelantar', colorHex: '#2196F3',
    lessons: [
      {
        id: 'dist_l1', title: 'Distancia de Seguridad', subtitle: 'Cuánto espacio dejar', difficulty: 'Básico',
        questions: [
          { id: 'd1q1', text: '¿Cómo se define la distancia de seguridad?', options: ['Siempre 50 m mínimo', 'La que permita frenar si el de delante frena bruscamente', 'Igual que la longitud del vehículo', 'Al menos 2 segundos'], correctIndex: 1, explanation: 'La distancia de seguridad es la necesaria para poder frenar sin colisionar si el vehículo de delante frena bruscamente. Depende de la velocidad y condiciones.', category: 'distancias' },
          { id: 'd1q2', text: '¿En qué vías existe obligación de mantener al menos 50 m de distancia?', options: ['En ciudad', 'En carretera convencional', 'En autopista/autovía a más de 100 km/h', 'En cualquier vía'], correctIndex: 2, explanation: 'En autopistas y autovías a más de 100 km/h se debe mantener como mínimo 50 metros de distancia, señalizados en algunos tramos.', category: 'distancias' },
          { id: 'd1q3', text: '¿Cuál es la distancia lateral mínima al adelantar a un ciclista?', options: ['0,5 m', '1 m', '1,5 m', '2 m'], correctIndex: 2, explanation: 'Debes dejar al menos 1,5 metros de separación lateral al adelantar a un ciclista, incluso si debes invadir el carril contrario.', category: 'distancias' },
          { id: 'd1q4', text: '¿Cuándo está PROHIBIDO adelantar?', options: ['En rectas largas', 'En curvas o cambios de rasante sin visibilidad suficiente', 'Cuando el de delante lleva menos de 60 km/h', 'En carretera de dos carriles'], correctIndex: 1, explanation: 'Está prohibido adelantar en curvas, cimas, pasos a nivel, intersecciones y cuando hay señal que lo prohíbe.', category: 'distancias' },
          { id: 'd1q5', text: '¿Qué debes señalizar antes de comenzar un adelantamiento?', options: ['Nada', 'El intermitente derecho', 'El intermitente izquierdo', 'Las luces de emergencia'], correctIndex: 2, explanation: 'Antes de adelantar activa el intermitente izquierdo. Una vez reincorporado, señaliza con el intermitente derecho.', category: 'distancias' },
          { id: 'd1q6', text: 'Cuando un vehículo te adelanta, ¿qué debes hacer?', options: ['Acelerar para que no te adelante', 'Mantener la velocidad y posición sin maniobras bruscas', 'Frenar bruscamente para facilitarle el hueco', 'Cambiar de carril hacia la izquierda'], correctIndex: 1, explanation: 'Cuando te adelantan debes mantener velocidad y posición, facilitando la maniobra sin acelerar ni obstaculizar.', category: 'distancias' },
          { id: 'd1q7', text: 'La regla de los "2 segundos" sirve para...', options: ['Calcular cuándo frenar en semáforos', 'Estimar la distancia de seguridad mínima', 'Decidir cuándo adelantar', 'Medir el tiempo de reacción'], correctIndex: 1, explanation: 'La regla de los 2 segundos te ayuda a mantener una distancia de seguridad: cuenta 2 segundos desde que el vehículo de delante pasa un punto fijo.', category: 'distancias' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 6. PRIMEROS AUXILIOS
  // ─────────────────────────────────────────────────────────────
  {
    id: 'auxilios', name: 'Primeros Auxilios', emoji: '🚑',
    description: 'Cómo actuar ante un accidente de tráfico', colorHex: '#F44336',
    lessons: [
      {
        id: 'aux_l1', title: 'Protocolo PAS', subtitle: 'Proteger, Avisar, Socorrer', difficulty: 'Básico',
        questions: [
          { id: 'ax1q1', text: '¿Cuáles son los pasos del protocolo PAS?', options: ['Parar, Atender, Salir', 'Proteger, Avisar, Socorrer', 'Prevenir, Asistir, Salvar', 'Parar, Avisar, Socorrer'], correctIndex: 1, explanation: 'PAS: Proteger (señalizar, zona segura), Avisar (llamar al 112) y Socorrer (ayudar sin mover al herido salvo peligro).', category: 'auxilios' },
          { id: 'ax1q2', text: '¿A qué número llamas ante una emergencia en España?', options: ['091', '062', '112', '061'], correctIndex: 2, explanation: 'El 112 es el número único de emergencias en España y la UE. Gratuito, 24h, redirige a policía, bomberos o ambulancias.', category: 'auxilios' },
          { id: 'ax1q3', text: '¿Cuándo está justificado mover a un herido en un accidente?', options: ['Siempre, para comodidad', 'Solo si lo pide el herido', 'Solo si hay riesgo inminente (incendio, explosión, ahogamiento)', 'Nunca se debe mover'], correctIndex: 2, explanation: 'No se mueve a un herido por riesgo de lesión medular. Solo si hay peligro inmediato como fuego, explosión o ahogamiento.', category: 'auxilios' },
          { id: 'ax1q4', text: '¿Qué es la posición lateral de seguridad (PLS)?', options: ['Posición para RCP', 'Boca arriba con piernas elevadas', 'De lado, para inconscientes que respiran', 'Sentado con cabeza entre rodillas'], correctIndex: 2, explanation: 'La PLS se aplica a personas inconscientes que respiran. Evita que se atraganten con vómitos o la lengua. No usar si hay sospecha de lesión cervical.', category: 'auxilios' },
          { id: 'ax1q5', text: '¿Cuál es la proporción correcta de la RCP?', options: ['15 compresiones y 1 respiración', '30 compresiones y 2 respiraciones', '10 compresiones y 2 respiraciones', '20 compresiones y 1 respiración'], correctIndex: 1, explanation: 'La RCP estándar es 30 compresiones cardíacas seguidas de 2 respiraciones. Compresiones de 5-6 cm de profundidad y ritmo de 100-120 por minuto.', category: 'auxilios' },
          { id: 'ax1q6', text: '¿Qué NO debes hacer ante un motorista accidentado?', options: ['Hablarle para tranquilizarle', 'Taparle con una manta', 'Quitarle el casco si está inconsciente', 'Mantener vías aéreas despejadas'], correctIndex: 2, explanation: 'Nunca quites el casco salvo que sea imprescindible para la RCP. El riesgo de agravar lesiones cervicales es muy alto. Solo los sanitarios deben hacerlo.', category: 'auxilios' },
          { id: 'ax1q7', text: 'Una persona sangra abundantemente de una herida en el brazo. Debes...', options: ['Aplicar un torniquete inmediatamente', 'Presionar firmemente con un paño limpio sobre la herida', 'Lavarla con agua', 'Dejar que sangre para limpiar la herida'], correctIndex: 1, explanation: 'La presión directa sobre la herida con un paño limpio (o tela) es la forma más eficaz de controlar una hemorragia. El torniquete solo se usa como último recurso.', category: 'auxilios' },
          { id: 'ax1q8', text: '¿Qué señales indican que alguien está en parada cardiorrespiratoria?', options: ['Está mareado y sudoroso', 'Está inconsciente, no respira y no tiene pulso perceptible', 'Tiene la cara roja y respira con dificultad', 'Tiene náuseas y vómitos'], correctIndex: 1, explanation: 'La parada cardiorrespiratoria se identifica por pérdida de consciencia, ausencia de respiración normal y ausencia de signos de circulación. Requiere RCP inmediata.', category: 'auxilios' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 7. EL VEHÍCULO
  // ─────────────────────────────────────────────────────────────
  {
    id: 'vehiculo', name: 'El Vehículo', emoji: '🔧',
    description: 'Mantenimiento, ITV y documentación', colorHex: '#607D8B',
    lessons: [
      {
        id: 'veh_l1', title: 'ITV y Documentación', subtitle: 'Inspección técnica y papeles obligatorios', difficulty: 'Básico',
        questions: [
          { id: 'vh1q1', text: '¿Cuándo pasa la primera ITV un turismo nuevo?', options: ['A los 2 años', 'A los 3 años', 'A los 4 años', 'A los 5 años'], correctIndex: 2, explanation: 'Los turismos nuevos están exentos durante los primeros 4 años. Luego cada 2 años hasta los 10, y después cada año.', category: 'vehiculo' },
          { id: 'vh1q2', text: '¿Con qué periodicidad pasa la ITV un turismo de 12 años?', options: ['Cada 4 años', 'Cada 2 años', 'Cada año', 'Cada 6 meses'], correctIndex: 2, explanation: 'Los vehículos con más de 10 años deben pasar la ITV cada año.', category: 'vehiculo' },
          { id: 'vh1q3', text: '¿Qué documentos son obligatorios llevar al volante?', options: ['Permiso conducción, permiso circulación y seguro', 'Solo el permiso de conducción', 'Permiso de conducción, ficha técnica y seguro', 'Solo el seguro y el DNI'], correctIndex: 0, explanation: 'Son obligatorios: permiso de conducción (del conductor), documentación del vehículo (permiso de circulación) y acreditación del seguro.', category: 'vehiculo' },
          { id: 'vh1q4', text: '¿Cuál es la profundidad mínima del dibujo de los neumáticos?', options: ['0,8 mm', '1,0 mm', '1,6 mm', '2,0 mm'], correctIndex: 2, explanation: 'La profundidad mínima del dibujo del neumático es 1,6 mm. Por debajo, el neumático pierde eficacia en evacuación de agua.', category: 'vehiculo' },
          { id: 'vh1q5', text: '¿Qué etiqueta medioambiental tienen los vehículos eléctricos puros?', options: ['Etiqueta B', 'Etiqueta C', 'Etiqueta ECO', 'Etiqueta 0 emisiones'], correctIndex: 3, explanation: 'Los vehículos eléctricos de batería (BEV) y de hidrógeno (FCEV) tienen la etiqueta "0 emisiones", la más favorable de la DGT.', category: 'vehiculo' },
          { id: 'vh1q6', text: '¿El cinturón de seguridad es obligatorio para todos los ocupantes?', options: ['Solo para los asientos delanteros', 'Solo en autopista y autovía', 'Sí, para todos los ocupantes en todos los asientos', 'Solo para el conductor'], correctIndex: 2, explanation: 'El cinturón de seguridad es obligatorio para todos los ocupantes del vehículo en todos los asientos y en cualquier tipo de vía.', category: 'vehiculo' },
        ],
      },
      {
        id: 'veh_l2', title: 'Luces y Equipamiento', subtitle: 'Alumbrado obligatorio y equipos de seguridad', difficulty: 'Intermedio',
        questions: [
          { id: 'vh2q1', text: '¿Cuándo es obligatorio el uso de luces de cruce (cortas) de día?', options: ['Nunca de día', 'En túneles, en lluvia intensa y cuando la visibilidad sea reducida', 'Solo en autopista de día', 'Siempre de día en cualquier vía'], correctIndex: 1, explanation: 'Las luces de cruce son obligatorias de día en túneles, lluvia intensa, niebla, o cuando la visibilidad sea inferior a 200 m.', category: 'vehiculo' },
          { id: 'vh2q2', text: '¿Cuándo se usan las luces de largo alcance (largas)?', options: ['De noche siempre', 'Solo en autopista', 'De noche fuera de poblado cuando no hay tráfico en sentido contrario y no deslumbras', 'Nunca, están prohibidas'], correctIndex: 2, explanation: 'Las luces largas se usan de noche fuera de poblado cuando no hay vehículos en sentido contrario ni delante que puedas deslumbrar.', category: 'vehiculo' },
          { id: 'vh2q3', text: '¿Qué elementos de seguridad son obligatorios llevar en el vehículo en España?', options: ['Solo el extintor', 'Dos triángulos de emergencia (o dispositivo V-16), chaleco reflectante y botiquín', 'Dos triángulos o dispositivo V-16 y chaleco reflectante', 'Solo el chaleco reflectante'], correctIndex: 2, explanation: 'En España es obligatorio llevar: dos triángulos de emergencia (o dispositivo V-16 homologado) y al menos un chaleco reflectante. El botiquín y extintor son recomendados pero no obligatorios para turismos.', category: 'vehiculo' },
          { id: 'vh2q4', text: '¿Cuándo es obligatorio ponerse el chaleco reflectante?', options: ['Solo de noche', 'Al salir del vehículo en caso de avería o accidente en cualquier vía', 'Solo en autopista', 'Solo si hay niebla'], correctIndex: 1, explanation: 'El chaleco reflectante debe ponerse ANTES de salir del vehículo en cualquier vía cuando te paras por avería o accidente. No después de salir.', category: 'vehiculo' },
          { id: 'vh2q5', text: '¿Cuándo debes revisar la presión de los neumáticos?', options: ['Solo una vez al año', 'Cuando el neumático parezca desinflado', 'Periódicamente y siempre con el neumático frío', 'Solo antes de viajes largos'], correctIndex: 2, explanation: 'La presión debe revisarse periódicamente con el neumático frío (el calor aumenta la presión y da lecturas incorrectas). Al menos una vez al mes.', category: 'vehiculo' },
          { id: 'vh2q6', text: '¿Qué indica el testigo de EPC (control electrónico de estabilidad) encendido en el cuadro?', options: ['Fallo en la dirección asistida', 'El sistema EPC está interviniendo activamente o hay un fallo', 'Bajo nivel de combustible', 'Fallo en el ABS'], correctIndex: 1, explanation: 'El testigo EPC/ESP encendido puede indicar que el sistema está interviniendo (normal en curva con baja adherencia) o que hay un fallo que requiere revisión del taller.', category: 'vehiculo' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 8. CONDUCCIÓN EFICIENTE
  // ─────────────────────────────────────────────────────────────
  {
    id: 'medioambiente', name: 'Conducción Eficiente', emoji: '🌿',
    description: 'Medio ambiente y ahorro de combustible', colorHex: '#8BC34A',
    lessons: [
      {
        id: 'eco_l1', title: 'Conducción Eficiente', subtitle: 'Ahorra combustible y contamina menos', difficulty: 'Básico',
        questions: [
          { id: 'ec1q1', text: '¿A cuántas RPM se recomienda cambiar de marcha en gasolina?', options: ['A 1.500 rpm', 'Entre 2.000 y 2.500 rpm', 'Entre 3.000 y 4.000 rpm', 'A más de 5.000 rpm'], correctIndex: 1, explanation: 'En gasolina se recomienda cambiar entre 2.000-2.500 rpm. En diesel, entre 1.500-2.000 rpm. Cambiar antes reduce el consumo.', category: 'medioambiente' },
          { id: 'ec1q2', text: '¿Qué práctica reduce más el consumo en ciudad?', options: ['Acelerar fuerte y frenar bruscamente', 'Anticipar frenados y mantener velocidad constante', 'Circular siempre en primera o segunda', 'Llevar el A/C al máximo'], correctIndex: 1, explanation: 'Anticipar frenados y mantener velocidad constante es la técnica más eficiente. Acelerar y frenar bruscamente desperdicia energía.', category: 'medioambiente' },
          { id: 'ec1q3', text: '¿Cómo afectan los neumáticos desinflados al consumo?', options: ['No tienen efecto', 'Los inflados en exceso reducen el consumo', 'Los desinflados aumentan la resistencia y el consumo hasta un 3%', 'Solo afectan a la seguridad'], correctIndex: 2, explanation: 'Un neumático desinflado tiene mayor resistencia a la rodadura, lo que aumenta el consumo y el desgaste. Revisa la presión regularmente.', category: 'medioambiente' },
          { id: 'ec1q4', text: '¿Qué etiqueta corresponde a un vehículo híbrido enchufable?', options: ['0 emisiones', 'ECO', 'C', 'B'], correctIndex: 1, explanation: 'Los vehículos híbridos enchufables (PHEV) y los de gas (GNC, GLP) tienen etiqueta ECO, la segunda más favorable.', category: 'medioambiente' },
          { id: 'ec1q5', text: '¿Cuándo es más rentable apagar el motor en ciudad?', options: ['Nunca', 'Cuando la parada prevista supera 60 segundos', 'Solo en zonas de bajas emisiones', 'Cuando el depósito está lleno'], correctIndex: 1, explanation: 'Si la parada prevista supera ~60 segundos, apagar el motor ahorra más combustible que dejarlo al ralentí.', category: 'medioambiente' },
          { id: 'ec1q6', text: '¿Qué etiqueta DGT tiene un vehículo diésel con norma Euro 6?', options: ['0 emisiones', 'ECO', 'C', 'B'], correctIndex: 2, explanation: 'Los vehículos diésel Euro 6 y gasolina Euro 4 o posterior tienen etiqueta C. Los vehículos sin etiqueta son los más contaminantes.', category: 'medioambiente' },
          { id: 'ec1q7', text: 'Circular con la ventanilla abierta en autopista...', options: ['Reduce el consumo al no usar el A/C', 'Aumenta la resistencia aerodinámica y el consumo', 'No afecta al consumo', 'Solo afecta por encima de 150 km/h'], correctIndex: 1, explanation: 'A partir de ~80 km/h, la ventanilla abierta aumenta la resistencia aerodinámica y el consumo más que el aire acondicionado.', category: 'medioambiente' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 9. INFRACCIONES Y SANCIONES (NUEVO)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'infracciones', name: 'Infracciones y Sanciones', emoji: '📋',
    description: 'Sistema de puntos, multas y sanciones DGT', colorHex: '#FF5722',
    lessons: [
      {
        id: 'inf_l1', title: 'Sistema de Puntos', subtitle: 'Cómo funciona el carnet por puntos', difficulty: 'Básico',
        questions: [
          { id: 'inf1q1', text: '¿Con cuántos puntos se inicia el carnet de conducir?', options: ['8 puntos', '10 puntos', '12 puntos', '15 puntos'], correctIndex: 2, explanation: 'El carnet de conducir se inicia con 12 puntos. Los conductores noveles (2 primeros años) solo tienen 8 puntos.', category: 'infracciones' },
          { id: 'inf1q2', text: '¿Cuántos puntos tiene un conductor novel en los primeros 2 años?', options: ['6 puntos', '8 puntos', '10 puntos', '12 puntos'], correctIndex: 1, explanation: 'Los conductores noveles comienzan con 8 puntos en los primeros 2 años. Superado ese periodo sin perder puntos, acceden a los 12 puntos completos.', category: 'infracciones' },
          { id: 'inf1q3', text: 'Superar en más de 60 km/h el límite en autopista supone perder...', options: ['2 puntos', '4 puntos', '6 puntos', '6 puntos y retirada inmediata del permiso'], correctIndex: 3, explanation: 'Superar el límite en más de 60 km/h conlleva pérdida de 6 puntos y puede suponer la retirada cautelar del permiso. Es infracción muy grave.', category: 'infracciones' },
          { id: 'inf1q4', text: '¿Se pueden recuperar puntos sin haber perdido todos?', options: ['No, solo se recuperan si pierdes todos', 'Sí, mediante un curso de sensibilización hasta 2 puntos (máx. 15 en total)', 'No se pueden recuperar puntos', 'Sí, automáticamente tras 2 años sin infracciones'], correctIndex: 1, explanation: 'Puedes recuperar hasta 2 puntos (máximo 15 en total) haciendo voluntariamente cursos de sensibilización y reeducación vial.', category: 'infracciones' },
          { id: 'inf1q5', text: '¿Cuántos puntos se pierden por no llevar cinturón de seguridad?', options: ['1 punto', '2 puntos', '3 puntos', '4 puntos'], correctIndex: 2, explanation: 'No llevar el cinturón de seguridad supone la pérdida de 3 puntos del carné, además de la multa correspondiente.', category: 'infracciones' },
          { id: 'inf1q6', text: 'Si pierdes todos los puntos, ¿qué debes hacer para recuperar el carnet?', options: ['Pagar una multa especial', 'Esperar 6 meses y presentarte a un examen teórico', 'Esperar 2 años, realizar curso de sensibilización y superar examen de aptitud', 'Solo esperar 1 año'], correctIndex: 2, explanation: 'Si pierdes todos los puntos, el permiso queda revocado. Debes esperar 2 años (o 3 si ya lo perdiste antes), hacer el curso de sensibilización y superar el examen de aptitud.', category: 'infracciones' },
          { id: 'inf1q7', text: '¿Cuántos puntos se pierden por saltarse un semáforo en rojo?', options: ['2 puntos', '3 puntos', '4 puntos', '6 puntos'], correctIndex: 3, explanation: 'Saltarse un semáforo en rojo es una infracción muy grave que conlleva la pérdida de 6 puntos del carné.', category: 'infracciones' },
          { id: 'inf1q8', text: 'Circular hablando por teléfono sujeto con la mano supone perder...', options: ['2 puntos', '3 puntos', '4 puntos', '6 puntos'], correctIndex: 3, explanation: 'Usar el teléfono sujetado con la mano al volante supone la pérdida de 6 puntos y multa de 200 euros.', category: 'infracciones' },
        ],
      },
      {
        id: 'inf_l2', title: 'Tipos de Infracciones', subtitle: 'Leves, graves y muy graves', difficulty: 'Intermedio',
        questions: [
          { id: 'inf2q1', text: '¿Qué se considera una infracción muy grave en el tráfico?', options: ['Aparcar en zona de carga y descarga', 'Superar el límite de velocidad en más de 60 km/h', 'No señalizar un cambio de carril', 'Llevar el vehículo sucio'], correctIndex: 1, explanation: 'Las infracciones muy graves incluyen conducir bajo los efectos del alcohol/drogas, superar el límite más de 60 km/h, saltarse semáforos en rojo, etc.', category: 'infracciones' },
          { id: 'inf2q2', text: '¿Cuál es la multa por exceso de velocidad entre 21 y 30 km/h sobre el límite?', options: ['100 €', '200 €', '300 €', '500 €'], correctIndex: 1, explanation: 'Superar el límite entre 21 y 30 km/h conlleva una multa de 200 euros, que puede reducirse al 50% si se paga en 20 días hábiles.', category: 'infracciones' },
          { id: 'inf2q3', text: 'Si recibes una multa, ¿en qué plazo puedes pagar con descuento del 50%?', options: ['5 días hábiles', '10 días hábiles', '20 días hábiles', '30 días naturales'], correctIndex: 2, explanation: 'Si pagas la multa dentro de los 20 días hábiles siguientes a la notificación, obtienes un descuento del 50% y renuncias al recurso.', category: 'infracciones' },
          { id: 'inf2q4', text: '¿Qué ocurre si acumulas 3 o más infracciones graves en 2 años?', options: ['Se duplica la multa', 'Se puede suspender el permiso temporalmente', 'Nada adicional a las multas individuales', 'Se retira el permiso definitivamente'], correctIndex: 1, explanation: 'La acumulación de infracciones graves puede conllevar, además de las sanciones individuales, la suspensión temporal del permiso de conducción.', category: 'infracciones' },
          { id: 'inf2q5', text: '¿Cuántos puntos se pierden por conducir sin seguro obligatorio?', options: ['3 puntos', '4 puntos', '6 puntos', 'No se pierden puntos, solo hay multa'], correctIndex: 2, explanation: 'Conducir sin el seguro obligatorio de responsabilidad civil conlleva la pérdida de 6 puntos y una multa de hasta 3.000 euros.', category: 'infracciones' },
          { id: 'inf2q6', text: '¿Cuántos puntos se pierden por no respetar la preferencia de paso en paso de peatones?', options: ['2 puntos', '3 puntos', '4 puntos', '6 puntos'], correctIndex: 3, explanation: 'No respetar la preferencia de los peatones en los pasos señalizados es una infracción muy grave que conlleva la pérdida de 6 puntos.', category: 'infracciones' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 10. LA VÍA Y EL ENTORNO (NUEVO)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'vias', name: 'La Vía y el Entorno', emoji: '🛣️',
    description: 'Tipos de vías, carriles y normas de circulación', colorHex: '#455A64',
    lessons: [
      {
        id: 'via_l1', title: 'Tipos de Vías', subtitle: 'Autopistas, autovías y carreteras', difficulty: 'Básico',
        questions: [
          { id: 'va1q1', text: '¿Qué diferencia principal existe entre autopista y autovía?', options: ['La velocidad máxima', 'La autopista es de peaje; la autovía es gratuita o puede no tener peaje', 'El número de carriles', 'No existe diferencia'], correctIndex: 1, explanation: 'La principal diferencia práctica es que las autopistas suelen ser de peaje, mientras que las autovías son en general gratuitas. Ambas tienen las mismas normas de circulación.', category: 'vias' },
          { id: 'va1q2', text: '¿Qué es una travesía?', options: ['Un túnel en autopista', 'El tramo de carretera convencional que atraviesa un núcleo de población', 'Una vía de servicio', 'Un carril de emergencia'], correctIndex: 1, explanation: 'Una travesía es el tramo de carretera que atraviesa un núcleo urbano. Suele tener límite de 50 km/h y señalización específica.', category: 'vias' },
          { id: 'va1q3', text: '¿Qué es el arcén?', options: ['La parte central de la autopista', 'La franja pavimentada lateral a la calzada', 'El carril adicional en cuesta', 'El carril de emergencia exclusivo de autopistas'], correctIndex: 1, explanation: 'El arcén es la franja pavimentada situada a ambos lados de la calzada. Sirve para detenciones de emergencia, pero no para circular normalmente.', category: 'vias' },
          { id: 'va1q4', text: '¿Puedes circular por el arcén en autopista?', options: ['Sí, si el tráfico es intenso', 'No, salvo en averías o emergencias', 'Sí, los ciclistas siempre pueden circular por el arcén', 'Sí, para adelantar en atascos'], correctIndex: 1, explanation: 'El arcén no es una calzada de circulación. Solo se usa en caso de avería o emergencia. Circular por él de forma ordinaria es una infracción.', category: 'vias' },
          { id: 'va1q5', text: '¿Qué es una vía de servicio?', options: ['El carril rápido de la autopista', 'Una vía paralela que da acceso a propiedades colindantes', 'Un carril adicional en zonas de obras', 'La vía central de una rotonda'], correctIndex: 1, explanation: 'Las vías de servicio son carreteras paralelas a una vía principal que dan acceso a propiedades y servicios colindantes sin interrumpir el tráfico de la vía principal.', category: 'vias' },
          { id: 'va1q6', text: '¿Qué indica la señal "Fin de autopista"?', options: ['Velocidad máxima 120 km/h', 'Que termina la autopista y debes adaptar la conducción a la vía siguiente', 'Obligación de parar en peaje', 'Zona de descanso obligatorio'], correctIndex: 1, explanation: 'La señal de fin de autopista indica que la vía cambia de tipo. Debes estar atento a la nueva señalización y adaptar velocidad y conducción.', category: 'vias' },
          { id: 'va1q7', text: '¿Cuándo es obligatorio circular por el carril derecho en autopista?', options: ['Solo si hay señal que lo indique', 'Siempre, salvo para adelantar, girar a la izquierda o cuando las condiciones lo aconsejen', 'Solo cuando hay tráfico intenso', 'Nunca es obligatorio'], correctIndex: 1, explanation: 'En autopistas y carreteras de varios carriles, siempre debes circular por el carril más a la derecha, usando los de la izquierda solo para adelantar.', category: 'vias' },
          { id: 'va1q8', text: '¿Qué está prohibido hacer en una autopista?', options: ['Circular a 100 km/h', 'Detenerse en el arcén salvo avería', 'Circular con las luces de cruce encendidas', 'Cambiar de carril señalizando'], correctIndex: 1, explanation: 'En autopista está prohibido detenerse salvo avería o emergencia. También están prohibidos los cambios de sentido, la circulación a pie, en bicicleta y las inversiones de marcha.', category: 'vias' },
        ],
      },
      {
        id: 'via_l2', title: 'Normas de Circulación', subtitle: 'Reglas básicas en la vía', difficulty: 'Básico',
        questions: [
          { id: 'va2q1', text: '¿Por qué carril debes circular habitualmente en una vía de dos carriles por sentido?', options: ['Por el izquierdo siempre', 'Por el derecho, usando el izquierdo solo para adelantar', 'Por cualquiera indistintamente', 'Por el izquierdo si vas deprisa'], correctIndex: 1, explanation: 'En vías con dos o más carriles por sentido, debes circular por el derecho. El carril izquierdo es para adelantar y debe abandonarse cuanto antes.', category: 'vias' },
          { id: 'va2q2', text: '¿Qué debes hacer al incorporarte a una autopista desde el carril de aceleración?', options: ['Detenerte y esperar un hueco', 'Incorporarte directamente sin señalizar', 'Señalizar, alcanzar la velocidad de la autopista e incorporarte cuando haya hueco', 'Circular por el arcén hasta encontrar hueco'], correctIndex: 2, explanation: 'Al incorporarte debes señalizar, acelerar en el carril de aceleración hasta la velocidad de la autopista e incorporarte cuando el tráfico lo permita, sin obligar a frenar a nadie.', category: 'vias' },
          { id: 'va2q3', text: '¿Qué distancia mínima debes dejar al cambiar de carril?', options: ['No hay distancia mínima regulada', 'La suficiente para que el vehículo de atrás pueda reaccionar con seguridad', '50 metros siempre', '100 metros en autopista'], correctIndex: 1, explanation: 'No existe una distancia mínima fijada en metros, pero debes asegurarte de que el cambio de carril no supone peligro para ningún vehículo, mirando los espejos y puntos ciegos.', category: 'vias' },
          { id: 'va2q4', text: '¿Cuándo se puede circular por la mediana de una autopista?', options: ['Para adelantar rápidamente', 'Nunca, la mediana no es zona de circulación', 'En caso de atasco', 'Si el carril derecho está cortado'], correctIndex: 1, explanation: 'La mediana separa los sentidos de circulación y nunca puede usarse para circular. Es infracción muy grave circular por ella.', category: 'vias' },
          { id: 'va2q5', text: '¿Qué debes hacer si te has pasado tu salida en autopista?', options: ['Dar marcha atrás por el arcén', 'Girar en redondo por la mediana', 'Continuar hasta la siguiente salida', 'Detenerte en el arcén y esperar'], correctIndex: 2, explanation: 'Si te pasas tu salida, debes continuar hasta la siguiente salida. Dar marcha atrás o girar en la autopista está estrictamente prohibido.', category: 'vias' },
          { id: 'va2q6', text: 'El uso del claxon está prohibido...', options: ['Siempre, excepto para avisar de peligro inmediato', 'En zonas urbanas salvo peligro inminente y de noche', 'En autopista siempre', 'Solo de noche en cualquier lugar'], correctIndex: 1, explanation: 'En zonas urbanas el claxon solo puede usarse para avisar de un peligro inminente. De noche, incluso fuera de poblado, se recomienda sustituirlo por destellos de luces.', category: 'vias' },
        ],
      },
    ],
  },
];
