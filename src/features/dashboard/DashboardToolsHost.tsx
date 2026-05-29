'use client';

import { useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import MovableToolPanel from '@/components/ui/MovableToolPanel';
import LargeToolModal from '@/components/ui/LargeToolModal';
import Timer from '@/features/dashboard/components/tools/Timer';
import Bells, {
  BELLS_PANEL_HEIGHT,
  BELLS_PANEL_WIDTH,
} from '@/features/dashboard/components/tools/Bells';
import Random from '@/features/dashboard/tools/Random';
import { useLayoutStore } from '@/stores/useLayoutStore';

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
  const timerBaseWidth =
    typeof window !== 'undefined'
      ? Math.max(672, Math.floor(window.innerWidth * 0.9))
      : 672;
  const timerBaseHeight =
    typeof window !== 'undefined'
      ? Math.max(400, Math.floor(window.innerHeight * 0.9))
      : 400;

  const handleCloseTimer = () => setTimerOpen(false);
  const handleCloseBells = () => setBellsOpen(false);

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
        resizable
        minScale={1}
        initialScale={1}
        maxScale={1}
        baseWidth={timerBaseWidth}
        baseHeight={timerBaseHeight}
        maxWidthPx={timerBaseWidth}
        maxHeightPx={timerBaseHeight}
        storageKey="dashboard.timerPanel.v5"
      >
        <Timer />
      </MovableToolPanel>

      <MovableToolPanel
        isOpen={isBellsOpen}
        onClose={handleCloseBells}
        title="Bells"
        resizable={false}
        fixedWidth={BELLS_PANEL_WIDTH}
        fixedHeight={BELLS_PANEL_HEIGHT}
        storageKey="dashboard.bellsPanel.v2"
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
