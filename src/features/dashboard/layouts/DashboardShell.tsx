'use client';

import { useCallback, useMemo, type ReactNode } from 'react';
import { useDashboardRouteStateSync } from '@/hooks/sync/useDashboardRouteStateSync';
import {
  DashboardClassesSync,
  refreshDashboardClassesForUserAction,
} from '@/hooks/sync/useDashboardClassesSync';
import { useViewPreferenceSync } from '@/hooks/sync/useViewPreferenceSync';
import { useDashboardSessionActions } from '@/hooks/useDashboardSessionActions';
import LeftNav from '@/features/dashboard/components/frame/navbars/LeftNav';
import SeatingEditorLeftNav from '@/features/dashboard/components/frame/navbars/SeatingEditorLeftNav';
import TopNav from '@/features/dashboard/components/frame/navbars/TopNav';
import StudentsBottomNav from '@/features/dashboard/components/frame/navbars/StudentsBottomNav';
import MultiSelectBottomNav from '@/features/dashboard/components/frame/navbars/MultiSelectBottomNav';
import Timer from '@/features/dashboard/components/tools/Timer';
import Random from '@/features/dashboard/tools/Random';
import DashboardCanvasToolbar from '@/features/dashboard/stage/DashboardCanvasToolbar';
import SeatingEditorCanvasToolbar from '@/features/seating/SeatingEditorCanvasToolbar';
import EditClassModal from '@/features/classes/components/modals/EditClassModal';
import DashboardClassModalsHost from '@/features/dashboard/DashboardClassModalsHost';
import {
  buildCanvasZoneCellClassName,
  buildShellToolbarConfig,
  canvasToolbarGridColsClassName,
  canvasToolbarGridInnerClassName,
  getShellGridConfig,
  getToolbarZoneCellClassName,
  mainFooterRowClassName,
  mainHeaderRowClassName,
  mainSectionRowClassName,
  mainSectionStagePaddingClassName,
  mainStageGridRowsClassName,
} from '@/features/dashboard/components/frame/dashboardZoneConfig';
import { STUDENT_EVENTS } from '@/lib/events/students';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { usePreferenceStore } from '@/stores/usePreferenceStore';
import { useSeatingStore } from '@/stores/useSeatingStore';

type DashboardShellProps = {
  children: ReactNode;
};

export default function DashboardShell({ children }: DashboardShellProps) {
  const { currentClassId } = useDashboardRouteStateSync();
  const classes = useDashboardStore((s) => s.classes);
  const sortBy = usePreferenceStore((s) => s.sortBy);
  const setSortBy = usePreferenceStore((s) => s.setSortBy);
  const { onLogoutStudentsNav } = useDashboardSessionActions();
  const { handleViewChange } = useViewPreferenceSync();
  const isSidebarOpen = useLayoutStore((s) => s.isSidebarOpen);
  const activeView = useLayoutStore((s) => s.activeView);
  const isEditMode = useLayoutStore((s) => s.isEditMode);
  const isMultiSelectMode = useLayoutStore((s) => s.isMultiSelectMode);
  const isTimerOpen = useLayoutStore((s) => s.isTimerOpen);
  const isRandomOpen = useLayoutStore((s) => s.isRandomOpen);
  const isEditClassModalOpen = useLayoutStore((s) => s.isEditClassModalOpen);
  const setEditClassModalOpen = useLayoutStore((s) => s.setEditClassModalOpen);
  const setTimerOpen = useLayoutStore((s) => s.setTimerOpen);
  const setRandomOpen = useLayoutStore((s) => s.setRandomOpen);
  const seatingLayoutsCount = useSeatingStore((s) => s.layouts.length);

  const currentClass = useMemo(
    () =>
      currentClassId ? classes.find((c) => c.id === currentClassId) ?? null : null,
    [classes, currentClassId]
  );
  const currentClassName = currentClassId
    ? (currentClass?.name ?? 'Loading...')
    : null;

  const isSeatingView = activeView === 'seating_chart';
  const showCanvasToolbar = Boolean(currentClassId);

  const shellGrid = getShellGridConfig({ isSidebarOpen, activeView, isEditMode });
  const toolbarConfig = buildShellToolbarConfig({
    activeView,
    isEditMode,
    seatingLayoutsCount,
  });
  const canvasZoneCellClassName = buildCanvasZoneCellClassName(showCanvasToolbar);
  const toolbarZoneCellClassName = getToolbarZoneCellClassName(
    isSeatingView,
    isEditMode
  );

  const onToggleMultiSelect = useCallback(() => {
    window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.TOGGLE_MULTI_SELECT));
  }, []);

  const onEditClass = useCallback(() => {
    setEditClassModalOpen(true);
  }, [setEditClassModalOpen]);

  const onTimerClick = useCallback(() => {
    setTimerOpen(true);
  }, [setTimerOpen]);

  const onRandomClick = useCallback(() => {
    setRandomOpen(true);
  }, [setRandomOpen]);

  return (
    <>
      <DashboardClassesSync />
      <div
        className={[
          'h-[100dvh] md:h-screen w-screen overflow-hidden bg-brand-purple grid transition-all duration-300 ease-in-out',
          shellGrid.dashboardGridColsClassName,
        ].join(' ')}
      >
        <aside className="h-full overflow-hidden pl-1">
          <div className="h-full overflow-hidden bg-white max-w-[19rem] ml-1">
            {shellGrid.useSeatingEditorLeftNav ? (
              <SeatingEditorLeftNav />
            ) : (
              <LeftNav />
            )}
          </div>
        </aside>
        <main className="min-w-0 w-full h-full overflow-hidden pl-1 pr-1 mt-0">
          <div
            className={[
              mainStageGridRowsClassName,
              currentClassName ? 'bg-brand-purple' : 'bg-brand-cream',
            ].join(' ')}
          >
            <header
              className={`${mainHeaderRowClassName} h-auto overflow-hidden`}
            >
              <TopNav
                currentClassName={currentClassName}
                suppressTeacherFallback={Boolean(currentClassId)}
              />
            </header>

            <section
              className={[
                mainSectionRowClassName,
                'relative w-full h-full min-h-0 overflow-hidden',
                mainSectionStagePaddingClassName,
              ].join(' ')}
            >
              <div
                className={[canvasToolbarGridInnerClassName, canvasToolbarGridColsClassName].join(
                  ' '
                )}
              >
                <div className={canvasZoneCellClassName}>
                  {isTimerOpen ? (
                    <Timer onClose={() => setTimerOpen(false)} />
                  ) : isRandomOpen ? (
                    <Random onClose={() => setRandomOpen(false)} />
                  ) : (
                    <div className="relative w-full h-full min-h-0 overflow-y-auto overflow-x-hidden">
                      {children}
                    </div>
                  )}
                </div>

                {showCanvasToolbar && (
                  <div className={toolbarZoneCellClassName}>
                    {isSeatingView && isEditMode ? (
                      <SeatingEditorCanvasToolbar
                        toolbarConfig={toolbarConfig}
                        classId={currentClassId}
                        onEditClass={onEditClass}
                      />
                    ) : (
                      <DashboardCanvasToolbar toolbarConfig={toolbarConfig} />
                    )}
                  </div>
                )}
              </div>
            </section>

            <footer
              className={`${mainFooterRowClassName} flex min-h-20 h-auto w-full flex-col overflow-visible relative z-20`}
            >
              {isMultiSelectMode ? (
                <MultiSelectBottomNav />
              ) : (
                <StudentsBottomNav
                  currentClassName={currentClassName}
                  currentView={isSeatingView ? 'seating' : 'grid'}
                  onViewChange={(view) => void handleViewChange(view)}
                  onTimerClick={onTimerClick}
                  onRandomClick={onRandomClick}
                  sortingDisabled={isSeatingView}
                  buttonsDisabled={isSeatingView && isEditMode}
                  classId={currentClassId}
                  onEditClass={onEditClass}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  onLogout={onLogoutStudentsNav}
                  onToggleMultiSelect={onToggleMultiSelect}
                  seatingLayoutsCount={seatingLayoutsCount}
                />
              )}
            </footer>
          </div>
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

