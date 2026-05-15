'use client';

import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import PointsLogDrawer from '@/components/dashboard/PointsLogDrawer';
import SeatingChartView from '../seating/SeatingChartView';
import SeatingChartEditorView from '../seating/SeatingChartEditorView';
import StudentCardsGrid from './StudentCardsGrid';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { refreshDashboardStudents } from '@/hooks/sync/useDashboardStudentSync';
import { useClassPointLog } from '@/hooks/useClassPointLog';
import { useDashboardToolbarInset } from '@/hooks/useDashboardToolbarInset';
import { useStudentsModalsState } from '@/hooks/useStudentsModalsState';
import { useStudentsSelection } from '@/hooks/useStudentsSelection';
import { useStudentsToolbarEvents } from '@/hooks/useStudentsToolbarEvents';
import { usePreferenceStore } from '@/stores/usePreferenceStore';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { selectOrderedStudentIds, selectTotalClassPoints } from '@/stores/dashboardStudentSelectors';
import type { DashboardSetStudents } from '@/stores/useDashboardStore';
import type { Student } from '@/lib/types';

type StudentsWorkspaceProps = {
  classId: string;
  currentView: 'grid' | 'seating';
  isSeatingEditMode: boolean;
  isEditModeFromURL: boolean;
};

function SeatingStudentsBranch({
  classId,
  isSeatingEditMode,
  isEditModeFromURL,
  students,
  setStudents,
  isMultiSelectMode,
  selectedStudentIds,
  onSelectStudent,
}: {
  classId: string;
  isSeatingEditMode: boolean;
  isEditModeFromURL: boolean;
  students: Student[];
  setStudents: (next: DashboardSetStudents) => void;
  isMultiSelectMode: boolean;
  selectedStudentIds: string[];
  onSelectStudent: (studentId: string) => void;
}) {
  if (isSeatingEditMode || isEditModeFromURL) {
    return <SeatingChartEditorView classId={classId} students={students} />;
  }
  return (
    <SeatingChartView
      classId={classId}
      students={students}
      setStudents={setStudents}
      isMultiSelectMode={isMultiSelectMode}
      selectedStudentIds={selectedStudentIds}
      onSelectStudent={onSelectStudent}
    />
  );
}

export default function StudentsWorkspace({
  classId,
  currentView,
  isSeatingEditMode,
  isEditModeFromURL,
}: StudentsWorkspaceProps) {
  const sortBy = usePreferenceStore((s) => s.sortBy);
  const classes = useDashboardStore((s) => s.classes);
  const students = useDashboardStore((s) => s.students);
  const setStudents = useDashboardStore((s) => s.setStudents);
  const isLoadingStudents = useDashboardStore((s) => s.isLoadingStudents);
  const orderedStudentIdsSelector = useMemo(() => selectOrderedStudentIds(sortBy), [sortBy]);
  const orderedStudentIds = useDashboardStore(useShallow(orderedStudentIdsSelector));
  const totalClassPoints = useDashboardStore(selectTotalClassPoints);
  const error: string | null = null;

  const {
    openDropdownId,
    toggleDropdown,
    closeDropdown,
    handleEditStudent,
    handleDeleteStudent,
    handleStudentClick,
    handleWholeClassClick,
    openAddStudentsModal,
  } = useStudentsModalsState();

  const {
    isMultiSelectMode,
    selectedStudentIds,
    toggleMultiSelect,
    selectAll,
    selectNone,
    recentlySelect,
    awardPoints,
    inverseSelect,
    handleSelectStudent,
  } = useStudentsSelection();

  const currentClass = useMemo(() => classes.find((c) => c.id === classId) ?? null, [classes, classId]);
  const classIcon = currentClass?.icon || null;

  useEffect(() => {
    if (!openDropdownId) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-dropdown-container]')) {
        return;
      }
      if (target.closest('[data-student-card]')) {
        setTimeout(() => closeDropdown(), 0);
        return;
      }
      closeDropdown();
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [openDropdownId, closeDropdown]);

  const toolbarInset = useDashboardToolbarInset();
  const {
    isPointLogOpen,
    setIsPointLogOpen,
    isPointLogLoading,
    pointLogError,
    setLogPage,
    rowsPerPage,
    setRowsPerPage,
    logTotalCount,
    totalPages,
    safeLogPage,
    pagedPointLogRows,
  } = useClassPointLog(classId);

  useStudentsToolbarEvents({
    classId,
    currentView,
    onToggleMultiSelect: toggleMultiSelect,
    onSelectAll: selectAll,
    onSelectNone: selectNone,
    onRecentlySelect: recentlySelect,
    onAwardPoints: awardPoints,
    onInverseSelect: inverseSelect,
    setIsPointLogOpen,
  });

  if (isLoadingStudents) {
    return <LoadingState message="Loading students..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => void refreshDashboardStudents()} />;
  }

  return (
    <div className="h-full min-h-0 w-full min-w-0">
      <div
        className={
          currentView === 'grid'
            ? 'h-full min-h-0 w-full min-w-0 max-w-10xl mx-auto text-white-500 pr-2 md:pr-1'
            : 'h-full min-h-0 w-full text-white-500'
        }
      >
        {currentView === 'seating' ? (
          <SeatingStudentsBranch
            classId={classId}
            isSeatingEditMode={isSeatingEditMode}
            isEditModeFromURL={isEditModeFromURL}
            students={students}
            setStudents={setStudents}
            isMultiSelectMode={isMultiSelectMode}
            selectedStudentIds={selectedStudentIds}
            onSelectStudent={handleSelectStudent}
          />
        ) : (
          <>
            <PointsLogDrawer
              isOpen={isPointLogOpen}
              position="fixed"
              rightPx={60}
              topPx={toolbarInset.top}
              bottomPx={toolbarInset.bottom}
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
                onAddClick={openAddStudentsModal}
              />
            ) : (
              <StudentCardsGrid
                orderedStudentIds={orderedStudentIds}
                isMultiSelectMode={isMultiSelectMode}
                selectedStudentIds={selectedStudentIds}
                classIcon={classIcon}
                totalClassPoints={totalClassPoints}
                openDropdownId={openDropdownId}
                onWholeClassClick={handleWholeClassClick}
                onSelectStudent={handleSelectStudent}
                onToggleDropdown={toggleDropdown}
                onEditStudent={handleEditStudent}
                onDeleteStudent={handleDeleteStudent}
                onStudentClick={handleStudentClick}
                onAddStudent={openAddStudentsModal}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
