'use client';

import CanvasToolbar from '@/components/ui/CanvasToolbar';
import type { DashboardToolbarDef } from '@/components/dashboard/frame/dashboardZoneConfig';
import { useCanvasToolbarActions } from '@/hooks/dashboard/useCanvasToolbarActions';

export default function DashboardCanvasToolbar({
  toolbarConfig,
}: {
  toolbarConfig: DashboardToolbarDef;
}) {
  const { topActions, bottomActions } = useCanvasToolbarActions(toolbarConfig);
  return (
    <div data-stage-toolbar-slot className="h-full min-h-0 overflow-hidden">
      <CanvasToolbar
        className={`h-full ${toolbarConfig.className ?? ''}`}
        topActions={topActions}
        bottomActions={bottomActions}
      />
    </div>
  );
}
