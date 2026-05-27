import confetti from 'canvas-confetti';

const DUST_COLORS = ['#475569', '#64748b', '#94a3b8'];

/** Above LargeToolModal (200), Modal (9999), and EditSkillsModal (10000). */
const CONFETTI_Z_INDEX = 10050;

const POINTS_GAIN_AUDIO =
  typeof window !== 'undefined' ? new Audio('/sounds/points-gain.mp3') : null;
const POINTS_LOSS_AUDIO =
  typeof window !== 'undefined' ? new Audio('/sounds/points-loss.mp3') : null;

if (POINTS_GAIN_AUDIO) {
  POINTS_GAIN_AUDIO.volume = 0.55;
}
if (POINTS_LOSS_AUDIO) {
  POINTS_LOSS_AUDIO.volume = 0.5;
}

function playPointsAudio(pointsDelta: number): void {
  const audio = pointsDelta > 0 ? POINTS_GAIN_AUDIO : POINTS_LOSS_AUDIO;
  if (!audio) return;
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

function runClassicBurst(): void {
  void confetti({
    zIndex: CONFETTI_Z_INDEX,
    particleCount: 120,
    spread: 80,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.55 },
  });
}

function runSideCannons(): void {
  const durationMs = 1200;
  const end = Date.now() + durationMs;

  const frame = () => {
    void confetti({
      zIndex: CONFETTI_Z_INDEX,
      particleCount: 3,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
    });
    void confetti({
      zIndex: CONFETTI_Z_INDEX,
      particleCount: 3,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: 0.5 },
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

function runRisingStars(): void {
  void confetti({
    zIndex: CONFETTI_Z_INDEX,
    particleCount: 60,
    spread: 100,
    startVelocity: 35,
    gravity: 0.35,
    drift: 0,
    origin: { x: 0.5, y: 0.75 },
    shapes: ['star'],
    scalar: 1.1,
  });
}

type ScatteredDustRainOptions = {
  scalar: number;
  durationMs: number;
  burstsPerFrame: number;
  particlesPerBurst: number;
  spread: number;
  /** Random spawn band from y=0 through this fraction of viewport height. */
  ySpawnMax: number;
};

/** Fine slate dust: random spawn points across the upper viewport, falling straight down over time. */
function fireScatteredDustRain({
  scalar,
  durationMs,
  burstsPerFrame,
  particlesPerBurst,
  spread,
  ySpawnMax,
}: ScatteredDustRainOptions): void {
  const end = Date.now() + durationMs;

  const frame = () => {
    for (let i = 0; i < burstsPerFrame; i++) {
      void confetti({
        zIndex: CONFETTI_Z_INDEX,
        angle: 268 + Math.random() * 4,
        spread,
        scalar,
        colors: DUST_COLORS,
        startVelocity: 4 + Math.random() * 4,
        gravity: 1.5,
        drift: (Math.random() - 0.5) * 0.25,
        ticks: 180,
        particleCount: particlesPerBurst,
        origin: {
          x: 0.04 + Math.random() * 0.92,
          y: Math.random() * ySpawnMax,
        },
      });
    }

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

function runDustBurst(): void {
  fireScatteredDustRain({
    scalar: 0.14,
    durationMs: 1400,
    burstsPerFrame: 5,
    particlesPerBurst: 20,
    spread: 18,
    ySpawnMax: 0.4,
  });
}

function runDustBurstWide(): void {
  fireScatteredDustRain({
    scalar: 0.11,
    durationMs: 1800,
    burstsPerFrame: 7,
    particlesPerBurst: 24,
    spread: 24,
    ySpawnMax: 0.55,
  });
}

const POSITIVE_EFFECTS = [runClassicBurst, runSideCannons, runRisingStars] as const;
const NEGATIVE_EFFECTS = [runDustBurst, runDustBurstWide] as const;

/** Randomized full-viewport confetti + audio for point awards (presentation only; no store/API). */
export const triggerPointsAnimation = (pointsDelta: number): void => {
  if (typeof window === 'undefined' || pointsDelta === 0) return;

  playPointsAudio(pointsDelta);

  if (pointsDelta > 0) {
    const index = Math.floor(Math.random() * POSITIVE_EFFECTS.length);
    POSITIVE_EFFECTS[index]();
    return;
  }

  const index = Math.floor(Math.random() * NEGATIVE_EFFECTS.length);
  NEGATIVE_EFFECTS[index]();
};
