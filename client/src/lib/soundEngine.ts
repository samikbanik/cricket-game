/**
 * Cricket Game Sound Engine
 * All sounds are synthesized using the Web Audio API — no external files needed.
 */

let audioCtx: AudioContext | null = null;
let _muted = false;
let _volume = 0.6;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setMuted(muted: boolean) {
  _muted = muted;
}

export function isMuted(): boolean {
  return _muted;
}

export function setVolume(vol: number) {
  _volume = Math.max(0, Math.min(1, vol));
}

export function getVolume(): number {
  return _volume;
}

// ─── Utility: create a gain node with current volume ────────────────
function masterGain(ctx: AudioContext): GainNode {
  const gain = ctx.createGain();
  gain.gain.value = _volume;
  gain.connect(ctx.destination);
  return gain;
}

// ─── Utility: white noise buffer ────────────────────────────────────
function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// ═══════════════════════════════════════════════════════════════════
// SOUND EFFECTS
// ═══════════════════════════════════════════════════════════════════

/**
 * Bat hitting ball — sharp crack sound
 * Short attack, quick decay, mid-high frequency
 */
export function playBatCrack() {
  if (_muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  const master = masterGain(ctx);

  // Impact noise burst
  const noiseBuffer = createNoiseBuffer(ctx, 0.15);
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 2200;
  bandpass.Q.value = 1.5;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.9, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  noise.connect(bandpass);
  bandpass.connect(noiseGain);
  noiseGain.connect(master);
  noise.start(now);
  noise.stop(now + 0.15);

  // Tonal crack
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.5, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(oscGain);
  oscGain.connect(master);
  osc.start(now);
  osc.stop(now + 0.12);
}

/**
 * Bowling delivery — whoosh sound
 * Filtered noise sweep
 */
export function playBowlWhoosh() {
  if (_muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  const master = masterGain(ctx);

  const noiseBuffer = createNoiseBuffer(ctx, 0.6);
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(300, now);
  filter.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
  filter.frequency.exponentialRampToValueAtTime(500, now + 0.6);
  filter.Q.value = 2;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.15);
  gain.gain.linearRampToValueAtTime(0.5, now + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  noise.start(now);
  noise.stop(now + 0.65);
}

/**
 * Crowd cheer — for boundaries (4s)
 * Medium intensity noise with shaped envelope
 */
export function playCrowdCheer() {
  if (_muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  const master = masterGain(ctx);

  const duration = 1.8;
  const noiseBuffer = createNoiseBuffer(ctx, duration);
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  // Bandpass to make it sound like voices
  const bp1 = ctx.createBiquadFilter();
  bp1.type = "bandpass";
  bp1.frequency.value = 1200;
  bp1.Q.value = 0.8;

  const bp2 = ctx.createBiquadFilter();
  bp2.type = "bandpass";
  bp2.frequency.value = 2500;
  bp2.Q.value = 1.2;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.45, now + 0.15);
  gain.gain.setValueAtTime(0.45, now + 0.6);
  gain.gain.linearRampToValueAtTime(0.3, now + 1.0);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  // Modulate for crowd-like wavering
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 6;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.08;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  lfo.start(now);
  lfo.stop(now + duration);

  noise.connect(bp1);
  bp1.connect(bp2);
  bp2.connect(gain);
  gain.connect(master);
  noise.start(now);
  noise.stop(now + duration + 0.1);
}

/**
 * Big crowd roar — for sixes
 * Louder, longer, with additional low-end rumble
 */
export function playCrowdRoar() {
  if (_muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  const master = masterGain(ctx);

  const duration = 2.5;

  // Main crowd noise
  const noiseBuffer = createNoiseBuffer(ctx, duration);
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1400;
  bp.Q.value = 0.6;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.6, now + 0.1);
  gain.gain.setValueAtTime(0.6, now + 0.8);
  gain.gain.linearRampToValueAtTime(0.5, now + 1.5);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 4;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.1;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  lfo.start(now);
  lfo.stop(now + duration);

  noise.connect(bp);
  bp.connect(gain);
  gain.connect(master);
  noise.start(now);
  noise.stop(now + duration + 0.1);

  // Low rumble for extra impact
  const rumbleNoise = ctx.createBufferSource();
  rumbleNoise.buffer = createNoiseBuffer(ctx, duration);
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 300;
  const rumbleGain = ctx.createGain();
  rumbleGain.gain.setValueAtTime(0.001, now);
  rumbleGain.gain.linearRampToValueAtTime(0.25, now + 0.1);
  rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  rumbleNoise.connect(lowpass);
  lowpass.connect(rumbleGain);
  rumbleGain.connect(master);
  rumbleNoise.start(now);
  rumbleNoise.stop(now + duration + 0.1);

  // Pop/firework accent
  setTimeout(() => playFireworkPop(), 200);
}

/**
 * Firework pop — accent for sixes
 */
function playFireworkPop() {
  if (_muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  const master = masterGain(ctx);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1500, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + 0.35);

  // Sparkle noise
  const sparkle = ctx.createBufferSource();
  sparkle.buffer = createNoiseBuffer(ctx, 0.2);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 4000;
  const sGain = ctx.createGain();
  sGain.gain.setValueAtTime(0.2, now);
  sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  sparkle.connect(hp);
  hp.connect(sGain);
  sGain.connect(master);
  sparkle.start(now);
  sparkle.stop(now + 0.25);
}

/**
 * Wicket fall — stumps rattle + low thud
 */
export function playWicketFall() {
  if (_muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  const master = masterGain(ctx);

  // Low thud
  const thud = ctx.createOscillator();
  thud.type = "sine";
  thud.frequency.setValueAtTime(120, now);
  thud.frequency.exponentialRampToValueAtTime(40, now + 0.3);

  const thudGain = ctx.createGain();
  thudGain.gain.setValueAtTime(0.6, now);
  thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  thud.connect(thudGain);
  thudGain.connect(master);
  thud.start(now);
  thud.stop(now + 0.4);

  // Stumps rattle — series of short clicks
  for (let i = 0; i < 5; i++) {
    const t = now + 0.05 + i * 0.04;
    const click = ctx.createOscillator();
    click.type = "square";
    click.frequency.setValueAtTime(3000 + Math.random() * 2000, t);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.25, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    click.connect(clickGain);
    clickGain.connect(master);
    click.start(t);
    click.stop(t + 0.04);
  }

  // Bail falling — descending tone
  const bail = ctx.createOscillator();
  bail.type = "triangle";
  bail.frequency.setValueAtTime(2000, now + 0.1);
  bail.frequency.exponentialRampToValueAtTime(300, now + 0.5);

  const bailGain = ctx.createGain();
  bailGain.gain.setValueAtTime(0.15, now + 0.1);
  bailGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  bail.connect(bailGain);
  bailGain.connect(master);
  bail.start(now + 0.1);
  bail.stop(now + 0.55);
}

/**
 * Dot ball — soft thud/pad sound
 */
export function playDotBall() {
  if (_muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  const master = masterGain(ctx);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(250, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + 0.25);
}

/**
 * Run scored — quick tap/click
 */
export function playRunScored() {
  if (_muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  const master = masterGain(ctx);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.setValueAtTime(800, now + 0.05);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + 0.15);
}

/**
 * UI click — subtle button press feedback
 */
export function playUIClick() {
  if (_muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  const master = masterGain(ctx);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 1000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + 0.06);
}

/**
 * Game over fanfare — ascending chord
 */
export function playGameOverFanfare() {
  if (_muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  const master = masterGain(ctx);

  const notes = [262, 330, 392, 523]; // C4, E4, G4, C5
  notes.forEach((freq, i) => {
    const t = now + i * 0.15;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.05);
    gain.gain.setValueAtTime(0.25, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + 0.85);
  });

  // Final sustain chord
  const chordTime = now + 0.6;
  [262, 330, 392, 523].forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, chordTime);
    gain.gain.linearRampToValueAtTime(0.15, chordTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, chordTime + 1.5);

    osc.connect(gain);
    gain.connect(master);
    osc.start(chordTime);
    osc.stop(chordTime + 1.6);
  });
}

/**
 * Timing lock — quick ascending blip
 */
export function playTimingLock() {
  if (_muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  const master = masterGain(ctx);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(500, now);
  osc.frequency.linearRampToValueAtTime(1200, now + 0.06);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + 0.12);
}

/**
 * Power lock — descending blip
 */
export function playPowerLock() {
  if (_muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  const master = masterGain(ctx);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.linearRampToValueAtTime(600, now + 0.08);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + 0.15);
}

/**
 * Play the appropriate sound for a ball outcome
 */
export function playOutcomeSound(result: string) {
  if (_muted) return;

  switch (result) {
    case "wicket":
      playWicketFall();
      break;
    case "6":
      playBatCrack();
      setTimeout(() => playCrowdRoar(), 150);
      break;
    case "4":
      playBatCrack();
      setTimeout(() => playCrowdCheer(), 100);
      break;
    case "dot":
      playDotBall();
      break;
    default:
      // 1, 2, 3 runs
      playBatCrack();
      setTimeout(() => playRunScored(), 80);
      break;
  }
}

/**
 * Bowler footsteps — rhythmic thumps that accelerate
 * Simulates the bowler's run-up approaching the crease
 */
export function playBowlerFootsteps() {
  if (_muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  const master = masterGain(ctx);
  master.gain.value = _volume * 0.35; // subtle

  // Generate 5 footstep thumps with decreasing interval (accelerating)
  const intervals = [0, 0.22, 0.40, 0.55, 0.67, 0.76, 0.84, 0.90];

  intervals.forEach((offset, i) => {
    const t = now + offset;

    // Low thump oscillator
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(60 + i * 5, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3 + i * 0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + 0.12);

    // Add a noise burst for the "scuff" sound
    const noiseBuffer = createNoiseBuffer(ctx, 0.06);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(t);
    noise.stop(t + 0.08);
  });
}
