/**
 * Señales de tráfico españolas — SVGs originales de Wikimedia Commons.
 *
 * Las representaciones SVG están licenciadas como dominio público o
 * Creative Commons. Los diseños subyacentes son dominio público por
 * estar definidos en el Anexo I del Reglamento General de Circulación
 * (RD 1428/2003), conforme al Art. 13 de la Ley de Propiedad Intelectual.
 *
 * ───────────────────────────────────────────────────────────────────
 * CÓMO AÑADIR UNA NUEVA SEÑAL DE WIKIMEDIA
 * ───────────────────────────────────────────────────────────────────
 *
 * 1. Visita https://commons.wikimedia.org/wiki/Road_signs_of_Spain
 *    y localiza la señal que quieres añadir.
 *
 * 2. Descarga el archivo SVG manualmente (no automatizado:
 *    Wikimedia bloquea descargas masivas).
 *
 * 3. Guárdalo en `assets/signs-wikimedia/<nombre>.svg`.
 *
 * 4. Copia el contenido del archivo y añádelo como entrada en este
 *    archivo, usando el formato:
 *
 *      <signId>: { xml: `...`, attribution: '...' }
 *
 *    Donde <signId> es uno de los IDs definidos en TrafficSign.tsx
 *
 * 5. Listo: la app usará automáticamente la versión de Wikimedia.
 */

export interface WikimediaSvgEntry {
  xml: string;
  attribution: string;  // Nombre del archivo o autor original
  license: 'PD' | 'CC-BY-SA';
}

// ─── SEÑALES DISPONIBLES ────────────────────────────────────────

export const WIKIMEDIA_SIGNS: Partial<Record<string, WikimediaSvgEntry>> = {

  // ─── R-2 STOP ─────────────────────────────────────────────────
  stop: {
    license: 'PD',
    attribution: 'Spain_traffic_signal_r2.svg (Wikimedia Commons, dominio público)',
    xml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1010 1010">
<g transform="translate(1515.529,3241.075)">
<path d="m -801.1513,-2230.8749 295.8223,-295.8221 -10e-5,-418.3556 -295.822,-295.8224 -418.3557,3e-4 -295.8222,295.8221 2e-4,418.3558 295.822,295.822 z" fill="#000000"/>
<path d="m -803.2223,-2235.875 292.8933,-292.8932 -10e-5,-414.2135 -292.8931,-292.8935 -414.2135,3e-4 -292.8933,292.8932 2e-4,414.2136 292.8931,292.8932 z" fill="#ffffff"/>
<g transform="matrix(3.2596685,0,0,3.2596685,-1511.1445,-3236.6905)">
<polyline points="93.64 298.44 213.54 298.44 298.44 213.64 298.44 93.64 213.54 8.84 93.64 8.84 8.84 93.64 8.84 213.64 93.64 298.44" fill="#e41408" fill-rule="evenodd"/>
<path d="m 24.24,178.44 a 35,35 0 0 0 0.5,5.4 31.37,31.37 0 0 0 1.7,5.5 29.44,29.44 0 0 0 6.7,9.9 27.6,27.6 0 0 0 10.3,6.3 27.77,27.77 0 0 0 5.5,1.4 33.32,33.32 0 0 0 5.4,0.2 28,28 0 0 0 17.3,-6.7 29,29 0 0 0 9.7,-16 39.85,39.85 0 0 0 -0.5,-19.1 40.63,40.63 0 0 0 -9.3,-16.7 50.06,50.06 0 0 0 -17.9,-12.2 A 17.42,17.42 0 0 1 47,132 a 11.56,11.56 0 0 1 -2,-3.2 9.94,9.94 0 0 1 0.4,-7.8 8.46,8.46 0 0 1 2.3,-2.9 9.77,9.77 0 0 1 3.4,-2.1 11,11 0 0 1 4.4,-0.7 10.64,10.64 0 0 1 4.3,1.2 11.29,11.29 0 0 1 3.1,2.6 11.56,11.56 0 0 1 2,3.2 11.21,11.21 0 0 1 0.9,3.6 l 15.4,-0.3 a 28.9,28.9 0 0 0 -6.6,-16.5 26.7,26.7 0 0 0 -3.4,-3.3 30.67,30.67 0 0 0 -4.2,-2.8 25.09,25.09 0 0 0 -10.2,-2.9 26.43,26.43 0 0 0 -10.5,1.3 32.21,32.21 0 0 0 -4.6,2.1 38.86,38.86 0 0 0 -3.9,2.8 l -0.7,0.7 a 24.72,24.72 0 0 0 -8,17.4 25,25 0 0 0 6.6,18 33.49,33.49 0 0 0 12.3,8.3 33.35,33.35 0 0 1 12.3,8.4 23.8,23.8 0 0 1 5.7,10.3 23.18,23.18 0 0 1 0.3,11.7 13,13 0 0 1 -4.5,7.5 13.14,13.14 0 0 1 -8.2,3.2 12.25,12.25 0 0 1 -5.2,-0.8 12.9,12.9 0 0 1 -4.8,-3 14.23,14.23 0 0 1 -3.1,-4.7 12.17,12.17 0 0 1 -0.9,-5.2 l -15.4,0.3" fill="#fefefe" fill-rule="evenodd"/>
<polyline points="142.64 102.54 91.54 102.54 91.54 117.84 109.44 117.84 109.44 204.74 124.84 204.74 124.84 117.84 142.64 117.84 142.64 102.54" fill="#fefefe" fill-rule="evenodd"/>
<path d="m 172.44,185.54 a 83,83 0 0 1 0.6,-64.4 10.35,10.35 0 0 1 9.5,-6.2 10.56,10.56 0 0 1 5.7,1.7 11.08,11.08 0 0 1 3.8,4.5 84.75,84.75 0 0 1 6.7,32.2 82.77,82.77 0 0 1 -6.2,32.2 10.65,10.65 0 0 1 -4,4.9 10.58,10.58 0 0 1 -12.1,0 10.65,10.65 0 0 1 -4,-4.9 m -13.5,-70.4 a 97.33,97.33 0 0 0 -8,38 100.7,100.7 0 0 0 7.3,38.3 26.63,26.63 0 0 0 9.7,11.8 26.42,26.42 0 0 0 29.2,0 26.42,26.42 0 0 0 9.6,-11.8 98.35,98.35 0 0 0 -0.6,-76.3 25.66,25.66 0 0 0 -47.2,0" fill="#fefefe" fill-rule="evenodd"/>
<path d="m 256.74,117.84 a 9.22,9.22 0 0 1 5.1,1.5 13.22,13.22 0 0 1 2.6,2.2 13,13 0 0 1 2.2,2.9 15.58,15.58 0 0 1 2.1,7.7 15.88,15.88 0 0 1 -2,7.8 13,13 0 0 1 -2.2,2.9 13.22,13.22 0 0 1 -2.6,2.2 7.67,7.67 0 0 1 -4.4,1.4 h -14.4 v -28.6 h 13.6 m 0,43.9 a 25.21,25.21 0 0 0 16.8,-6.3 30.84,30.84 0 0 0 8,-10.9 39.9,39.9 0 0 0 -0.8,-26.2 29.88,29.88 0 0 0 -11.8,-12.6 23.5,23.5 0 0 0 -11.8,-3.2 h -29.3 v 102.2 h 15.3 v -43 h 13.6" fill="#fefefe" fill-rule="evenodd"/>
</g></g></svg>`,
  },

  // ─── S-1a Autopista ──────────────────────────────────────────
  autopista: {
    license: 'PD',
    attribution: 'Spain_traffic_signal_s1a.svg (Wikimedia Commons, dominio público)',
    xml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 336 504">
<path d="M0 484C0 487 1 491 3 494 5 497 7 499 10 501 13 503 16 503 19 503L317 503C320 503 323 503 326 501 328 499 331 497 333 494 335 491 336 487 336 484L336 19C336 16 335 13 333 11 331 8 328 5 326 3 323 2 320 0 317 0L19 0C16 0 13 2 10 3 7 5 5 8 3 11 1 13 0 16 0 19L0 484Z" fill="#fff"/>
<path d="M9 484C9 486 9 488 9 489 10 491 11 492 12 493 13 495 14 495 15 495 16 496 18 496 19 496L317 496C318 496 320 496 321 495 322 495 323 495 324 493 325 492 326 491 327 489 327 488 328 486 328 484L328 19C328 18 327 16 327 15 326 14 325 13 324 12 323 11 322 10 321 9 320 9 318 9 317 9L19 9C18 9 16 9 15 9 14 10 13 11 12 12 11 13 10 14 9 15 9 16 9 18 9 19L9 484Z" fill="#0055FF"/>
<path d="M27 466L45 466L133 133L129 133L27 466Z" fill="#FFF"/>
<path d="M84 466L94 466L110 365L103 365L84 466Z" fill="#FFF"/>
<path d="M115 298L121 298L127 257L123 257L115 298Z" fill="#FFF"/>
<path d="M130 220L133 220L137 196L134 196L130 220Z" fill="#FFF"/>
<path d="M138 174L141 174L144 155L142 155L138 174Z" fill="#FFF"/>
<path d="M144 140L146 140L148 133L146 133L144 140Z" fill="#FFF"/>
<path d="M133 466L151 466L164 133L161 133L133 466Z" fill="#FFF"/>
<path d="M310 466L291 466L203 133L207 133L310 466Z" fill="#FFF"/>
<path d="M252 466L243 466L226 365L233 365L252 466Z" fill="#FFF"/>
<path d="M221 298L215 298L209 257L213 257L221 298Z" fill="#FFF"/>
<path d="M207 220L203 220L199 196L202 196L207 220Z" fill="#FFF"/>
<path d="M198 174L195 174L192 155L195 155L198 174Z" fill="#FFF"/>
<path d="M192 140L190 140L189 133L190 133L192 140Z" fill="#FFF"/>
<path d="M203 466L185 466L172 133L176 133L203 466Z" fill="#FFF"/>
</svg>`,
  },

};
