'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Student } from '@/lib/types';

const TOTAL_DURATION_MS = 875;
const BASE_FLIPS = 12;
const MAX_EXTRA_FLIPS = 6;
const FLIP_DURATION_MS = 30;
const FLIP_MIDPOINT_MS = 15;
const BOUNCE_DURATION_MS = 113;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function buildFlipPath(pool: Student[], winner: Student): Student[] {
  if (pool.length === 0) return [winner];
  if (pool.length === 1) return [winner];

  const extraFlips = Math.floor(Math.random() * (MAX_EXTRA_FLIPS + 1));
  const totalFlips = BASE_FLIPS + extraFlips;
  const path: Student[] = [];

  let currentIndex = Math.floor(Math.random() * pool.length);

  for (let i = 0; i < totalFlips; i += 1) {
    if (i === totalFlips - 1) {
      path.push(winner);
      continue;
    }

    let nextIndex = Math.floor(Math.random() * pool.length);
    if (pool.length > 1) {
      while (nextIndex === currentIndex) {
        nextIndex = Math.floor(Math.random() * pool.length);
      }
    }
    currentIndex = nextIndex;
    path.push(pool[currentIndex]!);
  }

  path[path.length - 1] = winner;
  return path;
}

function buildFlipDelays(stepCount: number): number[] {
  if (stepCount <= 1) return [TOTAL_DURATION_MS];

  const rawDelays: number[] = [];
  for (let i = 0; i < stepCount; i += 1) {
    const t = i / (stepCount - 1);
    const eased = easeOutCubic(t);
    const minDelay = 25;
    const maxDelay = 200;
    rawDelays.push(minDelay + eased * (maxDelay - minDelay));
  }

  const sum = rawDelays.reduce((acc, delay) => acc + delay, 0);
  const scale = TOTAL_DURATION_MS / sum;
  return rawDelays.map((delay) => delay * scale);
}

function delay(ms: number, signal: { cancelled: boolean; timers: ReturnType<typeof setTimeout>[] }): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (!signal.cancelled) resolve();
    }, ms);
    signal.timers.push(timer);
  });
}

export function useRandomFlipCardAnimation() {
  const [displayedStudents, setDisplayedStudents] = useState<(Student | null)[]>([null]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [flipStepKey, setFlipStepKey] = useState(0);
  const displayedStudentsRef = useRef<(Student | null)[]>([null]);
  const runSignalRef = useRef<{ cancelled: boolean; timers: ReturnType<typeof setTimeout>[] } | null>(
    null
  );

  displayedStudentsRef.current = displayedStudents;

  const clearRun = useCallback(() => {
    if (runSignalRef.current) {
      runSignalRef.current.cancelled = true;
      runSignalRef.current.timers.forEach(clearTimeout);
      runSignalRef.current = null;
    }
    setIsFlipping(false);
    setIsBouncing(false);
  }, []);

  useEffect(() => clearRun, [clearRun]);

  const syncSlots = useCallback((slotCount: number, winners?: Student[]) => {
    setDisplayedStudents((prev) => {
      const next = Array.from({ length: slotCount }, (_, i) => {
        if (winners?.[i]) return winners[i]!;
        return prev[i] ?? null;
      });
      displayedStudentsRef.current = next;
      return next;
    });
  }, []);

  const animateToWinners = useCallback(
    (winners: Student[], poolStudents: Student[]): Promise<void> => {
      clearRun();

      const signal = { cancelled: false, timers: [] as ReturnType<typeof setTimeout>[] };
      runSignalRef.current = signal;

      const paths = winners.map((winner) => buildFlipPath(poolStudents, winner));
      const maxSteps = paths.reduce((max, path) => Math.max(max, path.length), 0);
      const delays = buildFlipDelays(maxSteps);

      const run = async () => {
        if (maxSteps === 0 || winners.length === 0) return;

        const slotCount = winners.length;
        const current = displayedStudentsRef.current;
        const needsInitial = current.every((s) => s === null);

        if (needsInitial && poolStudents.length > 0) {
          const initial = Array.from({ length: slotCount }, () => {
            return poolStudents[Math.floor(Math.random() * poolStudents.length)] ?? winners[0]!;
          });
          setDisplayedStudents(initial);
          displayedStudentsRef.current = initial;
        } else if (current.length !== slotCount) {
          const resized = Array.from({ length: slotCount }, (_, i) => current[i] ?? null);
          setDisplayedStudents(resized);
          displayedStudentsRef.current = resized;
        }

        for (let step = 0; step < maxSteps; step += 1) {
          if (signal.cancelled) return;

          const isLast = step === maxSteps - 1;

          if (step > 0) {
            await delay(delays[step] ?? 100, signal);
            if (signal.cancelled) return;
          }

          setIsFlipping(true);
          setFlipStepKey((key) => key + 1);

          await delay(FLIP_MIDPOINT_MS, signal);
          if (signal.cancelled) return;

          const prev = displayedStudentsRef.current;
          const next = Array.from({ length: slotCount }, (_, slotIndex) => {
            const path = paths[slotIndex];
            if (!path || path.length === 0) return winners[slotIndex] ?? null;
            const student = path[Math.min(step, path.length - 1)];
            return student ?? prev[slotIndex] ?? null;
          });
          setDisplayedStudents(next);
          displayedStudentsRef.current = next;

          await delay(FLIP_DURATION_MS - FLIP_MIDPOINT_MS, signal);
          if (signal.cancelled) return;
          setIsFlipping(false);

          if (isLast) {
            setIsBouncing(true);
            await delay(BOUNCE_DURATION_MS, signal);
            if (signal.cancelled) return;
            setIsBouncing(false);
          }
        }
      };

      return run().finally(() => {
        if (runSignalRef.current === signal) {
          runSignalRef.current = null;
        }
      });
    },
    [clearRun]
  );

  return {
    displayedStudents,
    isFlipping,
    isBouncing,
    flipStepKey,
    syncSlots,
    animateToWinners,
  };
}
