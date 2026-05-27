'use client';

import type { Dispatch, SetStateAction } from 'react';
import StageTwoColumnSplit from '@/components/ui/StageTwoColumnSplit';
import PointsLogDrawer from '@/features/dashboard/components/PointsLogDrawer';
import EmptyState from '@/components/ui/EmptyState';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import StudentsCardsGrid from './StudentsCardsGrid';
import StudentsGridWorkspaceToolbar from './StudentsGridWorkspaceToolbar';
import { refreshDashboardStudents } from '@/features/dashboard/hooks/sync/useDashboardStudentSync';
import {
  getStageDrawerInsets,
  useDashboardToolbarInset,
} from '@/features/dashboard/hooks/useDashboardToolbarInset';
import { useCloseDrawersOnClickOutside } from '@/hooks/useCloseDrawersOnClickOutside';
import type { PointLogRow } from '@/hooks/useClassPointLog';

export type StudentsGridWorkspaceProps = {
  classId: string;
  currentView: 'grid' | 'seating';
  isLoadingStudents: boolean;
  error: string | null;
  isPointLogOpen: boolean;
  setLogPage: Dispatch<SetStateAction<number>>;
  setRowsPerPage: Dispatch<SetStateAction<number>>;
  rowsPerPage: number;
  logTotalCount: number;
  pointLogError: string | null;
  isPointLogLoading: boolean;
  pagedPointLogRows: PointLogRow[];
  safeLogPage: number;
  totalPages: number;
  orderedStudentIds: string[];
  isMultiSelectMode: boolean;
  selectedStudentIds: string[];
  classIcon: string | null;
  totalClassPoints: number;
  openDropdownId: string | null;
  setIsPointLogOpen: Dispatch<SetStateAction<boolean>>;
  onWholeClassClick: () => void;
  onSelectStudent: (studentId: string) => void;
  onToggleDropdown: (studentId: string, event: React.MouseEvent) => void;
  onEditStudent: (studentId: string) => void;
  onDeleteStudent: (studentId: string, studentName: string) => void;
  onStudentClick: (studentId: string) => void;
  onAddStudent: () => void;
};

export default function StudentsGridWorkspace({
  classId,
  currentView,
  isLoadingStudents,
  error,
  isPointLogOpen,
  setLogPage,
  setRowsPerPage,
  rowsPerPage,
  logTotalCount,
  pointLogError,
  isPointLogLoading,
  pagedPointLogRows,
  safeLogPage,
  totalPages,
  orderedStudentIds,
  isMultiSelectMode,
  selectedStudentIds,
  classIcon,
  totalClassPoints,
  openDropdownId,
  setIsPointLogOpen,
  onWholeClassClick,
  onSelectStudent,
  onToggleDropdown,
  onEditStudent,
  onDeleteStudent,
  onStudentClick,
  onAddStudent,
}: StudentsGridWorkspaceProps) {
  const toolbarInset = useDashboardToolbarInset();
  const drawerInsets = getStageDrawerInsets(toolbarInset);

  useCloseDrawersOnClickOutside({
    isActive: isPointLogOpen,
    onClose: () => setIsPointLogOpen(false),
  });

  const mainContent = (() => {
    if (isLoadingStudents) {
      return <LoadingState message="Loading students..." />;
    }

    if (error) {
      return <ErrorState error={error} onRetry={() => void refreshDashboardStudents()} />;
    }

    return (
      <div className="h-full min-h-0 w-full min-w-0 max-w-10xl mx-auto text-white-500 pr-2 md:pr-1">
        <PointsLogDrawer
          isOpen={isPointLogOpen}
          position="fixed"
          rightPx={60}
          topPx={drawerInsets.topPx}
          bottomPx={drawerInsets.bottomPx}
          zIndex={35}
          logTotalCount={logTotalCount}
          pointLogError={pointLogError}
          isPointLogLoading={isPointLogLoading}
          pagedRows={pagedPointLogRows}
          safeLogPage={safeLogPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          setLogPage={setLogPage}
          setRowsPerPage={setRowsPerPage}
        />

        {orderedStudentIds.length === 0 ? (
          <EmptyState
            title="No students yet"
            message="Students will appear here once they are added to this class."
            buttonText="Add Your First Student"
            onAddClick={onAddStudent}
            showStudentMascots
          />
        ) : (
          <StudentsCardsGrid
            orderedStudentIds={orderedStudentIds}
            isMultiSelectMode={isMultiSelectMode}
            selectedStudentIds={selectedStudentIds}
            classIcon={classIcon}
            totalClassPoints={totalClassPoints}
            openDropdownId={openDropdownId}
            onWholeClassClick={onWholeClassClick}
            onSelectStudent={onSelectStudent}
            onToggleDropdown={onToggleDropdown}
            onEditStudent={onEditStudent}
            onDeleteStudent={onDeleteStudent}
            onStudentClick={onStudentClick}
            onAddStudent={onAddStudent}
          />
        )}
      </div>
    );
  })();

  return (
    <StageTwoColumnSplit rightRail={<StudentsGridWorkspaceToolbar />}>
      {mainContent}
    </StageTwoColumnSplit>
  );
}
