'use client';

import { useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import IconAddPlus from '@/components/ui/icons/iconAddPlus';
import IconEditPencil from '@/components/ui/icons/iconEditPencil';
import IconPresentationBoard from '@/components/ui/icons/iconPresentationBoard';
import IconDocumentClock from '@/components/ui/icons/iconDocumentClock';
import TopNav from '@/components/layout/TopNav';
import StudentsBottomNav from '@/components/layout/StudentsBottomNav';
import MultiSelectBottomNav from '@/components/layout/MultiSelectBottomNav';
import SeatingEditorBottomNavBridge from '@/components/layout/SeatingEditorBottomNavBridge';
import Timer from '@/components/dashboard/tools/Timer';
import Random from '@/components/dashboard/tools/Random';
import CanvasToolbar from '@/components/ui/CanvasToolbar';
import { STUDENT_EVENTS } from '@/lib/events/students';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { usePreferenceStore } from '@/stores/usePreferenceStore';
import { useDashboardSessionActions } from '@/hooks/useDashboardSessionActions';
import { useViewPreferenceSync } from '@/hooks/useViewPreferenceSync';

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
  const isSeatingView = useLayoutStore((s) => s.activeView === 'seating_chart');
  const isMultiSelectMode = useLayoutStore((s) => s.isMultiSelectMode);
  const isEditMode = useLayoutStore((s) => s.isEditMode);
  const isTimerOpen = useLayoutStore((s) => s.isTimerOpen);
  const isRandomOpen = useLayoutStore((s) => s.isRandomOpen);
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
  const showTopNav = !isSeatingView;
  const stageContentPadding = isSeatingView ? '' : 'pl-2 pt-2';
  const showBottomNav = currentClassName && !isTimerOpen && !isRandomOpen;

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

  const toolbarConfig = isSeatingView
    ? {
        className: 'z-10',
        topActions: isEditMode
          ? [
              {
                id: 'close-editor',
                title: 'Close editor',
                onClick: () => window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.STAGE_CLOSE_EDITOR)),
                icon: (
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ),
              },
            ]
          : [
              {
                id: 'add',
                title: 'Create new layout',
                onClick: () => window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.STAGE_CREATE_LAYOUT)),
                icon: <IconAddPlus className="w-6 h-6 text-black" />,
              },
              {
                id: 'edit',
                title: 'Seating Editor View',
                onClick: () => window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.STAGE_OPEN_SEATING_EDITOR)),
                icon: <IconEditPencil className="w-6 h-6 text-black" strokeWidth={2} />,
              },
            ],
        bottomActions: isEditMode
          ? []
          : [
              {
                id: 'teacher-view',
                title: "Teacher's view",
                onClick: () => window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.STAGE_TOGGLE_TEACHER_VIEW)),
                icon: <IconPresentationBoard className="w-6 h-6 text-black" strokeWidth={2} />,
              },
              {
                id: 'point-log',
                title: 'Toggle point log',
                onClick: () => window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.STAGE_TOGGLE_POINT_LOG)),
                icon: <IconDocumentClock className="w-6 h-6 text-black" strokeWidth={2} />,
              },
            ],
      }
    : {
        className: '!bg-white',
        topActions: [
          {
            id: 'add',
            title: 'Create layout (seating view only)',
            disabled: true,
            icon: <IconAddPlus className="w-6 h-6 text-gray-500" />,
          },
          {
            id: 'edit',
            title: 'Seating Editor (seating view only)',
            disabled: true,
            icon: <IconEditPencil className="w-6 h-6 text-gray-500" strokeWidth={2} />,
          },
        ],
        bottomActions: [
          {
            id: 'teacher-view',
            title: "Teacher's view (seating view only)",
            disabled: true,
            icon: <IconPresentationBoard className="w-6 h-6 text-gray-500" strokeWidth={2} />,
          },
          {
            id: 'point-log',
            title: 'Toggle point log',
            onClick: () => window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.STAGE_TOGGLE_POINT_LOG)),
            icon: <IconDocumentClock className="w-6 h-6 text-black" strokeWidth={2} />,
          },
        ],
      };

  return (
    <div
      className={[
        'h-full w-full overflow-hidden grid',
        'grid-cols-[1fr_3.5rem]',
        'grid-rows-[7.5rem_1fr_5rem]',
        currentClassName ? 'bg-brand-purple' : 'bg-brand-cream',
      ].join(' ')}
    >
      {/* Top nav */}
      {showTopNav && (
        <div className="col-start-1 col-span-2 row-start-1 overflow-hidden">
          <TopNav currentClassName={currentClassName} suppressTeacherFallback={suppressTeacherFallback} />
        </div>
      )}

      {/* Main content cell */}
      <div
        className={[
          'col-start-1 h-full w-full overflow-hidden',
          isSeatingView ? 'row-start-1 row-span-2' : 'row-start-2',
          stageContentPadding,
        ].join(' ')}
      >
        <div className="h-full w-full overflow-hidden">
          {isTimerOpen ? (
            <Timer onClose={() => setTimerOpen(false)} />
          ) : isRandomOpen ? (
            <Random onClose={() => setRandomOpen(false)} />
          ) : (
            <div className="h-full w-full overflow-hidden">
              {children}
            </div>
          )}
        </div>
      </div>

      {/* Toolbar rail */}
      {showCanvasToolbar && (
        <div
          data-stage-toolbar-slot
          className={[
            'col-start-2 h-full overflow-hidden',
            isSeatingView ? 'row-start-1 row-span-2' : 'row-start-2',
          ].join(' ')}
        >
          <CanvasToolbar
            className={`h-full ${toolbarConfig.className ?? ''}`}
            topActions={toolbarConfig.topActions}
            bottomActions={toolbarConfig.bottomActions}
          />
        </div>
      )}

      {/* Bottom nav */}
      {showBottomNav && (
        <div className="col-start-1 col-span-2 row-start-3 overflow-visible relative z-20 w-full">
          {isSeatingView && isEditMode ? (
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
              currentView={isSeatingView ? 'seating' : 'grid'}
              onViewChange={(view) => void handleViewChange(view)}
              onTimerClick={onTimerClick}
              onRandomClick={onRandomClick}
              sortingDisabled={isSeatingView}
              classId={classId}
              onEditClass={onEditClass}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onLogout={onLogoutStudentsNav}
              onToggleMultiSelect={onToggleMultiSelect}
            />
          )}
        </div>
      )}
    </div>
  );
}
