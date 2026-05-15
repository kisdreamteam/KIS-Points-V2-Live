'use client';

import { useCallback, useMemo, type FC, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useDashboardRouteStateSync } from '@/hooks/sync/useDashboardRouteStateSync';
import { refreshDashboardClassesForUserAction } from '@/hooks/sync/useDashboardClassesSync';
import { useViewPreferenceSync } from '@/hooks/sync/useViewPreferenceSync';
import { useDashboardSessionActions } from '@/hooks/useDashboardSessionActions';
import LeftNav from '@/components/dashboard/frame/navbars/LeftNav';
import SeatingEditorLeftNav from '@/components/dashboard/frame/navbars/SeatingEditorLeftNav';
import TopNav from '@/components/dashboard/frame/navbars/TopNav';
import StudentsBottomNav from '@/components/dashboard/frame/navbars/StudentsBottomNav';
import MultiSelectBottomNav from '@/components/dashboard/frame/navbars/MultiSelectBottomNav';
import SeatingEditorBottomNavBridge from '@/components/dashboard/frame/navbars/SeatingEditorBottomNavBridge';
import Timer from '@/components/dashboard/tools/Timer';
import Random from '@/modules/dashboard/tools/Random';
import DashboardCanvasToolbar from '@/modules/dashboard/stage/DashboardCanvasToolbar';
import SeatingEditorCanvasToolbar from '@/modules/seating/SeatingEditorCanvasToolbar';
import EditClassModal from '@/components/dashboard/modals/EditClassModal';
import DashboardClassModalsHost from '@/modules/dashboard/DashboardClassModalsHost';
import type { DashboardToolbarDef } from '@/components/dashboard/frame/dashboardZoneConfig';
import { STUDENT_EVENTS } from '@/lib/events/students';
import { useLayoutStore, type ViewState } from '@/stores/useLayoutStore';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { usePreferenceStore } from '@/stores/usePreferenceStore';
import { useSeatingStore } from '@/stores/useSeatingStore';

type DashboardZoneInputs = {
  isSidebarOpen: boolean;
  activeView: ViewState;
  isEditMode: boolean;
};

type WorkspaceZoneInputs = {
  activeView: ViewState;
  isEditMode: boolean;
  isTimerOpen: boolean;
  isRandomOpen: boolean;
  currentClassName: string | null;
  seatingLayoutsCount: number;
  showCanvasToolbar: boolean;
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

function getWorkspaceZoneConfig({
  activeView,
  isEditMode,
  isTimerOpen,
  isRandomOpen,
  currentClassName,
  seatingLayoutsCount,
  showCanvasToolbar,
}: WorkspaceZoneInputs) {
  const isSeatingView = activeView === 'seating_chart';
  const showTopNav = !isSeatingView;
  const stageContentPadding = isSeatingView ? '' : 'pl-0 pt-0';
  const showBottomNav =
    Boolean(currentClassName) && !isTimerOpen && !isRandomOpen;
  const mainSectionRowClass = showTopNav ? 'row-start-2 row-end-3' : 'row-start-1 row-end-3';
  const mainSectionGridColsClass = 'grid-cols-[1fr_auto]';
  const canvasZoneCellClass = [
    'relative w-full h-full min-h-0 overflow-y-auto overflow-x-hidden pt-1',
    showCanvasToolbar ? '' : 'col-start-1 col-end-3',
  ].filter(Boolean).join(' ');
  const toolbarZoneCellClass = [
    'relative h-full min-h-0',
    isSeatingView && isEditMode ? 'overflow-visible' : 'overflow-hidden',
  ].join(' ');

  const toolbarConfig: DashboardToolbarDef = isSeatingView
    ? {
      className: 'z-10',
      topActions: isEditMode
        ? [{ id: 'close-editor', title: 'Close editor' }]
        : [
          { id: 'add', title: 'Create new layout' },
          { id: 'edit', title: 'Seating Editor View' },
          {
            id: 'layout-manager',
            title: 'Layout manager',
            disabled: seatingLayoutsCount === 0,
          },
        ],
      bottomActions: isEditMode
        ? []
        : [
          { id: 'teacher-view', title: "Teacher's view" },
          { id: 'point-log', title: 'Toggle point log' },
        ],
    }
    : {
      className: '!bg-white',
      topActions: [
        {
          id: 'add',
          title: 'Create layout (seating view only)',
          disabled: true,
        },
        {
          id: 'edit',
          title: 'Seating Editor (seating view only)',
          disabled: true,
        },
        { id: 'layout-manager', title: 'Layout manager', disabled: true },
      ],
      bottomActions: [
        {
          id: 'teacher-view',
          title: "Teacher's view (seating view only)",
          disabled: true,
        },
        { id: 'point-log', title: 'Toggle point log' },
      ],
    };

  return {
    isSeatingView,
    showTopNav,
    stageContentPadding,
    showBottomNav,
    mainSectionRowClass,
    mainSectionGridColsClass,
    canvasZoneCellClass,
    toolbarZoneCellClass,
    showCanvasToolbar,
    toolbarConfig,
  };
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname();
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

  const classId = pathname?.match(/\/dashboard\/classes\/([^/]+)/)?.[1] ?? null;
  const currentClass = useMemo(
    () => (classId ? classes.find((c) => c.id === classId) ?? null : null),
    [classes, classId]
  );
  const currentClassName = classId ? (currentClass?.name ?? 'Loading...') : null;
  const suppressTeacherFallback = !!classId;
  const isClassesRootView = !currentClassId;
  const dashboardZones = getDashboardZoneConfig({ isSidebarOpen, activeView, isEditMode });
  const zoneConfig = getWorkspaceZoneConfig({
    activeView,
    isEditMode,
    isTimerOpen,
    isRandomOpen,
    currentClassName,
    seatingLayoutsCount,
    showCanvasToolbar: !isClassesRootView,
  });

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

  const toolbarConfig: DashboardToolbarDef = {
    className: zoneConfig.toolbarConfig.className,
    topActions: zoneConfig.toolbarConfig.topActions,
    bottomActions: zoneConfig.toolbarConfig.bottomActions,
  };

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
        <main className="h-full overflow-hidden pl-1 pr-1 mt-0">
          <div
            className={[
              'grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-0',
              currentClassName ? 'bg-brand-purple' : 'bg-brand-cream',
            ].join(' ')}
          >
            {zoneConfig.showTopNav && (
              <header className="row-start-1 row-end-2 h-auto overflow-hidden">
                <TopNav
                  currentClassName={currentClassName}
                  suppressTeacherFallback={suppressTeacherFallback}
                />
              </header>
            )}

            <section
              className={[
                zoneConfig.mainSectionRowClass,
                'relative w-full h-full min-h-0 overflow-hidden',
                zoneConfig.stageContentPadding,
              ].join(' ')}
            >
              <div
                className={[
                  'grid h-full min-h-0 -mt-0',
                  zoneConfig.mainSectionGridColsClass,
                ].join(' ')}
              >
                <div className={zoneConfig.canvasZoneCellClass}>
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

                {zoneConfig.showCanvasToolbar && (
                  <div className={zoneConfig.toolbarZoneCellClass}>
                    {zoneConfig.isSeatingView && isEditMode ? (
                      <SeatingEditorCanvasToolbar toolbarConfig={toolbarConfig} />
                    ) : (
                      <DashboardCanvasToolbar toolbarConfig={toolbarConfig} />
                    )}
                  </div>
                )}
              </div>
            </section>

            {zoneConfig.showBottomNav && (
              <footer className="row-start-3 row-end-4 flex min-h-20 h-auto w-full flex-col overflow-visible relative z-20">
                {zoneConfig.isSeatingView && isEditMode ? (
                  <SeatingEditorBottomNavBridge
                    currentClassName={currentClassName}
                    classId={classId}
                    onEditClass={onEditClass}
                  />
                ) : isMultiSelectMode ? (
                  <MultiSelectBottomNav />
                ) : (
                  <StudentsBottomNav
                    currentClassName={currentClassName}
                    currentView={zoneConfig.isSeatingView ? 'seating' : 'grid'}
                    onViewChange={(view) => void handleViewChange(view)}
                    onTimerClick={onTimerClick}
                    onRandomClick={onRandomClick}
                    sortingDisabled={zoneConfig.isSeatingView}
                    classId={classId}
                    onEditClass={onEditClass}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    onLogout={onLogoutStudentsNav}
                    onToggleMultiSelect={onToggleMultiSelect}
                  />
                )}
              </footer>
            )}
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
};

export default DashboardLayout;
