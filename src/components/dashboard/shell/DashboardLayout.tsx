'use client';

import { Suspense } from 'react';
import { DashboardStudentSync } from '@/hooks/sync/useDashboardStudentSync';
import { SeatingChartDataSync } from '@/hooks/sync/useSeatingChartDataSync';
import { DashboardProfileSync } from '@/hooks/sync/useDashboardProfileSync';
import { DashboardClassesFilterSync } from '@/hooks/sync/useDashboardClassesFilterSync';
import { useDashboardRouteStateSync } from '@/hooks/sync/useDashboardRouteStateSync';
import { refreshDashboardClassesForUserAction } from '@/hooks/sync/useDashboardClassesSync';
import LeftNav from '@/components/navbars/LeftNav';
import SeatingEditorLeftNav from '@/components/navbars/SeatingEditorLeftNav';
import DashboardWorkspace from '@/components/dashboard/stage/DashboardWorkspace';
import EditClassModal from '@/components/dashboard/modals/EditClassModal';
import DashboardClassModalsHost from '@/components/dashboard/DashboardClassModalsHost';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { getShellZoneConfig } from '@/components/dashboard/shell/dashboardZoneConfig';

function DashboardLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentClassId } = useDashboardRouteStateSync();
  const isSidebarOpen = useLayoutStore((s) => s.isSidebarOpen);
  const activeView = useLayoutStore((s) => s.activeView);
  const isEditMode = useLayoutStore((s) => s.isEditMode);
  const isEditClassModalOpen = useLayoutStore((s) => s.isEditClassModalOpen);
  const setEditClassModalOpen = useLayoutStore((s) => s.setEditClassModalOpen);

  const isClassesRootView = !currentClassId;
  const shellZones = getShellZoneConfig({ isSidebarOpen, activeView, isEditMode });

  return (
    <>
      <div
        className={[
          'h-screen w-screen overflow-hidden bg-brand-purple grid transition-all duration-300 ease-in-out',
          shellZones.shellGridColsClass,
        ].join(' ')}
      >
        <aside className="h-full overflow-hidden">
          <div className="h-full overflow-hidden bg-white max-w-[19rem] ml-1">
            {shellZones.useSeatingEditorLeftNav ? (
              <SeatingEditorLeftNav />
            ) : (
              <LeftNav />
            )}
          </div>
        </aside>
        <main className="h-full overflow-hidden pl-1 pr-1">
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
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLayoutFallback />}>
      <DashboardStudentSync />
      <SeatingChartDataSync />
      <DashboardProfileSync />
      <DashboardClassesFilterSync />
      <DashboardLayoutShell>{children}</DashboardLayoutShell>
    </Suspense>
  );
}

function DashboardLayoutFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-brand-purple">
      <div className="text-white">Loading...</div>
    </div>
  );
}
