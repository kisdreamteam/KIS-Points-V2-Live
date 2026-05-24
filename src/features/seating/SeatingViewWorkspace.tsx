'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal';
import CreateLayoutModal from '@/features/seating/components/modals/CreateLayoutModal';
import EditLayoutModal from '@/features/seating/components/modals/EditLayoutModal';
import PointsLogDrawer from '@/features/dashboard/components/PointsLogDrawer';
import LayoutManagerDrawer from '@/features/seating/components/canvas/LayoutManagerDrawer';
import SeatingCanvasDecor from '@/features/seating/components/canvas/SeatingCanvasDecor';
import SeatingGroupsCanvas from '@/features/seating/SeatingGroupsCanvas';
import SeatingViewWorkspaceToolbar from '@/features/seating/SeatingViewWorkspaceToolbar';
import StageTwoColumnSplit from '@/components/ui/StageTwoColumnSplit';
import { useClassPointLog } from '@/hooks/useClassPointLog';
import { useSeatingLayoutManager } from '@/hooks/useSeatingLayoutManager';
import { useSeatingStore } from '@/stores/useSeatingStore';

type SeatingViewWorkspaceProps = {
  classId: string;
  isMultiSelectMode?: boolean;
  selectedStudentIds?: string[];
  onSelectStudent?: (studentId: string) => void;
};

export default function SeatingViewWorkspace({
  classId,
  isMultiSelectMode = false,
  selectedStudentIds = [],
  onSelectStudent,
}: SeatingViewWorkspaceProps) {
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
    isLayoutManagerOpen,
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
    handleDeleteLayoutFromDrawer,
    handleInlineRenameLayout,
    handleSelectLayoutFromDrawer,
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

  const hasLayouts = layouts.length > 0;
  const showGroupsLayer = hasLayouts && !isLoadingLayouts && !layoutsError;

  return (
    <StageTwoColumnSplit rightRail={<SeatingViewWorkspaceToolbar />}>
      <div className="h-full w-full min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="font-spartan relative w-full h-full min-h-0 bg-brand-purple flex flex-col">
          <PointsLogDrawer
            isOpen={isPointLogOpen}
            position="fixed"
            rightPx={60}
            topPx={3}
            bottomPx={80}
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
          <LayoutManagerDrawer
            isOpen={isLayoutManagerOpen}
            position="fixed"
            rightPx={60}
            topPx={3}
            bottomPx={80}
            zIndex={35}
            layouts={layouts}
            selectedLayoutId={selectedLayoutId}
            onSelectLayout={handleSelectLayoutFromDrawer}
            onRenameLayout={handleInlineRenameLayout}
            onDeleteLayout={handleDeleteLayoutFromDrawer}
          />
          <div className="w-full h-full min-h-0 bg-brand-purple relative overflow-hidden flex-1">
            <div className="h-full min-h-0 relative" style={{ zIndex: 1 }}>
              <div className="h-full min-h-0 flex flex-col relative">
                <div
                  className="bg-brand-cream pt-2 h-full w-full min-h-0 relative flex-1 overflow-auto"
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
                        onClick={retryLayouts}
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
                          Click the + button (top right) to create a new layout, or the pencil to open the Seating Editor
                          after you have one.
                        </p>
                      </div>
                    </div>
                  )}

                  {showGroupsLayer && (
                    <div
                      className="relative h-full min-h-0"
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
              </div>
            </div>
          </div>

          <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setLayoutToDelete(null);
            }}
            onConfirm={handleDeleteConfirmed}
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

          <CreateLayoutModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreateLayout={handleCreateLayout}
          />

          <EditLayoutModal
            isOpen={isEditLayoutModalOpen && layoutToEdit !== null}
            onClose={() => {
              setIsEditLayoutModalOpen(false);
              setLayoutToEdit(null);
            }}
            currentName={layoutToEdit?.name ?? ''}
            onSave={handleEditLayoutSave}
          />
          </div>
        </div>
      </div>
    </StageTwoColumnSplit>
  );
}
