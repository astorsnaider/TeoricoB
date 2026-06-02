import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { playSoundEffect, type SoundEffect } from './soundEffects';

/**
 * Devuelve una función `play(sound)` que respeta el flag global
 * `soundsEnabled` del store. Evita que cada componente tenga que leer
 * el flag y pasarlo a `playSoundEffect`.
 */
export function useSoundEffect() {
  const enabled = useStore(s => s.soundsEnabled);
  return useCallback(
    (sound: SoundEffect) => {
      playSoundEffect(sound, enabled);
    },
    [enabled]
  );
}
