'use client';

import { useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import IconAddPlus from '@/components/ui/icons/iconAddPlus';
import IconEditPencil from '@/components/ui/icons/iconEditPencil';
import IconPresentationBoard from '@/components/ui/icons/iconPresentationBoard';
import IconDocumentClock from '@/components/ui/icons/iconDocumentClock';
import TopNav from '@/components/dashboard/shell/TopNav';
import StudentsBottomNav from '@/components/dashboard/shell/StudentsBottomNav';
import MultiSelectBottomNav from '@/components/dashboard/shell/MultiSelectBottomNav';
import SeatingEditorBottomNavBridge from '@/components/dashboard/shell/SeatingEditorBottomNavBridge';
import Timer from '@/components/dashboard/tools/Timer';
import Random from '@/components/dashboard/tools/Random';
import CanvasToolbar from '@/components/ui/CanvasToolbar';
import type { CanvasToolbarAction } from '@/components/ui/CanvasToolbar';
import { STUDENT_EVENTS } from '@/lib/events/students';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { usePreferenceStore } from '@/stores/usePreferenceStore';
import { useSeatingStore } from '@/stores/useSeatingStore';
import { useDashboardSessionActions } from '@/hooks/useDashboardSessionActions';
import { useViewPreferenceSync } from '@/hooks/sync/useViewPreferenceSync';
import {
  getWorkspaceZoneConfig,
  type ToolbarActionDef,
  type DashboardToolbarDef,
} from '@/components/dashboard/shell/dashboardZoneConfig';

interface DashboardWorkspaceProps {
  children: React.ReactNode;
  showCanvasToolbar?: boolean;
}

export default function DashboardWorkspace({
  children,
  showCanvasToolbar = true,
}: DashboardWorkspaceProps) {
  const pathname = usePathname();
  const classes = useDashboardStore((s) => s.classes);
  const sortBy = usePreferenceStore((s) => s.sortBy);
  const setSortBy = usePreferenceStore((s) => s.setSortBy);
  const { onLogoutStudentsNav } = useDashboardSessionActions();
  const { handleViewChange } = useViewPreferenceSync();
  const activeView = useLayoutStore((s) => s.activeView);
  const isMultiSelectMode = useLayoutStore((s) => s.isMultiSelectMode);
  const isEditMode = useLayoutStore((s) => s.isEditMode);
  const isTimerOpen = useLayoutStore((s) => s.isTimerOpen);
  const isRandomOpen = useLayoutStore((s) => s.isRandomOpen);
  const seatingLayoutsCount = useSeatingStore((s) => s.layouts.length);
  const setTimerOpen = useLayoutStore((s) => s.setTimerOpen);
  const setRandomOpen = useLayoutStore((s) => s.setRandomOpen);
  const setEditClassModalOpen = useLayoutStore((s) => s.setEditClassModalOpen);

  const classId = pathname?.match(/\/dashboard\/classes\/([^/]+)/)?.[1] ?? null;
  const currentClass = useMemo(
    () => (classId ? classes.find((c) => c.id === classId) ?? null : null),
    [classes, classId]
  );
  const currentClassName = classId ? (currentClass?.name ?? 'Loading...') : null;
  const suppressTeacherFallback = !!classId;
  const zoneConfig = getWorkspaceZoneConfig({
    activeView,
    isEditMode,
    isTimerOpen,
    isRandomOpen,
    currentClassName,
    seatingLayoutsCount,
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

  const toCanvasAction = useCallback((action: ToolbarActionDef): CanvasToolbarAction => {
    switch (action.id) {
      case 'close-editor':
        return {
          ...action,
          onClick: () => window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.STAGE_CLOSE_EDITOR)),
          icon: (
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
        };
      case 'add':
        return {
          ...action,
          onClick: action.disabled ? undefined : () => window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.STAGE_CREATE_LAYOUT)),
          icon: <IconAddPlus className={action.disabled ? 'w-6 h-6 text-gray-500' : 'w-6 h-6 text-black'} />,
        };
      case 'edit':
        return {
          ...action,
          onClick: action.disabled ? undefined : () => window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.STAGE_OPEN_SEATING_EDITOR)),
          icon: <IconEditPencil className={action.disabled ? 'w-6 h-6 text-gray-500' : 'w-6 h-6 text-black'} strokeWidth={2} />,
        };
      case 'layout-manager':
        return {
          ...action,
          onClick: () => window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.STAGE_TOGGLE_LAYOUT_MANAGER)),
          icon: (
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
            </svg>
          ),
        };
      case 'teacher-view':
        return {
          ...action,
          onClick: action.disabled ? undefined : () => window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.STAGE_TOGGLE_TEACHER_VIEW)),
          icon: (
            <IconPresentationBoard
              className={action.disabled ? 'w-6 h-6 text-gray-500' : 'w-6 h-6 text-black'}
              strokeWidth={2}
            />
          ),
        };
      case 'point-log':
        return {
          ...action,
          onClick: () => window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.STAGE_TOGGLE_POINT_LOG)),
          icon: <IconDocumentClock className="w-6 h-6 text-black" strokeWidth={2} />,
        };
      default:
        throw new Error(`Unhandled toolbar action id: ${String(action.id)}`);
    }
  }, []);

  const toolbarConfig: DashboardToolbarDef = {
    className: zoneConfig.toolbarConfig.className,
    topActions: zoneConfig.toolbarConfig.topActions,
    bottomActions: zoneConfig.toolbarConfig.bottomActions,
  };

  const canvasToolbarTopActions = toolbarConfig.topActions.map(toCanvasAction);
  const canvasToolbarBottomActions = toolbarConfig.bottomActions.map(toCanvasAction);

  return (
    <div
      className={[
        'grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-2',
        currentClassName ? 'bg-brand-purple' : 'bg-brand-cream',
      ].join(' ')}
    >
      {zoneConfig.showTopNav && (
        <header className="row-start-1 row-end-2 h-auto overflow-hidden">
          <TopNav currentClassName={currentClassName} suppressTeacherFallback={suppressTeacherFallback} />
        </header>
      )}

      <section
        className={['row-start-2 row-end-3 relative w-full h-full min-h-0 overflow-hidden', zoneConfig.stageContentPadding].join(' ')}
      >
        <div className="grid h-full min-h-0 grid-cols-[1fr_auto]">
          <div className="relative w-full h-full min-h-0 overflow-hidden">
            {isTimerOpen ? (
              <Timer onClose={() => setTimerOpen(false)} />
            ) : isRandomOpen ? (
              <Random onClose={() => setRandomOpen(false)} />
            ) : (
              <div className="relative w-full h-full min-h-0 overflow-hidden">
                {children}
              </div>
            )}
          </div>

          {showCanvasToolbar && (
            <div data-stage-toolbar-slot className="h-full min-h-0 overflow-hidden">
              <CanvasToolbar
                className={`h-full ${toolbarConfig.className ?? ''}`}
                topActions={canvasToolbarTopActions}
                bottomActions={canvasToolbarBottomActions}
              />
            </div>
          )}
        </div>
      </section>

      {zoneConfig.showBottomNav && (
        <footer className="row-start-3 row-end-4 flex min-h-16 h-auto w-full flex-col overflow-visible relative z-20">
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
  );
}
