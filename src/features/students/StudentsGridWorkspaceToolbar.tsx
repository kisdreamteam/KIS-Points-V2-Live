'use client';

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import DashboardWorkspaceToolbar from '@/features/dashboard/stage/DashboardWorkspaceToolbar';
import { buildShellToolbarConfig } from '@/features/dashboard/stage/dashboardToolbarConfig';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { useSeatingStore } from '@/stores/useSeatingStore';

export default function StudentsGridWorkspaceToolbar() {
  const activeView = useLayoutStore((s) => s.activeView);
  const seatingLayoutsCount = useSeatingStore(useShallow((s) => s.layouts.length));

  const toolbarConfig = useMemo(
    () =>
      buildShellToolbarConfig({
        activeView,
        isEditMode: false,
        seatingLayoutsCount,
      }),
    [activeView, seatingLayoutsCount]
  );

  return <DashboardWorkspaceToolbar toolbarConfig={toolbarConfig} />;
}
