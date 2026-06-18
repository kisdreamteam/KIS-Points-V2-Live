'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const COUNTDOWN_END_SOUND = '/sounds/timer-end-1.mp3';

const DEFAULT_COUNTDOWN_SECONDS = 0;
const MAX_COUNTDOWN_SECONDS = 99 * 60 + 59;

const COUNTDOWN_PRESETS = [
  { label: '+15 sec', seconds: 15 },
  { label: '+1 min', seconds: 60 },
  { label: '+2 min', seconds: 120 },
  { label: '+5 min', seconds: 300 },
] as const;

const PRESET_BUTTON_CLASSES = [
  'bg-sky-300',
  'bg-blue-400',
  'bg-blue-600',
  'bg-indigo-600',
] as const;

function clampCountdownSeconds(total: number): number {
  return Math.max(0, Math.min(MAX_COUNTDOWN_SECONDS, total));
}

function splitCountdown(total: number) {
  const clamped = clampCountdownSeconds(total);
  return {
    total: clamped,
    minutes: Math.floor(clamped / 60),
    seconds: clamped % 60,
  };
}

export type TimerPanelSize = 'large' | 'small';

export const TIMER_SIZE_STORAGE_KEY = 'dashboard.timerPanel.size';
export const TIMER_PANEL_SMALL_WIDTH = 403;
export const TIMER_PANEL_SMALL_HEIGHT = 340;
export const TIMER_PANEL_LARGE_WIDTH = 540;
export const TIMER_PANEL_LARGE_HEIGHT = 700;

export function getTimerPanelDimensions(size: TimerPanelSize): {
  width: number;
  height: number;
} {
  if (size === 'small') {
    return { width: TIMER_PANEL_SMALL_WIDTH, height: TIMER_PANEL_SMALL_HEIGHT };
  }
  return {
    width: TIMER_PANEL_LARGE_WIDTH,
    height: TIMER_PANEL_LARGE_HEIGHT,
  };
}

type TimerPresetRowProps = {
  size: TimerPanelSize;
  onAddTime: (seconds: number) => void;
};

function TimerPresetRow({ size, onAddTime }: TimerPresetRowProps) {
  const isSmall = size === 'small';

  return (
    <div className={`flex w-full gap-2 ${isSmall ? 'mb-2' : 'mb-6'}`}>
      {COUNTDOWN_PRESETS.map((preset, index) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => onAddTime(preset.seconds)}
          className={[
            'flex-1 rounded-xl font-semibold text-white shadow transition-opacity hover:opacity-90',
            PRESET_BUTTON_CLASSES[index],
            isSmall ? 'px-1 py-1.5 text-[10px] leading-tight' : 'px-2 py-2.5 text-sm',
          ].join(' ')}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

type TimerControlRowProps = {
  size: TimerPanelSize;
  isRunning: boolean;
  isStartDisabled: boolean;
  onReset: () => void;
  onStart: () => void;
  onPause: () => void;
};

function TimerControlRow({
  size,
  isRunning,
  isStartDisabled,
  onReset,
  onStart,
  onPause,
}: TimerControlRowProps) {
  const isSmall = size === 'small';
  const buttonClass = isSmall
    ? 'flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
    : 'flex-1 rounded-xl px-8 py-3 text-lg font-semibold text-white shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className={`flex w-full ${isSmall ? 'gap-2' : 'gap-4'}`}>
      <button type="button" onClick={onReset} className={`${buttonClass} bg-red-500 hover:bg-red-600`}>
        Reset
      </button>
      {isRunning ? (
        <button type="button" onClick={onPause} className={`${buttonClass} bg-brand-purple`}>
          Pause
        </button>
      ) : (
        <button
          type="button"
          onClick={onStart}
          disabled={isStartDisabled}
          className={`${buttonClass} bg-lime-500 hover:bg-lime-600`}
        >
          Start
        </button>
      )}
    </div>
  );
}

type TimerProps = {
  size?: TimerPanelSize;
};

export default function Timer({ size = 'small' }: TimerProps) {
  const isSmall = size === 'small';
  const [activeTab, setActiveTab] = useState<'stopwatch' | 'countdown'>('countdown');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(DEFAULT_COUNTDOWN_SECONDS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownEndAudioRef = useRef<HTMLAudioElement | null>(null);

  const [stopwatchTime, setStopwatchTime] = useState(0);

  const [countdownMinutes, setCountdownMinutes] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  const applyCountdownTotal = useCallback((total: number) => {
    const { total: clamped, minutes, seconds } = splitCountdown(total);
    setTime(clamped);
    setCountdownMinutes(minutes);
    setCountdownSeconds(seconds);
  }, []);

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

  const handleAddTime = useCallback(
    (deltaSeconds: number) => {
      if (activeTab !== 'countdown' || isRunning) return;
      applyCountdownTotal(time + deltaSeconds);
    },
    [activeTab, isRunning, time, applyCountdownTotal]
  );

  const handleStart = () => {
    if (activeTab === 'countdown' && time <= 0) return;
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    if (activeTab === 'countdown') {
      applyCountdownTotal(time);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (activeTab === 'stopwatch') {
      setStopwatchTime(0);
    } else {
      applyCountdownTotal(DEFAULT_COUNTDOWN_SECONDS);
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
      applyCountdownTotal(countdownMinutes * 60 + countdownSeconds);
    }
  };

  const displayTime = activeTab === 'stopwatch'
    ? formatTime(stopwatchTime)
    : formatTime(time);

  const isStartDisabled = activeTab === 'countdown' && time <= 0;
  const showPresets = activeTab === 'countdown' && !isRunning;

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

        {showPresets ? <TimerPresetRow size="small" onAddTime={handleAddTime} /> : null}

        <TimerControlRow
          size="small"
          isRunning={isRunning}
          isStartDisabled={isStartDisabled}
          onReset={handleReset}
          onStart={handleStart}
          onPause={handlePause}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-fit">
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

      {showPresets ? <TimerPresetRow size="large" onAddTime={handleAddTime} /> : null}

      <TimerControlRow
        size="large"
        isRunning={isRunning}
        isStartDisabled={isStartDisabled}
        onReset={handleReset}
        onStart={handleStart}
        onPause={handlePause}
      />
    </div>
  );
}
