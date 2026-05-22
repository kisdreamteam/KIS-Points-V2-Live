'use client';

import MovableToolPanel from '@/components/ui/MovableToolPanel';
import Timer from '@/features/dashboard/components/tools/Timer';
import { useLayoutStore } from '@/stores/useLayoutStore';

export default function DashboardToolsHost() {
  const isTimerOpen = useLayoutStore((s) => s.isTimerOpen);
  const setTimerOpen = useLayoutStore((s) => s.setTimerOpen);

  const handleCloseTimer = () => setTimerOpen(false);

  return (
    <MovableToolPanel
      isOpen={isTimerOpen}
      onClose={handleCloseTimer}
      title="Timer"
    >
      <Timer />
    </MovableToolPanel>
  );
}
