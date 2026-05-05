'use client';

import type { Dispatch, SetStateAction } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import type { Student } from '@/lib/types';
import SeatingChartWorkspace from './SeatingChartWorkspace';
import { useClassPointLog } from '@/hooks/useClassPointLog';
import { useSeatingLayoutManager } from '@/hooks/useSeatingLayoutManager';
import { useSeatingStore } from '@/stores/useSeatingStore';

interface SeatingChartViewProps {
  classId: string;
  students: Student[];
  setStudents: Dispatch<SetStateAction<Student[]>>;
  isMultiSelectMode?: boolean;
  selectedStudentIds?: string[];
  onSelectStudent?: (studentId: string) => void;
}

export default function SeatingChartView({
  classId,
  students: _students,
  setStudents: _setStudents,
  isMultiSelectMode = false,
  selectedStudentIds = [],
  onSelectStudent,
}: SeatingChartViewProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.toString() ?? '';
  const currentView = searchParams?.get('view') || 'grid';
  const selectedLayoutId = useSeatingStore((s) => s.selectedLayoutId);
  const setSelectedLayoutId = useSeatingStore((s) => s.setSelectedLayoutId);
  const { layouts, isLoadingLayouts, layoutsError } = useSeatingStore(
    useShallow((s) => ({
      layouts: s.layouts,
      isLoadingLayouts: s.isLoadingLayouts,
      layoutsError: s.layoutsError,
    }))
  );
  const { showGrid, showObjects, layoutOrientation } = useSeatingStore(
    useShallow((s) => ({
      showGrid: s.showGrid,
      showObjects: s.showObjects,
      layoutOrientation: s.layoutOrientation,
    }))
  );

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

  const {
    isTeacherView,
    isDeleteModalOpen,
    isEditLayoutModalOpen,
    isCreateModalOpen,
    layoutToDelete,
    layoutToEdit,
    setIsDeleteModalOpen,
    setIsEditLayoutModalOpen,
    setIsCreateModalOpen,
    setLayoutToDelete,
    setLayoutToEdit,
    handleDeleteConfirmed,
    handleCreateLayout,
    handleEditLayoutSave,
    retryLayouts,
  } = useSeatingLayoutManager({
    classId,
    currentView,
    pathname,
    searchQuery,
    selectedLayoutId,
    setSelectedLayoutId,
    layouts,
    setIsPointLogOpen,
  });

  return (
    <SeatingChartWorkspace
      showGrid={showGrid}
      showObjects={showObjects}
      layoutOrientation={layoutOrientation}
      isTeacherView={isTeacherView}
      isLoadingLayouts={isLoadingLayouts}
      layoutsError={layoutsError}
      hasLayouts={layouts.length > 0}
      isMultiSelectMode={isMultiSelectMode}
      selectedStudentIds={selectedStudentIds}
      onSelectStudent={onSelectStudent}
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
      isDeleteModalOpen={isDeleteModalOpen}
      layoutToDelete={layoutToDelete}
      isCreateModalOpen={isCreateModalOpen}
      isEditLayoutModalOpen={isEditLayoutModalOpen}
      layoutToEdit={layoutToEdit}
      onRetryLayouts={retryLayouts}
      onCloseDeleteModal={() => {
        setIsDeleteModalOpen(false);
        setLayoutToDelete(null);
      }}
      onConfirmDelete={handleDeleteConfirmed}
      onCloseCreateModal={() => setIsCreateModalOpen(false)}
      onCreateLayout={handleCreateLayout}
      onCloseEditModal={() => {
        setIsEditLayoutModalOpen(false);
        setLayoutToEdit(null);
      }}
      onSaveLayoutEdit={handleEditLayoutSave}
    />
  );
}
