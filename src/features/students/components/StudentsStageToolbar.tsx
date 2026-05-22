'use client';

import DashboardCanvasToolbar from '@/features/dashboard/stage/DashboardCanvasToolbar';
import { buildShellToolbarConfig } from '@/features/dashboard/stage/dashboardToolbarConfig';
import SeatingEditorCanvasToolbar from '@/features/seating/SeatingEditorCanvasToolbar';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { useSeatingStore } from '@/stores/useSeatingStore';

type StudentsStageToolbarProps = {
  classId: string;
  onEditClass?: () => void;
};

export default function StudentsStageToolbar({
  classId,
  onEditClass,
}: StudentsStageToolbarProps) {
  const activeView = useLayoutStore((s) => s.activeView);
  const isEditMode = useLayoutStore((s) => s.isEditMode);
  const seatingLayoutsCount = useSeatingStore((s) => s.layouts.length);

  const toolbarConfig = buildShellToolbarConfig({
    activeView,
    isEditMode,
    seatingLayoutsCount,
  });

  if (activeView === 'seating_chart' && isEditMode) {
    return (
      <SeatingEditorCanvasToolbar
        toolbarConfig={toolbarConfig}
        classId={classId}
        onEditClass={onEditClass}
      />
    );
  }

  return <DashboardCanvasToolbar toolbarConfig={toolbarConfig} />;
}
