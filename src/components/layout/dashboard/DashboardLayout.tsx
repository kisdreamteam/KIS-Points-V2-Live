'use client';

import { Suspense } from 'react';
import { DashboardStudentSync } from '@/hooks/useDashboardStudentSync';
import { SeatingChartDataSync } from '@/hooks/useSeatingChartDataSync';
import { DashboardProfileSync } from '@/hooks/useDashboardProfileSync';
import { DashboardClassesFilterSync } from '@/hooks/useDashboardClassesFilterSync';
import { useDashboardRouteStateSync } from '@/hooks/useDashboardRouteStateSync';
import { refreshDashboardClassesForUserAction } from '@/hooks/useDashboardClassesSync';
import LeftNav from '@/components/layout/LeftNav';
import SeatingEditorLeftNav from '@/components/layout/SeatingEditorLeftNav';
import DashboardWorkspace from '@/components/dashboard/DashboardWorkspace';
import EditClassModal from '@/components/dashboard/modals/EditClassModal';
import DashboardClassModalsHost from '@/components/dashboard/DashboardClassModalsHost';
import { useLayoutStore } from '@/stores/useLayoutStore';

function DashboardLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentClassId } = useDashboardRouteStateSync();
  const isSidebarOpen = useLayoutStore((s) => s.isSidebarOpen);
  const isSeatingChartView = useLayoutStore((s) => s.activeView === 'seating_chart');
  const isEditMode = useLayoutStore((s) => s.isEditMode);
  const isEditClassModalOpen = useLayoutStore((s) => s.isEditClassModalOpen);
  const setEditClassModalOpen = useLayoutStore((s) => s.setEditClassModalOpen);

  const isClassesRootView = !currentClassId;

  return (
    <>
      <div className="h-screen w-screen overflow-hidden flex flex-row bg-brand-purple">
        <div
          className={[
            'h-full flex-shrink-0 overflow-hidden transition-[width,padding] duration-200 ease-out',
            isSidebarOpen ? 'w-76 pl-2' : 'w-0 pl-0',
          ].join(' ')}
        >
          <div className="h-full overflow-hidden bg-white w-76 max-w-[19rem]">
            {isSeatingChartView && isEditMode ? (
              <SeatingEditorLeftNav />
            ) : (
              <LeftNav />
            )}
          </div>
        </div>
        <div className="flex-1 h-full overflow-hidden pl-2 pr-2 pt-2">
          <DashboardWorkspace showCanvasToolbar={!isClassesRootView}>
            {children}
          </DashboardWorkspace>
        </div>
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
