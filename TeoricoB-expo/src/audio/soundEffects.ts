import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

declare const require: (path: string) => number;

export type SoundEffect =
  | 'correct' | 'wrong' | 'tick'
  | 'tap'
  | 'achievement' | 'levelup'
  | 'examPass' | 'examFail'
  | 'heartLose' | 'heartGain'
  | 'streak';

const SOURCES: Record<SoundEffect, number> = {
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
};

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

let configured = false;
let players: Partial<Record<SoundEffect, AudioPlayer>> = {};

async function ensureAudioReady() {
  if (configured) return;
  configured = true;
  await setAudioModeAsync({
    playsInSilentMode: false,
    interruptionMode: 'mixWithOthers',
    allowsRecording: false,
    shouldPlayInBackground: false,
    shouldRouteThroughEarpiece: false,
  });
}

function getPlayer(sound: SoundEffect) {
  if (!players[sound]) {
    const player = createAudioPlayer(SOURCES[sound], {
      keepAudioSessionActive: true,
      updateInterval: 1000,
    });
    player.volume = VOLUMES[sound];
    players[sound] = player;
  }
  return players[sound];
}

export async function playSoundEffect(sound: SoundEffect, enabled: boolean) {
  if (!enabled) return;
  try {
    await ensureAudioReady();
    const player = getPlayer(sound);
    if (!player) return;
    await player.seekTo(0);
    player.play();
  } catch {
    // Sound feedback is optional; never block UX if playback fails.
  }
}
