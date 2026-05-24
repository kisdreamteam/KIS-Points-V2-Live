'use client';

import DashboardWorkspaceToolbar from '@/features/dashboard/stage/DashboardWorkspaceToolbar';
import { buildShellToolbarConfig } from '@/features/dashboard/stage/dashboardToolbarConfig';
import SeatingEditorWorkspaceToolbar from '@/features/seating/SeatingEditorWorkspaceToolbar';
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
      <SeatingEditorWorkspaceToolbar
        toolbarConfig={toolbarConfig}
        classId={classId}
        onEditClass={onEditClass}
      />
    );
  }

  return <DashboardWorkspaceToolbar toolbarConfig={toolbarConfig} />;
}
