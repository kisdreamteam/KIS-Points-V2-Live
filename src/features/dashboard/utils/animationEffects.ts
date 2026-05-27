import confetti from 'canvas-confetti';

const NEGATIVE_COLORS = ['#64748b', '#475569', '#334155', '#94a3b8', '#1e293b'];

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
      particleCount: 3,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
    });
    void confetti({
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

function runMutedRain(): void {
  void confetti({
    particleCount: 80,
    angle: 270,
    spread: 45,
    startVelocity: 25,
    gravity: 1.4,
    origin: { x: 0.5, y: 0 },
    colors: NEGATIVE_COLORS,
  });
}

function runSinkingBricks(): void {
  void confetti({
    particleCount: 50,
    angle: 250,
    spread: 25,
    startVelocity: 40,
    gravity: 1.6,
    origin: { x: 0.5, y: 0.2 },
    shapes: ['square'],
    scalar: 1.3,
    colors: NEGATIVE_COLORS,
  });
}

const POSITIVE_EFFECTS = [runClassicBurst, runSideCannons, runRisingStars] as const;
const NEGATIVE_EFFECTS = [runMutedRain, runSinkingBricks] as const;

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
