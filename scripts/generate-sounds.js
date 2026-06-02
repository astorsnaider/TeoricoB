#!/usr/bin/env node
/**
 * Generador de efectos de sonido para TeoricoB.
 *
 * Genera 11 archivos WAV mono 44.1 kHz 16-bit con tonos musicales sintéticos.
 * Diseño: notas armónicas con envelope ADSR + chorus de armónicos suaves
 * para que no suenen como bips simples.
 *
 * Sustituibles después por archivos descargados de Mixkit/Pixabay si se
 * quiere mayor calidad real. Pero estos son suficientes y funcionales.
 *
 * Uso:  node scripts/generate-sounds.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const SR = 44100;
const OUT_DIR = path.resolve(__dirname, '..', 'TeoricoB-expo', 'assets', 'sounds');

// ── Generadores de waveform ──────────────────────────────────────────────

function note(freq, durSec, opts = {}) {
  const { attack = 0.005, decay = 0.08, sustainLevel = 0.6, release = 0.08, harmonics = [1, 0.4, 0.2], type = 'sine' } = opts;
  const n = Math.floor(durSec * SR);
  const buf = new Float32Array(n);
  const sustainEnd = Math.max(0, n - Math.floor(release * SR));
  const decayEnd = Math.min(sustainEnd, Math.floor((attack + decay) * SR));
  const attackEnd = Math.floor(attack * SR);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    // Envelope ADSR simplificado
    let env;
    if (i < attackEnd) env = i / Math.max(1, attackEnd);
    else if (i < decayEnd) env = 1 - (1 - sustainLevel) * ((i - attackEnd) / Math.max(1, decayEnd - attackEnd));
    else if (i < sustainEnd) env = sustainLevel;
    else env = sustainLevel * (1 - (i - sustainEnd) / Math.max(1, n - sustainEnd));
    // Suma de armónicos
    let v = 0;
    for (let h = 0; h < harmonics.length; h++) {
      const a = harmonics[h];
      const f = freq * (h + 1);
      if (type === 'sine') v += a * Math.sin(2 * Math.PI * f * t);
      else if (type === 'triangle') v += a * (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * f * t));
      else if (type === 'square') v += a * Math.sign(Math.sin(2 * Math.PI * f * t)) * 0.5;
    }
    buf[i] = env * v;
  }
  return buf;
}

function sequence(events) {
  // events: { atSec, freq, durSec, opts }
  const totalSec = events.reduce((m, e) => Math.max(m, e.atSec + e.durSec), 0);
  const total = Math.floor(totalSec * SR) + 200;
  const buf = new Float32Array(total);
  for (const e of events) {
    const part = note(e.freq, e.durSec, e.opts);
    const start = Math.floor(e.atSec * SR);
    for (let i = 0; i < part.length && start + i < total; i++) {
      buf[start + i] += part[i];
    }
  }
  return buf;
}

function noiseClick(durSec, decay = 200) {
  const n = Math.floor(durSec * SR);
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const env = Math.exp(-decay * (i / SR));
    buf[i] = env * (Math.random() * 2 - 1) * 0.6;
  }
  return buf;
}

function normalize(buf, peak = 0.9) {
  let max = 0;
  for (let i = 0; i < buf.length; i++) {
    const a = Math.abs(buf[i]);
    if (a > max) max = a;
  }
  if (max === 0) return buf;
  const gain = peak / max;
  for (let i = 0; i < buf.length; i++) buf[i] *= gain;
  return buf;
}

function writeWav(filename, samples) {
  const n = samples.length;
  const pcm = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    let v = Math.max(-1, Math.min(1, samples[i]));
    pcm.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);         // PCM subchunk size
  header.writeUInt16LE(1, 20);          // PCM format
  header.writeUInt16LE(1, 22);          // mono
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 2, 28);     // byte rate
  header.writeUInt16LE(2, 32);          // block align
  header.writeUInt16LE(16, 34);         // bits/sample
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(path.join(OUT_DIR, filename), Buffer.concat([header, pcm]));
  console.log(`✓ ${filename} (${(44 + pcm.length).toLocaleString()} B, ${(n / SR).toFixed(2)}s)`);
}

// Notas musicales (frecuencias en Hz)
const N = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, E6: 1318.51, G6: 1567.98,
};

// ── Definiciones de cada efecto ──────────────────────────────────────────

// CORRECT: arpegio ascendente C-E-G mayor (alegre y corto)
writeWav('correct.wav', normalize(sequence([
  { atSec: 0.00, freq: N.C5, durSec: 0.10, opts: { harmonics: [1, 0.3, 0.15], decay: 0.05 } },
  { atSec: 0.06, freq: N.E5, durSec: 0.10, opts: { harmonics: [1, 0.3, 0.15], decay: 0.05 } },
  { atSec: 0.12, freq: N.G5, durSec: 0.18, opts: { harmonics: [1, 0.35, 0.18], decay: 0.06, release: 0.1 } },
]), 0.85));

// WRONG: dos tonos descendentes (suaves, no estridentes)
writeWav('wrong.wav', normalize(sequence([
  { atSec: 0.00, freq: N.E4, durSec: 0.14, opts: { harmonics: [1, 0.5, 0.3], decay: 0.06, type: 'triangle' } },
  { atSec: 0.10, freq: N.C4, durSec: 0.22, opts: { harmonics: [1, 0.5, 0.3], decay: 0.08, release: 0.12, type: 'triangle' } },
]), 0.85));

// TICK: click corto (countdown del timer en examen)
writeWav('tick.wav', normalize(sequence([
  { atSec: 0.00, freq: N.A5, durSec: 0.06, opts: { attack: 0.001, decay: 0.02, sustainLevel: 0.3, release: 0.03, harmonics: [1] } },
]), 0.8));

// TAP: click corto + tono suave (UI feedback)
{
  const click = noiseClick(0.025, 280);
  const tone = note(N.A5, 0.06, { attack: 0.002, decay: 0.03, sustainLevel: 0.5, release: 0.03, harmonics: [1, 0.3] });
  const total = Math.max(click.length, tone.length);
  const buf = new Float32Array(total);
  for (let i = 0; i < total; i++) buf[i] = (i < click.length ? click[i] * 0.35 : 0) + (i < tone.length ? tone[i] * 0.7 : 0);
  writeWav('tap.wav', normalize(buf, 0.75));
}

// ACHIEVEMENT: arpegio mayor C-E-G-C (logro)
writeWav('achievement.wav', normalize(sequence([
  { atSec: 0.00, freq: N.C5, durSec: 0.12, opts: { harmonics: [1, 0.35, 0.18] } },
  { atSec: 0.09, freq: N.E5, durSec: 0.12, opts: { harmonics: [1, 0.35, 0.18] } },
  { atSec: 0.18, freq: N.G5, durSec: 0.12, opts: { harmonics: [1, 0.35, 0.18] } },
  { atSec: 0.27, freq: N.C6, durSec: 0.25, opts: { harmonics: [1, 0.4, 0.2], release: 0.18 } },
]), 0.9));

// LEVELUP: fanfare ascendente más amplio
writeWav('levelup.wav', normalize(sequence([
  { atSec: 0.00, freq: N.C5, durSec: 0.10, opts: { harmonics: [1, 0.4, 0.2] } },
  { atSec: 0.08, freq: N.E5, durSec: 0.10, opts: { harmonics: [1, 0.4, 0.2] } },
  { atSec: 0.16, freq: N.G5, durSec: 0.10, opts: { harmonics: [1, 0.4, 0.2] } },
  { atSec: 0.26, freq: N.C6, durSec: 0.15, opts: { harmonics: [1, 0.45, 0.25] } },
  { atSec: 0.40, freq: N.E6, durSec: 0.20, opts: { harmonics: [1, 0.5, 0.3] } },
  { atSec: 0.55, freq: N.G6, durSec: 0.30, opts: { harmonics: [1, 0.5, 0.3], release: 0.22 } },
]), 0.92));

// EXAM PASS: fanfare triunfal más larga
writeWav('exam-pass.wav', normalize(sequence([
  { atSec: 0.00, freq: N.C5, durSec: 0.14, opts: { harmonics: [1, 0.4, 0.2] } },
  { atSec: 0.10, freq: N.G5, durSec: 0.14, opts: { harmonics: [1, 0.4, 0.2] } },
  { atSec: 0.20, freq: N.C6, durSec: 0.14, opts: { harmonics: [1, 0.5, 0.25] } },
  { atSec: 0.32, freq: N.E6, durSec: 0.30, opts: { harmonics: [1, 0.5, 0.3] } },
  { atSec: 0.60, freq: N.G6, durSec: 0.45, opts: { harmonics: [1, 0.55, 0.3], release: 0.3 } },
]), 0.93));

// EXAM FAIL: tres notas descendentes (resignación)
writeWav('exam-fail.wav', normalize(sequence([
  { atSec: 0.00, freq: N.A4, durSec: 0.18, opts: { harmonics: [1, 0.4, 0.25], type: 'triangle' } },
  { atSec: 0.16, freq: N.F4, durSec: 0.20, opts: { harmonics: [1, 0.4, 0.25], type: 'triangle' } },
  { atSec: 0.34, freq: N.D4, durSec: 0.35, opts: { harmonics: [1, 0.45, 0.25], release: 0.25, type: 'triangle' } },
]), 0.85));

// HEART LOSE: tono grave + ligera disonancia (perder vida)
writeWav('heart-lose.wav', normalize(sequence([
  { atSec: 0.00, freq: 220, durSec: 0.18, opts: { harmonics: [1, 0.4, 0.2], decay: 0.1, type: 'triangle' } },
  { atSec: 0.10, freq: 165, durSec: 0.22, opts: { harmonics: [1, 0.35, 0.2], release: 0.15, type: 'triangle' } },
]), 0.85));

// HEART GAIN: dos notas ascendentes suaves (chime)
writeWav('heart-gain.wav', normalize(sequence([
  { atSec: 0.00, freq: N.E5, durSec: 0.12, opts: { harmonics: [1, 0.3, 0.15] } },
  { atSec: 0.08, freq: N.G5, durSec: 0.20, opts: { harmonics: [1, 0.35, 0.18], release: 0.15 } },
]), 0.85));

// STREAK: brrr ascendente rápido (racha)
writeWav('streak.wav', normalize(sequence([
  { atSec: 0.00, freq: N.G4, durSec: 0.08, opts: { harmonics: [1, 0.3] } },
  { atSec: 0.06, freq: N.B4, durSec: 0.08, opts: { harmonics: [1, 0.3] } },
  { atSec: 0.12, freq: N.D5, durSec: 0.08, opts: { harmonics: [1, 0.3] } },
  { atSec: 0.18, freq: N.G5, durSec: 0.18, opts: { harmonics: [1, 0.35, 0.18], release: 0.12 } },
]), 0.88));

console.log('Listo. 11 archivos WAV generados.');
