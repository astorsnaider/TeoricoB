import { LEGAL } from './config';

const today = LEGAL.EFFECTIVE_DATE;

// ─── AVISO LEGAL (Art. 10 LSSI) ───────────────────────────────────

export const AVISO_LEGAL = `
TITULAR

${LEGAL.APP_NAME} es una aplicación móvil desarrollada y mantenida por ${LEGAL.RESPONSIBLE_NAME} (${LEGAL.RESPONSIBLE_TYPE}), con sede en ${LEGAL.JURISDICTION}. El presente Aviso Legal cumple con lo dispuesto en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).

CONTACTO

Para cualquier consulta relacionada con esta aplicación, los usuarios pueden dirigirse a:
${LEGAL.CONTACT_EMAIL}

OBJETO DE LA APLICACIÓN

${LEGAL.APP_NAME} es una herramienta de estudio complementaria y NO OFICIAL para preparar el examen teórico del permiso de conducción tipo B en España. Sus contenidos se elaboran a partir de fuentes oficiales públicas (Boletín Oficial del Estado y publicaciones abiertas de la Dirección General de Tráfico) y se redactan de forma original.

Esta aplicación no está vinculada, asociada, autorizada ni patrocinada por la Dirección General de Tráfico (DGT), el Ministerio del Interior ni ninguna otra entidad oficial. Las marcas, logotipos y denominaciones oficiales mencionados pertenecen a sus respectivos titulares y se utilizan únicamente con fines descriptivos e informativos.

PROPIEDAD INTELECTUAL

Los contenidos originales de la aplicación —incluyendo preguntas, explicaciones, diagramas, código fuente y diseño de interfaz— están protegidos por la Ley de Propiedad Intelectual. Queda prohibida su reproducción, distribución o transformación sin consentimiento expreso del titular.

Los textos legales citados (Reglamento General de Circulación, Ley sobre Tráfico, Circulación y Seguridad Vial) son de dominio público conforme al artículo 13 del Real Decreto Legislativo 1/1996. Las señales de tráfico reproducidas siguen las especificaciones técnicas definidas por dicha normativa.

RESPONSABILIDAD

${LEGAL.RESPONSIBLE_NAME} pone a disposición de los usuarios información elaborada con la máxima diligencia a partir de fuentes oficiales, pero no garantiza la ausencia total de errores u omisiones, ni que el contenido refleje siempre la última modificación normativa. El usuario es responsable de verificar la información actualizada con las fuentes oficiales antes de presentarse al examen.

LEGISLACIÓN APLICABLE

El presente Aviso Legal se rige por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los Juzgados y Tribunales del domicilio del titular, salvo que la normativa aplicable disponga otra cosa.

Última actualización: ${today}
`.trim();

// ─── TÉRMINOS Y CONDICIONES ───────────────────────────────────────

export const TERMINOS = `
1. ACEPTACIÓN

El uso de ${LEGAL.APP_NAME} implica la aceptación íntegra de los presentes Términos y Condiciones. Si no estás de acuerdo con alguna de las cláusulas, te recomendamos no utilizar la aplicación.

2. NATURALEZA DEL SERVICIO

${LEGAL.APP_NAME} es una herramienta gratuita de estudio para la preparación del examen teórico del permiso B. Tiene carácter exclusivamente educativo y orientativo, y NO sustituye:

• La formación obligatoria impartida por autoescuelas autorizadas.
• Las clases prácticas de conducción con instructor titulado.
• La consulta de la normativa oficial vigente (BOE).
• El examen oficial gestionado por la DGT.

3. USO ACEPTABLE

El usuario se compromete a usar la aplicación únicamente con fines lícitos y educativos. Quedan prohibidos:

• Modificar, descompilar o realizar ingeniería inversa de la aplicación.
• Reproducir, distribuir o comercializar sus contenidos.
• Usar la aplicación de forma que dañe, deshabilite o sobrecargue sus servicios.
• Utilizarla para cualquier actividad fraudulenta o ilícita.

4. LIMITACIÓN DE RESPONSABILIDAD

El titular de ${LEGAL.APP_NAME} no será responsable, en la máxima medida permitida por la ley, de:

• Errores u omisiones en el contenido educativo.
• Cambios en la normativa que pudieran no estar aún reflejados.
• Decisiones tomadas por el usuario basadas en la información proporcionada.
• Resultados del examen oficial DGT.
• Daños indirectos, lucro cesante o pérdida de oportunidad.

El usuario reconoce que el aprendizaje y la decisión final de presentarse al examen son su responsabilidad exclusiva, así como la verificación de la normativa vigente con las fuentes oficiales.

5. CONTENIDOS Y ACTUALIZACIÓN

Los contenidos se elaboran a partir de fuentes oficiales públicas y se actualizan periódicamente. No obstante, dada la naturaleza dinámica de la normativa, pueden existir desfases temporales entre una modificación legal y su incorporación a la app. El usuario debe contrastar siempre con las fuentes oficiales accesibles desde la propia aplicación.

6. PROPIEDAD INTELECTUAL

Todos los elementos originales de ${LEGAL.APP_NAME} (interfaz, código, textos originales, diagramas, base de preguntas) son propiedad de ${LEGAL.RESPONSIBLE_NAME} y están protegidos por la legislación de propiedad intelectual.

Las señales de tráfico utilizadas siguen los diseños oficiales definidos por ley (dominio público según Art. 13 LPI). Cuando se incluyan imágenes de terceros con licencia abierta (Wikimedia Commons, dominio público, Creative Commons), se indicará la atribución correspondiente en la sección de Créditos.

7. ENLACES A TERCEROS

La aplicación contiene enlaces a sitios web de terceros (BOE, DGT, materiales educativos externos). El titular no se responsabiliza del contenido ni de las políticas de privacidad de dichos sitios. El usuario accede a ellos bajo su propia responsabilidad.

8. MODIFICACIONES

El titular podrá modificar estos Términos en cualquier momento. Las modificaciones surtirán efecto desde su publicación en la aplicación. Se recomienda al usuario revisar periódicamente esta sección.

9. CESACIÓN DEL SERVICIO

El titular se reserva el derecho a suspender, modificar o cesar el servicio en cualquier momento, sin que ello genere derecho a indemnización alguna a favor del usuario.

10. LEGISLACIÓN APLICABLE Y JURISDICCIÓN

Los presentes Términos se rigen por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los Juzgados y Tribunales competentes según la normativa aplicable.

Última actualización: ${today}
`.trim();

// ─── POLÍTICA DE PRIVACIDAD ───────────────────────────────────────

export const PRIVACIDAD = `
1. RESPONSABLE DEL TRATAMIENTO

El responsable del tratamiento de los datos relacionados con ${LEGAL.APP_NAME} es ${LEGAL.RESPONSIBLE_NAME}, con domicilio en ${LEGAL.JURISDICTION}. Para cualquier consulta sobre protección de datos puedes dirigirte a ${LEGAL.CONTACT_EMAIL}.

2. DATOS QUE RECOGEMOS

${LEGAL.APP_NAME} es una aplicación 100% offline diseñada bajo el principio de minimización de datos del RGPD (Art. 5.1.c).

DATOS QUE GUARDAMOS LOCALMENTE EN TU DISPOSITIVO:
• Nombre que introduces en el onboarding.
• Color de avatar seleccionado.
• Progreso de estudio (lecciones completadas, XP, racha, vidas).
• Configuración personal (modo oscuro, ajustes).

ESTOS DATOS:
• NUNCA salen de tu dispositivo.
• NO se envían a ningún servidor.
• NO se comparten con terceros.
• NO se utilizan con fines publicitarios ni comerciales.

DATOS QUE NO RECOGEMOS:
• Correo electrónico.
• Número de teléfono.
• Ubicación geográfica.
• Acceso a contactos, cámara, micrófono o galería.
• Identificadores publicitarios.
• Datos biométricos.

3. BASE LEGAL

Al no producirse tratamiento de datos personales por nuestra parte (los datos solo residen en el dispositivo del usuario y están bajo su control exclusivo), no es aplicable la obligación de consentimiento del Art. 6 RGPD. La aplicación funciona bajo el principio de privacidad por diseño.

4. CONSERVACIÓN

Los datos almacenados en tu dispositivo se conservan mientras tengas la aplicación instalada. Puedes eliminarlos en cualquier momento desde:
• Ajustes > Reiniciar progreso (borra todos los datos de uso).
• Desinstalando la aplicación (elimina todos los datos sin posibilidad de recuperación).

5. DERECHOS DEL USUARIO

Aunque la aplicación no realiza tratamiento de datos personales por nuestra parte, te informamos de tus derechos conforme al RGPD y la LOPDGDD:

• Acceso, rectificación, supresión, oposición, limitación, portabilidad y a no ser objeto de decisiones automatizadas.
• Presentar reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).

Como los datos no salen de tu dispositivo, puedes ejercer todos estos derechos directamente desde la propia aplicación (Ajustes).

6. ENLACES A TERCEROS

La aplicación incluye enlaces a sitios oficiales (BOE, DGT) y eventualmente a recursos externos de terceros. Estos sitios tienen sus propias políticas de privacidad que no controlamos.

7. TIENDAS DE APLICACIONES

Cuando descargas la aplicación desde Apple App Store o Google Play, dichas plataformas pueden recoger datos sobre la descarga e instalación conforme a sus propias políticas. No recibimos ni gestionamos estos datos.

8. MODIFICACIONES

Esta Política puede actualizarse para reflejar cambios legales o de funcionamiento. La versión vigente siempre estará disponible en la propia aplicación.

9. CONTACTO

Para cualquier consulta sobre privacidad, puedes escribir a ${LEGAL.CONTACT_EMAIL}.

Última actualización: ${today}
`.trim();

// ─── DISCLAIMER DE PRIMERA APERTURA ───────────────────────────────

export const DISCLAIMER_TITLE = 'Antes de empezar';

export const DISCLAIMER_TEXT = `
${LEGAL.APP_NAME} es una herramienta de estudio complementaria, no oficial.

QUÉ ES:
Un material de apoyo elaborado a partir de fuentes oficiales públicas (BOE, publicaciones abiertas de la DGT) para ayudarte a prepararte el teórico del permiso B.

QUÉ NO ES:
• No sustituye a una autoescuela autorizada.
• No reemplaza las clases prácticas con instructor.
• No es el examen oficial DGT.
• No garantiza el aprobado del examen.

NUESTRO COMPROMISO:
• Contenido revisado contra la normativa vigente (BOE).
• Cada pregunta enlaza al artículo legal correspondiente.
• Actualización periódica según cambios normativos.

TU RESPONSABILIDAD:
• Inscribirte en una autoescuela autorizada.
• Consultar fuentes oficiales antes del examen.
• Avisarnos si detectas algún error en el contenido.
`.trim();

// ─── CRÉDITOS Y ATRIBUCIONES ──────────────────────────────────────

export const CREDITOS = `
CONTENIDO LEGAL CITADO

• Reglamento General de Circulación (Real Decreto 1428/2003).
  Texto íntegro en dominio público — BOE.
• Ley sobre Tráfico, Circulación de Vehículos a Motor y Seguridad Vial
  (Real Decreto Legislativo 6/2015). Texto íntegro en dominio público — BOE.

MATERIAL EDUCATIVO DE REFERENCIA

• "Manual del Permiso B en Lectura Fácil" (DGT, edición 2023). Publicación
  oficial de la Dirección General de Tráfico, publicada abiertamente en su
  web. Utilizada como referencia para la estructura temática del manual,
  con atribución y respeto a sus derechos.
• "Diccionario en Lectura Fácil — Permiso B" (DGT). Utilizada como referencia
  terminológica.

DISEÑO DE SEÑALES DE TRÁFICO

Los diseños técnicos de las señales viales (forma, colores, símbolos, proporciones)
están definidos por ley en el Anexo I del Reglamento General de Circulación
(RD 1428/2003). Como disposición reglamentaria, estos diseños son DOMINIO PÚBLICO
conforme al Art. 13 de la Ley de Propiedad Intelectual.

Las representaciones SVG utilizadas en esta aplicación provienen de dos fuentes:

(a) Wikimedia Commons (cuando está disponible).
    Archivos en dominio público o Creative Commons. Señales actualmente usadas:
    • R-2 STOP, R-1 Ceda el Paso, R-101 Entrada prohibida
    • R-301 Velocidad máxima (30, 50, 90, 120 km/h)
    • R-305 Prohibido adelantar
    • P-1a/b Curva peligrosa (derecha/izquierda)
    • P-5 Pavimento deslizante, P-7 Intersección
    • P-17 Paso de peatones, P-18 Niños (2023)
    • P-20 Obras (2023), P-22a Animales sueltos (2023)
    • S-1a Autopista, S-17a Estacionamiento
    Fuente: https://commons.wikimedia.org/wiki/Road_signs_of_Spain
    Atribución completa de cada archivo dentro de signSvgsWikimedia.ts

(b) Implementaciones ORIGINALES del autor (resto del catálogo).
    Dibujadas siguiendo las especificaciones técnicas oficiales del Anexo I
    del RGC. No reproducen artwork de terceros con copyright propio.

A medida que se vayan añadiendo más señales del catálogo Wikimedia, esta
lista se actualizará con la atribución correspondiente.

TECNOLOGÍAS

Esta aplicación utiliza software libre y de código abierto:
React Native (MIT), Expo (MIT), Zustand (MIT), react-native-svg (MIT),
AsyncStorage (MIT), Ionicons (MIT) y otros componentes con licencias
compatibles.

AGRADECIMIENTOS

A la Dirección General de Tráfico por publicar materiales educativos
accesibles que hacen posible que cualquier ciudadano pueda formarse.
Al BOE por mantener un acceso abierto y permanente a la normativa.
A la comunidad de Wikimedia Commons por preservar el conocimiento libre.
`.trim();
