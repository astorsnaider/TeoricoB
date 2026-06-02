/**
 * Fallback web para sonidos.
 *
 * `expo-audio` no soporta web. Metro resuelve esta extensión `.web.ts`
 * automáticamente cuando el platform es web, así que el resto del código
 * importa `./soundEffects` y obtiene la implementación correcta sin saberlo.
 *
 * Estrategia:
 * - Usa HTMLAudioElement con cache por nombre.
 * - Los `require(...)` de Metro web se transforman en URLs servibles.
 * - La primera interacción del usuario (botón "Entrar a la app" del tutorial
 *   o cualquier tap) desbloquea el contexto de audio del navegador (autoplay
 *   policy). Antes de eso, los play() fallan silenciosamente vía try/catch.
 */

export type SoundEffect =
  | 'correct' | 'wrong' | 'tick'
  | 'tap'
  | 'achievement' | 'levelup'
  | 'examPass' | 'examFail'
  | 'heartLose' | 'heartGain'
  | 'streak';

// Metro web transforma `require('../../assets/foo.wav')` en una URL string.
const SOURCES: Record<SoundEffect, string> = {
  correct:     require('../../assets/sounds/correct.wav'),
  wrong:       require('../../assets/sounds/wrong.wav'),
  tick:        require('../../assets/sounds/tick.wav'),
  tap:         require('../../assets/sounds/tap.wav'),
  achievement: require('../../assets/sounds/achievement.wav'),
  levelup:     require('../../assets/sounds/levelup.wav'),
  examPass:    require('../../assets/sounds/exam-pass.wav'),
  examFail:    require('../../assets/sounds/exam-fail.wav'),
  heartLose:   require('../../assets/sounds/heart-lose.wav'),
  heartGain:   require('../../assets/sounds/heart-gain.wav'),
  streak:      require('../../assets/sounds/streak.wav'),
} as unknown as Record<SoundEffect, string>;

const VOLUMES: Record<SoundEffect, number> = {
  tap:         0.25,
  correct:     0.6,
  wrong:       0.55,
  tick:        0.35,
  achievement: 0.7,
  levelup:     0.7,
  examPass:    0.75,
  examFail:    0.5,
  heartLose:   0.55,
  heartGain:   0.4,
  streak:      0.5,
};

const cache: Partial<Record<SoundEffect, HTMLAudioElement>> = {};

function getElement(sound: SoundEffect): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null;
  if (!cache[sound]) {
    const src = SOURCES[sound];
    // Algunas configs de Metro devuelven objeto `{ uri }`; manejar ambos casos.
    const url = typeof src === 'string' ? src : (src as { uri?: string }).uri ?? '';
    if (!url) return null;
    const el = new Audio(url);
    el.preload = 'auto';
    el.volume = VOLUMES[sound];
    cache[sound] = el;
  }
  return cache[sound]!;
}

export async function playSoundEffect(sound: SoundEffect, enabled: boolean) {
  if (!enabled) return;
  try {
    const el = getElement(sound);
    if (!el) return;
    el.currentTime = 0;
    await el.play();
  } catch {
    // Autoplay bloqueado u otro error — feedback opcional.
  }
}
