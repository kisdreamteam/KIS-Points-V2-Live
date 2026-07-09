'use client';

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import DashboardWorkspaceToolbar from '@/features/dashboard/stage/DashboardWorkspaceToolbar';
import { buildShellToolbarConfig } from '@/features/dashboard/stage/dashboardToolbarConfig';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { useSeatingStore } from '@/features/seating/stores/useSeatingStore';

type StudentsGridWorkspaceToolbarProps = {
  isPointsReportOpen?: boolean;
};

export default function StudentsGridWorkspaceToolbar({
  isPointsReportOpen = false,
}: StudentsGridWorkspaceToolbarProps) {
  const activeView = useLayoutStore((s) => s.activeView);
  const seatingLayoutsCount = useSeatingStore(useShallow((s) => s.layouts.length));

  const toolbarConfig = useMemo(
    () =>
      buildShellToolbarConfig({
        activeView,
        isEditMode: false,
        seatingLayoutsCount,
        activeBottomActionIds: isPointsReportOpen ? ['points-report'] : [],
      }),
    [activeView, seatingLayoutsCount, isPointsReportOpen]
  );

  return <DashboardWorkspaceToolbar toolbarConfig={toolbarConfig} />;
}
