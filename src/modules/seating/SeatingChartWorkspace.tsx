'use client';

import type { Dispatch, SetStateAction } from 'react';
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal';
import CreateLayoutModal from '@/components/dashboard/modals/CreateLayoutModal';
import EditLayoutModal from '@/components/dashboard/modals/EditLayoutModal';
import ClassPointLogSlidePanel from '@/components/dashboard/ClassPointLogSlidePanel';
import SeatingCanvasDecor from '@/components/dashboard/seating/SeatingCanvasDecor';
import SeatingGroupsCanvas from '@/components/dashboard/seating/SeatingGroupsCanvas';
import type { PointLogRow } from '@/hooks/useClassPointLog';

type SeatingChartWorkspaceProps = {
  showGrid: boolean;
  showObjects: boolean;
  layoutOrientation: string;
  isTeacherView: boolean;
  isLoadingLayouts: boolean;
  layoutsError: string | null;
  hasLayouts: boolean;
  isMultiSelectMode: boolean;
  selectedStudentIds: string[];
  onSelectStudent?: (studentId: string) => void;
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
  isDeleteModalOpen: boolean;
  layoutToDelete: { id: string; name: string } | null;
  isCreateModalOpen: boolean;
  isEditLayoutModalOpen: boolean;
  layoutToEdit: { id: string; name: string } | null;
  onRetryLayouts: () => void;
  onCloseDeleteModal: () => void;
  onConfirmDelete: () => void;
  onCloseCreateModal: () => void;
  onCreateLayout: (layoutName: string) => Promise<void>;
  onCloseEditModal: () => void;
  onSaveLayoutEdit: (newName: string) => Promise<void>;
};

export default function SeatingChartWorkspace({
  showGrid,
  showObjects,
  layoutOrientation,
  isTeacherView,
  isLoadingLayouts,
  layoutsError,
  hasLayouts,
  isMultiSelectMode,
  selectedStudentIds,
  onSelectStudent,
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
  isDeleteModalOpen,
  layoutToDelete,
  isCreateModalOpen,
  isEditLayoutModalOpen,
  layoutToEdit,
  onRetryLayouts,
  onCloseDeleteModal,
  onConfirmDelete,
  onCloseCreateModal,
  onCreateLayout,
  onCloseEditModal,
  onSaveLayoutEdit,
}: SeatingChartWorkspaceProps) {
  const showGroupsLayer = hasLayouts && !isLoadingLayouts && !layoutsError;

  return (
    <div className="font-spartan w-full h-full min-h-0 bg-brand-purple relative">
      <ClassPointLogSlidePanel
        isOpen={isPointLogOpen}
        position="absolute"
        rightPx={72}
        topPx={8}
        bottomPx={8}
        zIndex={40}
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

      <div
        className="bg-brand-cream border-2 border-black rounded-lg pt-2 overflow-hidden min-h-0 h-full w-full relative"
        style={{ zIndex: 1 }}
      >
        {isLoadingLayouts && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-brand-cream/80">
            <p className="text-brand-purple text-xl font-medium">Loading seating charts...</p>
          </div>
        )}

        {layoutsError && !isLoadingLayouts && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-brand-cream/90 p-4">
            <p className="text-brand-purple text-xl text-center">{layoutsError}</p>
            <button
              type="button"
              onClick={onRetryLayouts}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoadingLayouts && !layoutsError && !hasLayouts && (
          <div className="p-6 sm:p-8 md:p-10 h-full flex flex-col items-center justify-center min-h-[40vh] gap-6">
            <div className="text-center">
              <h2 className="text-brand-purple text-2xl font-semibold mb-2">No seating charts yet</h2>
              <p className="text-brand-purple/80 text-lg">
                Click the + button (top right) to create a new layout, or the pencil to open the Seating Editor after you
                have one.
              </p>
            </div>
          </div>
        )}

        {showGroupsLayer && (
          <div
            className="absolute inset-0"
            style={{
              transform: isTeacherView ? 'rotate(180deg)' : undefined,
              transformOrigin: 'center center',
            }}
          >
            <SeatingCanvasDecor
              showGrid={showGrid}
              showObjects={showObjects}
              layoutOrientation={layoutOrientation}
              isTeacherView={isTeacherView}
              borderClassName="border-gray-800"
            />
            <SeatingGroupsCanvas
              isTeacherView={isTeacherView}
              isMultiSelectMode={isMultiSelectMode}
              selectedStudentIds={selectedStudentIds}
              onSelectStudent={onSelectStudent}
            />
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
        title="Delete Layout"
        message={`Are you sure you want to delete "${layoutToDelete?.name}"? This action cannot be undone and will permanently delete the layout, all groups, and student seat assignments.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="red"
        icon={
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
        }
      />

      <CreateLayoutModal isOpen={isCreateModalOpen} onClose={onCloseCreateModal} onCreateLayout={onCreateLayout} />

      <EditLayoutModal
        isOpen={isEditLayoutModalOpen && layoutToEdit !== null}
        onClose={onCloseEditModal}
        currentName={layoutToEdit?.name ?? ''}
        onSave={onSaveLayoutEdit}
      />
    </div>
  );
}
