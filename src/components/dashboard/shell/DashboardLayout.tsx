'use client';

import type { FC, ReactNode } from 'react';
import { useDashboardRouteStateSync } from '@/hooks/sync/useDashboardRouteStateSync';
import { refreshDashboardClassesForUserAction } from '@/hooks/sync/useDashboardClassesSync';
import LeftNav from '@/components/dashboard/navbars/LeftNav';
import SeatingEditorLeftNav from '@/components/dashboard/navbars/SeatingEditorLeftNav';
import DashboardWorkspace from '@/components/dashboard/stage/DashboardWorkspace';
import EditClassModal from '@/components/dashboard/modals/EditClassModal';
import DashboardClassModalsHost from '@/components/dashboard/DashboardClassModalsHost';
import { useLayoutStore, type ViewState } from '@/stores/useLayoutStore';

type DashboardZoneInputs = {
  isSidebarOpen: boolean;
  activeView: ViewState;
  isEditMode: boolean;
};

type DashboardLayoutProps = {
  children: ReactNode;
};

function getDashboardZoneConfig({
  isSidebarOpen,
  activeView,
  isEditMode,
}: DashboardZoneInputs) {
  const isSeatingChartView = activeView === 'seating_chart';
  return {
    dashboardGridColsClass: isSidebarOpen
      ? 'grid-cols-[0px_1fr] md:grid-cols-[19rem_1fr]'
      : 'grid-cols-[0px_1fr]',
    useSeatingEditorLeftNav: isSeatingChartView && isEditMode,
  };
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  const { currentClassId } = useDashboardRouteStateSync();
  const isSidebarOpen = useLayoutStore((s) => s.isSidebarOpen);
  const activeView = useLayoutStore((s) => s.activeView);
  const isEditMode = useLayoutStore((s) => s.isEditMode);
  const isEditClassModalOpen = useLayoutStore((s) => s.isEditClassModalOpen);
  const setEditClassModalOpen = useLayoutStore((s) => s.setEditClassModalOpen);

  const isClassesRootView = !currentClassId;
  const dashboardZones = getDashboardZoneConfig({ isSidebarOpen, activeView, isEditMode });

  return (
    <>
      <div
        className={[
          'h-screen w-screen overflow-hidden bg-brand-purple grid transition-all duration-300 ease-in-out',
          dashboardZones.dashboardGridColsClass,
        ].join(' ')}
      >
        <aside className="h-full overflow-hidden pl-1">
          <div className="h-full overflow-hidden bg-white max-w-[19rem] ml-1">
            {dashboardZones.useSeatingEditorLeftNav ? (
              <SeatingEditorLeftNav />
            ) : (
              <LeftNav />
            )}
          </div>
        </aside>
        <main className="h-full overflow-hidden pl-1 pr-1 pt-1">
          <DashboardWorkspace showCanvasToolbar={!isClassesRootView}>
            {children}
          </DashboardWorkspace>
        </main>
      </div>
      {currentClassId && (
        <EditClassModal
          isOpen={isEditClassModalOpen}
          onClose={() => setEditClassModalOpen(false)}
          classId={currentClassId}
          onRefresh={refreshDashboardClassesForUserAction}
        />
      )}
      <DashboardClassModalsHost />
    </>
  );
};

export default DashboardLayout;
