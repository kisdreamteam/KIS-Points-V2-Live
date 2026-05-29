'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BELLS_PANEL_HEIGHT,
  BELLS_PANEL_WIDTH,
} from '@/features/dashboard/components/tools/Bells';

const COUNTDOWN_END_SOUND = '/sounds/timer-end-1.mp3';

export type TimerPanelSize = 'large' | 'small';

export const TIMER_SIZE_STORAGE_KEY = 'dashboard.timerPanel.size';

export function getTimerPanelDimensions(size: TimerPanelSize): {
  width: number;
  height: number;
} {
  if (size === 'small') {
    return { width: BELLS_PANEL_WIDTH, height: BELLS_PANEL_HEIGHT };
  }
  if (typeof window === 'undefined') {
    return { width: 672, height: 400 };
  }
  return {
    width: Math.max(672, Math.floor(window.innerWidth * 0.9)),
    height: Math.max(400, Math.floor(window.innerHeight * 0.9)),
  };
}

type TimerProps = {
  size?: TimerPanelSize;
};

export default function Timer({ size = 'small' }: TimerProps) {
  const isSmall = size === 'small';
  const [activeTab, setActiveTab] = useState<'stopwatch' | 'countdown'>('countdown');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(600);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownEndAudioRef = useRef<HTMLAudioElement | null>(null);

  const [stopwatchTime, setStopwatchTime] = useState(0);

  const [countdownMinutes, setCountdownMinutes] = useState(10);
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  useEffect(() => {
    const audio = new Audio(COUNTDOWN_END_SOUND);
    audio.volume = 0.75;
    countdownEndAudioRef.current = audio;

    return () => {
      audio.pause();
      countdownEndAudioRef.current = null;
    };
  }, []);

  const playCountdownEndSound = useCallback(() => {
    const audio = countdownEndAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch(() => { });
  }, []);

  useEffect(() => {
    if (isRunning) {
      if (activeTab === 'stopwatch') {
        intervalRef.current = setInterval(() => {
          setStopwatchTime((prev) => prev + 1);
        }, 1000);
      } else {
        intervalRef.current = setInterval(() => {
          setTime((prev) => {
            if (prev <= 0) {
              setIsRunning(false);
              return 0;
            }
            const next = prev - 1;
            if (next === 0) {
              setIsRunning(false);
              playCountdownEndSound();
              return 0;
            }
            return next;
          });
        }, 1000);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, activeTab, playCountdownEndSound]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (activeTab === 'stopwatch') {
      setStopwatchTime(0);
    } else {
      setTime(countdownMinutes * 60 + countdownSeconds);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  };

  const handleTabChange = (tab: 'countdown' | 'stopwatch') => {
    if (isRunning) {
      setIsRunning(false);
    }
    setActiveTab(tab);
    if (tab === 'countdown') {
      setTime(countdownMinutes * 60 + countdownSeconds);
    }
  };

  const handleMinutesChange = (value: number) => {
    const newMinutes = Math.max(0, Math.min(99, value));
    setCountdownMinutes(newMinutes);
    if (!isRunning) {
      setTime(newMinutes * 60 + countdownSeconds);
    }
  };

  const handleSecondsChange = (value: number) => {
    const newSeconds = Math.max(0, Math.min(59, value));
    setCountdownSeconds(newSeconds);
    if (!isRunning) {
      setTime(countdownMinutes * 60 + newSeconds);
    }
  };

  const displayTime = activeTab === 'stopwatch'
    ? formatTime(stopwatchTime)
    : formatTime(time);

  if (isSmall) {
    return (
      <div className="w-full overflow-hidden">
        <div className="mb-2 flex gap-3">
          <button
            type="button"
            onClick={() => handleTabChange('countdown')}
            className="text-xs font-semibold pb-1 transition-colors text-brand-purple"
            style={{
              borderBottom: `2px solid ${activeTab === 'countdown' ? 'var(--color-brand-purple)' : 'transparent'}`,
            }}
          >
            Countdown
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('stopwatch')}
            className="text-xs font-semibold pb-1 transition-colors text-brand-purple"
            style={{
              borderBottom: `2px solid ${activeTab === 'stopwatch' ? 'var(--color-brand-purple)' : 'transparent'}`,
            }}
          >
            Stopwatch
          </button>
        </div>

        <div className="mb-2 rounded-xl border-2 border-white bg-brand-pink p-2">
          <div className="flex items-center justify-center font-bold leading-none text-white text-3xl tabular-nums">
            <span>{displayTime.minutes}</span>
            <span className="mx-1">:</span>
            <span>{displayTime.seconds}</span>
          </div>
        </div>

        {activeTab === 'countdown' && !isRunning && (
          <div className="mb-2 flex items-center justify-center gap-2">
            <input
              type="number"
              min="0"
              max="99"
              value={countdownMinutes}
              onChange={(e) => handleMinutesChange(parseInt(e.target.value, 10) || 0)}
              aria-label="Minutes"
              className="w-12 rounded-md border border-brand-purple/30 bg-brand-purple/10 px-1 py-0.5 text-center text-sm font-bold text-brand-purple focus:border-brand-purple focus:outline-none"
            />
            <span className="text-sm text-brand-purple">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={countdownSeconds}
              onChange={(e) => handleSecondsChange(parseInt(e.target.value, 10) || 0)}
              aria-label="Seconds"
              className="w-12 rounded-md border border-brand-purple/30 bg-brand-purple/10 px-1 py-0.5 text-center text-sm font-bold text-brand-purple focus:border-brand-purple focus:outline-none"
            />
          </div>
        )}

        <div className="flex items-center justify-center gap-2">
          {!isRunning ? (
            <button
              type="button"
              onClick={handleStart}
              className="rounded-lg border-2 border-white bg-brand-pink px-3 py-1.5 text-xs font-semibold text-white shadow transition-opacity hover:opacity-90"
            >
              Start
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handlePause}
                className="rounded-lg bg-brand-purple px-3 py-1.5 text-xs font-semibold text-white shadow transition-opacity hover:opacity-90"
              >
                Pause
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-semibold text-brand-purple shadow transition-colors hover:bg-gray-300"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex gap-8 mb-6">
        <button
          type="button"
          onClick={() => handleTabChange('countdown')}
          className="text-lg md:text-2xl font-semibold pb-2 transition-colors text-brand-purple"
          style={{
            borderBottom: `3px solid ${activeTab === 'countdown' ? 'var(--color-brand-purple)' : 'transparent'}`,
          }}
        >
          Countdown
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('stopwatch')}
          className="text-lg md:text-2xl font-semibold pb-2 transition-colors text-brand-purple"
          style={{
            borderBottom: `3px solid ${activeTab === 'stopwatch' ? 'var(--color-brand-purple)' : 'transparent'}`,
          }}
        >
          Stopwatch
        </button>
      </div>

      <div className="bg-brand-pink rounded-2xl p-6 md:p-8 mb-6 border-4 border-white">
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-4xl md:text-9xl font-bold text-white mb-2 leading-none">
              {displayTime.minutes}
            </div>
            <div className="text-lg md:text-2xl text-white/80">Minutes</div>
          </div>

          <div className="text-4xl md:text-9xl -translate-y-4 font-bold text-white leading-none">:</div>

          <div className="text-center">
            <div className="text-4xl md:text-9xl font-bold text-white mb-2 leading-none">
              {displayTime.seconds}
            </div>
            <div className="text-lg md:text-2xl text-white/80">Seconds</div>
          </div>
        </div>
      </div>

      {activeTab === 'countdown' && !isRunning && (
        <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-brand-purple text-lg font-medium">Minutes:</label>
            <input
              type="number"
              min="0"
              max="99"
              value={countdownMinutes}
              onChange={(e) => handleMinutesChange(parseInt(e.target.value, 10) || 0)}
              className="w-20 px-3 py-2 rounded-lg bg-brand-purple/10 text-brand-purple text-center text-xl font-bold border-2 border-brand-purple/30 focus:border-brand-purple focus:outline-none"
            />
          </div>
          <div className="text-brand-purple text-xl">:</div>
          <div className="flex items-center gap-2">
            <label className="text-brand-purple text-lg font-medium">Seconds:</label>
            <input
              type="number"
              min="0"
              max="59"
              value={countdownSeconds}
              onChange={(e) => handleSecondsChange(parseInt(e.target.value, 10) || 0)}
              className="w-20 px-3 py-2 rounded-lg bg-brand-purple/10 text-brand-purple text-center text-xl font-bold border-2 border-brand-purple/30 focus:border-brand-purple focus:outline-none"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 flex-wrap">
        {!isRunning ? (
          <button
            type="button"
            onClick={handleStart}
            className="bg-brand-pink border-white border-4 hover:opacity-90 text-white px-8 py-3 rounded-xl font-semibold text-lg flex items-center gap-3 transition-colors shadow-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Start
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handlePause}
              className="bg-brand-purple hover:opacity-90 text-white px-8 py-3 rounded-xl font-semibold text-lg flex items-center gap-3 transition-colors shadow-lg"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              Pause
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-200 hover:bg-gray-300 text-brand-purple px-8 py-3 rounded-xl font-semibold text-lg transition-colors shadow-lg"
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}
