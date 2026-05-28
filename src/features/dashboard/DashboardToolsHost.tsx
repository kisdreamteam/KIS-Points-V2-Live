'use client';

import { useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import MovableToolPanel from '@/components/ui/MovableToolPanel';
import LargeToolModal from '@/components/ui/LargeToolModal';
import Timer from '@/features/dashboard/components/tools/Timer';
import Bells from '@/features/dashboard/components/tools/Bells';
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
      >
        <Timer />
      </MovableToolPanel>

      <MovableToolPanel
        isOpen={isBellsOpen}
        onClose={handleCloseBells}
        title="Bells"
        resizable
        minScale={0.6}
        initialScale={0.6}
        storageKey="dashboard.bellsPanel"
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
