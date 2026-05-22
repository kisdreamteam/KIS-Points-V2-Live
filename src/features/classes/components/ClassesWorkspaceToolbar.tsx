'use client';

import CanvasToolbar from '@/components/ui/CanvasToolbar';
import { buildShellToolbarConfig } from '@/features/dashboard/stage/dashboardToolbarConfig';
import { useCanvasToolbarActions } from '@/hooks/dashboard/useCanvasToolbarActions';

const classesToolbarConfig = buildShellToolbarConfig({
  activeView: 'classes',
  isEditMode: false,
  seatingLayoutsCount: 0,
});

export default function ClassesWorkspaceToolbar() {
  const { topActions, bottomActions } = useCanvasToolbarActions(classesToolbarConfig);

  return (
    <div data-stage-toolbar-slot className="h-full min-h-0 overflow-hidden">
      <CanvasToolbar
        className={`h-full ${classesToolbarConfig.className}`}
        topActions={topActions}
        bottomActions={bottomActions}
      />
    </div>
  );
}
