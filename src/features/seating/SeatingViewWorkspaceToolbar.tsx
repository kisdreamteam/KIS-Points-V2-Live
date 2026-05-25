'use client';

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import DashboardWorkspaceToolbar from '@/features/dashboard/stage/DashboardWorkspaceToolbar';
import { buildShellToolbarConfig } from '@/features/dashboard/stage/dashboardToolbarConfig';
import { useSeatingStore } from '@/features/seating/stores/useSeatingStore';

export default function SeatingViewWorkspaceToolbar() {
  const seatingLayoutsCount = useSeatingStore(useShallow((s) => s.layouts.length));

  const toolbarConfig = useMemo(
    () =>
      buildShellToolbarConfig({
        activeView: 'seating_chart',
        isEditMode: false,
        seatingLayoutsCount,
      }),
    [seatingLayoutsCount]
  );

  return <DashboardWorkspaceToolbar toolbarConfig={toolbarConfig} />;
}
