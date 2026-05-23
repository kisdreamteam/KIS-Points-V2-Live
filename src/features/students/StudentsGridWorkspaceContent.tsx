'use client';

import type { Dispatch, SetStateAction } from 'react';
import PointsLogDrawer from '@/features/dashboard/components/PointsLogDrawer';
import EmptyState from '@/components/ui/EmptyState';
import StudentCardsGrid from './StudentCardsGrid';
import type { PointLogRow } from '@/hooks/useClassPointLog';

type StudentsGridWorkspaceContentProps = {
  toolbarInset: { top: number; bottom: number };
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
  onWholeClassClick: () => void;
  onSelectStudent: (studentId: string) => void;
  onToggleDropdown: (studentId: string, event: React.MouseEvent) => void;
  onEditStudent: (studentId: string) => void;
  onDeleteStudent: (studentId: string, studentName: string) => void;
  onStudentClick: (studentId: string) => void;
  onAddStudent: () => void;
};

export default function StudentsGridWorkspaceContent({
  toolbarInset,
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
  onWholeClassClick,
  onSelectStudent,
  onToggleDropdown,
  onEditStudent,
  onDeleteStudent,
  onStudentClick,
  onAddStudent,
}: StudentsGridWorkspaceContentProps) {
  return (
    <div className="h-full min-h-0 w-full min-w-0 max-w-10xl mx-auto text-white-500 pr-2 md:pr-1">
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
          onAddClick={onAddStudent}
          showStudentMascots
        />
      ) : (
        <StudentCardsGrid
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
}
