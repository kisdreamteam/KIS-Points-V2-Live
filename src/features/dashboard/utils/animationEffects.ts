import confetti from 'canvas-confetti';

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
  POINTS_LOSS_AUDIO.volume = 0.2;
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

const POSITIVE_EFFECTS = [runClassicBurst, runSideCannons, runRisingStars] as const;

/** Randomized full-viewport confetti + audio for point awards (presentation only; no store/API). */
export const triggerPointsAnimation = (pointsDelta: number): void => {
  if (typeof window === 'undefined' || pointsDelta === 0) return;

  playPointsAudio(pointsDelta);

  if (pointsDelta <= 0) return;

  const index = Math.floor(Math.random() * POSITIVE_EFFECTS.length);
  POSITIVE_EFFECTS[index]();
};
