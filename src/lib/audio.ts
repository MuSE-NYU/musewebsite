/**
 * Drives the visualiser.
 *
 * By default it synthesises a permission-free signal: a ~118bpm envelope with
 * some drift, so the geometry breathes without prompting anyone for a mic.
 * Hitting SOUND → ON swaps in a real mic analyser, which is the version worth
 * demoing at a sound-engineering club.
 */

import { clamp, lerp } from "./view";

export type AudioSource = "synthetic" | "mic";

const BANDS = 12;

const state = {
  source: "synthetic" as AudioSource,
  /** Overall 0..1 loudness. */
  level: 0,
  /** Sharp 0..1 transient, decays fast. */
  beat: 0,
  /** Coarse 0..1 spectrum, low → high. */
  spectrum: new Float32Array(BANDS),
  context: null as AudioContext | null,
  analyser: null as AnalyserNode | null,
  stream: null as MediaStream | null,
  // Sized properly once an analyser exists. Declared by inference so the
  // typed-array's buffer generic stays exact for getByteFrequencyData.
  fft: new Uint8Array(0),
};

const listeners = new Set<(source: AudioSource) => void>();

export function onSourceChange(fn: (source: AudioSource) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function announce() {
  listeners.forEach((fn) => fn(state.source));
}

/** Called once per frame from the render loop. */
export function updateAudio(time: number, delta: number) {
  const smoothing = clamp(delta * 12, 0, 1);

  if (state.source === "mic" && state.analyser && state.fft.length) {
    state.analyser.getByteFrequencyData(state.fft);

    const bins = state.fft.length;
    let sum = 0;

    for (let b = 0; b < BANDS; b++) {
      // Logarithmic band edges — linear FFT bins put almost everything in the
      // bottom eighth of the array, which looks dead.
      const lo = Math.floor(bins * Math.pow(b / BANDS, 2));
      const hi = Math.max(lo + 1, Math.floor(bins * Math.pow((b + 1) / BANDS, 2)));

      let acc = 0;
      for (let i = lo; i < hi; i++) acc += state.fft[i];
      const value = acc / (hi - lo) / 255;

      state.spectrum[b] = lerp(state.spectrum[b], value, smoothing);
      sum += value;
    }

    const level = clamp((sum / BANDS) * 1.8, 0, 1);
    state.beat = Math.max(state.beat * (1 - smoothing * 0.9), level - state.level);
    state.level = lerp(state.level, level, smoothing);
    return;
  }

  // ---- Synthetic fallback -------------------------------------------------
  const bps = 118 / 60;
  const phase = (time * bps) % 1;
  // Sharp attack, exponential tail.
  const beat = Math.pow(1 - phase, 5);
  // A slower 4-bar swell so it doesn't feel like a metronome.
  const swell = 0.5 + 0.5 * Math.sin(time * 0.21);
  const drift = 0.5 + 0.5 * Math.sin(time * 0.77 + 1.3);

  const level = clamp(0.18 + beat * 0.45 + swell * 0.22 + drift * 0.1, 0, 1);

  state.level = lerp(state.level, level, smoothing);
  state.beat = lerp(state.beat, beat, smoothing);

  for (let b = 0; b < BANDS; b++) {
    const t = b / (BANDS - 1);
    // Low end tracks the beat, highs shimmer independently.
    const target =
      (1 - t) * (0.35 + beat * 0.65) +
      t * (0.15 + 0.85 * Math.abs(Math.sin(time * (1.1 + b * 0.37) + b)));
    state.spectrum[b] = lerp(state.spectrum[b], clamp(target, 0, 1), smoothing);
  }
}

export const getLevel = () => state.level;
export const getBeat = () => state.beat;
export const getSpectrum = () => state.spectrum;
export const getSource = () => state.source;

export async function enableMic() {
  if (state.source === "mic") return true;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    const context = new AudioContext();
    await context.resume();

    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.72;

    context.createMediaStreamSource(stream).connect(analyser);

    state.stream = stream;
    state.context = context;
    state.analyser = analyser;
    state.fft = new Uint8Array(analyser.frequencyBinCount);
    state.source = "mic";
    announce();
    return true;
  } catch {
    // Denied, unavailable, or insecure context — stay synthetic.
    return false;
  }
}

export function disableMic() {
  state.stream?.getTracks().forEach((track) => track.stop());
  state.context?.close().catch(() => {});
  state.stream = null;
  state.context = null;
  state.analyser = null;
  state.fft = new Uint8Array(0);
  state.source = "synthetic";
  announce();
}
