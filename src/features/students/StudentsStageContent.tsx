'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import StudentsGridBranch from './StudentsGridBranch';
import StudentsSeatingBranch from '@/features/seating/StudentsSeatingBranch';
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal';
import { useArchiveStudent } from '@/features/students/hooks/useArchiveStudent';
import { useClassPointLog } from '@/hooks/useClassPointLog';
import { useStudentsModalsState } from '@/features/students/hooks/useStudentsModalsState';
import { useStudentsSelection } from '@/features/students/hooks/useStudentsSelection';
import { useStudentsToolbarEvents } from '@/features/students/hooks/useStudentsToolbarEvents';
import { usePreferenceStore } from '@/stores/usePreferenceStore';
import { useDashboardStore } from '@/features/dashboard/stores/useDashboardStore';
import { selectOrderedStudentIds, selectTotalClassPoints } from '@/features/students/stores/dashboardStudentSelectors';

type StudentsStageContentProps = {
  classId: string;
  currentView: 'grid' | 'seating';
  isSeatingEditMode: boolean;
  isEditModeFromURL: boolean;
};

export default function StudentsStageContent({
  classId,
  currentView,
  isSeatingEditMode,
  isEditModeFromURL,
}: StudentsStageContentProps) {
  const sortBy = usePreferenceStore((s) => s.sortBy);
  const classes = useDashboardStore((s) => s.classes);
  const students = useDashboardStore((s) => s.students);
  const isLoadingStudents = useDashboardStore((s) => s.isLoadingStudents);
  const orderedStudentIdsSelector = useMemo(() => selectOrderedStudentIds(sortBy), [sortBy]);
  const orderedStudentIds = useDashboardStore(useShallow(orderedStudentIdsSelector));
  const totalClassPoints = useDashboardStore(selectTotalClassPoints);
  const error: string | null = null;
  const [studentToArchive, setStudentToArchive] = useState<{ id: string; name: string } | null>(null);

  const {
    isMultiSelectMode,
    selectedStudentIds,
    selectedGroupIds,
    toggleMultiSelect,
    selectAll,
    selectNone,
    recentlySelect,
    awardPoints,
    inverseSelect,
    selectAllBoys,
    selectAllGirls,
    handleSelectStudent,
    handleSelectGroup,
    removeFromSelection,
    clearGroupSelection,
  } = useStudentsSelection();

  const { archiveStudent, isArchiving } = useArchiveStudent(classId, {
    onRemoveFromSelection: removeFromSelection,
  });

  const handleRequestDeleteStudent = useCallback((studentId: string, studentName: string) => {
    setStudentToArchive({ id: studentId, name: studentName });
  }, []);

  const {
    openDropdownId,
    toggleDropdown,
    closeDropdown,
    handleEditStudent,
    handleDeleteStudent,
    handleStudentClick,
    handleWholeClassClick,
    openAddStudentsModal,
  } = useStudentsModalsState({ onRequestDeleteStudent: handleRequestDeleteStudent });

  const handleConfirmArchiveStudent = useCallback(async () => {
    if (!studentToArchive) return;
    const { id, name } = studentToArchive;
    setStudentToArchive(null);
    await archiveStudent(id, name);
  }, [studentToArchive, archiveStudent]);

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
    onSelectAllBoys: selectAllBoys,
    onSelectAllGirls: selectAllGirls,
    clearGroupSelection,
    setIsPointLogOpen,
  });

  return (
    <div className="h-full min-h-0 w-full min-w-0">
      {currentView === 'seating' ? (
        <StudentsSeatingBranch
          classId={classId}
          isSeatingEditMode={isSeatingEditMode}
          isEditModeFromURL={isEditModeFromURL}
          students={students}
          isMultiSelectMode={isMultiSelectMode}
          selectedStudentIds={selectedStudentIds}
          selectedGroupIds={selectedGroupIds}
          onSelectStudent={handleSelectStudent}
          onSelectGroup={handleSelectGroup}
        />
      ) : (
        <StudentsGridBranch
          classId={classId}
          currentView={currentView}
          isLoadingStudents={isLoadingStudents}
          error={error}
          isPointLogOpen={isPointLogOpen}
          setLogPage={setLogPage}
          setRowsPerPage={setRowsPerPage}
          rowsPerPage={rowsPerPage}
          logTotalCount={logTotalCount}
          pointLogError={pointLogError}
          isPointLogLoading={isPointLogLoading}
          pagedPointLogRows={pagedPointLogRows}
          safeLogPage={safeLogPage}
          totalPages={totalPages}
          orderedStudentIds={orderedStudentIds}
          isMultiSelectMode={isMultiSelectMode}
          selectedStudentIds={selectedStudentIds}
          classIcon={classIcon}
          totalClassPoints={totalClassPoints}
          openDropdownId={openDropdownId}
          setIsPointLogOpen={setIsPointLogOpen}
          onWholeClassClick={handleWholeClassClick}
          onSelectStudent={handleSelectStudent}
          onToggleDropdown={toggleDropdown}
          onEditStudent={handleEditStudent}
          onDeleteStudent={handleDeleteStudent}
          onStudentClick={handleStudentClick}
          onAddStudent={openAddStudentsModal}
        />
      )}

      <ConfirmationModal
        isOpen={studentToArchive !== null}
        onClose={() => {
          if (!isArchiving) setStudentToArchive(null);
        }}
        onConfirm={() => void handleConfirmArchiveStudent()}
        title="Delete Student"
        message={
          studentToArchive
            ? `Are you sure you want to remove "${studentToArchive.name}" from this class? They will be removed from the roster and seating chart. Point history will be preserved.`
            : ''
        }
        confirmText={isArchiving ? 'Removing...' : 'Delete Student'}
        cancelText="Cancel"
        confirmButtonColor="red"
        icon={
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        }
      />
    </div>
  );
}
