'use client';

import { useCallback, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import MovableToolPanel from '@/components/ui/MovableToolPanel';
import LargeToolModal from '@/components/ui/LargeToolModal';
import Timer, {
  getTimerPanelDimensions,
  TIMER_SIZE_STORAGE_KEY,
  type TimerPanelSize,
} from '@/features/dashboard/components/tools/Timer';
import Bells, {
  BELLS_PANEL_HEIGHT,
  BELLS_PANEL_WIDTH,
} from '@/features/dashboard/components/tools/Bells';
import Random from '@/features/dashboard/tools/Random';
import { useLayoutStore } from '@/stores/useLayoutStore';

function readStoredTimerSize(): TimerPanelSize {
  if (typeof window === 'undefined') return 'small';
  try {
    const raw = localStorage.getItem(TIMER_SIZE_STORAGE_KEY);
    if (raw === 'small' || raw === 'large') return raw;
  } catch {
    // ignore
  }
  return 'small';
}

export default function DashboardToolsHost() {
  const pathname = usePathname();
  const classId = pathname?.match(/\/dashboard\/classes\/([^/]+)/)?.[1] ?? '';

  const isTimerOpen = useLayoutStore((s) => s.isTimerOpen);
  const setTimerOpen = useLayoutStore((s) => s.setTimerOpen);
  const isRandomOpen = useLayoutStore((s) => s.isRandomOpen);
  const setRandomOpen = useLayoutStore((s) => s.setRandomOpen);
  const isBellsOpen = useLayoutStore((s) => s.isBellsOpen);
  const setBellsOpen = useLayoutStore((s) => s.setBellsOpen);

  const randomCloseHandlerRef = useRef<(() => void) | null>(null);
  const [timerSize, setTimerSize] = useState<TimerPanelSize>(readStoredTimerSize);

  const timerPanelDimensions = getTimerPanelDimensions(timerSize);

  const handleCloseTimer = () => setTimerOpen(false);
  const handleCloseBells = () => setBellsOpen(false);

  const handleToggleTimerSize = useCallback(() => {
    setTimerSize((prev) => {
      const next: TimerPanelSize = prev === 'large' ? 'small' : 'large';
      try {
        localStorage.setItem(TIMER_SIZE_STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const handleCloseRandom = useCallback(() => {
    if (randomCloseHandlerRef.current) {
      randomCloseHandlerRef.current();
    } else {
      setRandomOpen(false);
    }
  }, [setRandomOpen]);

  const registerRandomCloseHandler = useCallback((handler: (() => void) | null) => {
    randomCloseHandlerRef.current = handler;
  }, []);

  return (
    <>
      <MovableToolPanel
        isOpen={isTimerOpen}
        onClose={handleCloseTimer}
        title="Timer"
        resizable={false}
        fixedWidth={timerPanelDimensions.width}
        fixedHeight={timerPanelDimensions.height}
        storageKey="dashboard.timerPanel.v8"
        defaultPlacement="bottom-right-left-of"
        placementNeighborWidth={BELLS_PANEL_WIDTH}
        placementNeighborHeight={BELLS_PANEL_HEIGHT}
        headerActions={
          <button
            type="button"
            onClick={handleToggleTimerSize}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white text-xs font-bold"
            aria-label={timerSize === 'large' ? 'Switch to small timer' : 'Switch to large timer'}
            title={timerSize === 'large' ? 'Small' : 'Large'}
          >
            {timerSize === 'large' ? 'S' : 'L'}
          </button>
        }
      >
        <Timer size={timerSize} />
      </MovableToolPanel>

      <MovableToolPanel
        isOpen={isBellsOpen}
        onClose={handleCloseBells}
        title="Bells"
        resizable={false}
        fixedWidth={BELLS_PANEL_WIDTH}
        fixedHeight={BELLS_PANEL_HEIGHT}
        storageKey="dashboard.bellsPanel.v3"
        defaultPlacement="bottom-right"
      >
        <Bells />
      </MovableToolPanel>

      <LargeToolModal
        isOpen={isRandomOpen}
        onClose={handleCloseRandom}
        title="Random Student"
      >
        {isRandomOpen && classId ? (
          <Random
            classId={classId}
            onClose={() => setRandomOpen(false)}
            registerCloseHandler={registerRandomCloseHandler}
          />
        ) : null}
      </LargeToolModal>
    </>
  );
}
