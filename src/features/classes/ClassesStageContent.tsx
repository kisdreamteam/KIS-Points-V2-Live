'use client';

import { useState, useEffect } from 'react';
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal';
import CreateClassModal from '@/features/classes/components/modals/CreateClassModal';
import EditClassModal from '@/features/classes/components/modals/EditClassModal';
import ClassesGridBranch from './ClassesGridBranch';
import { refreshDashboardClassesForUserAction } from '@/hooks/sync/useDashboardClassesSync';
import { useClassesWorkspaceActions } from '@/hooks/useClassesWorkspaceActions';
import type { ClassRecord } from '@/lib/api/classes';

type ClassesStageContentProps = {
  classes: ClassRecord[];
  isLoadingClasses: boolean;
  hasAccessibleClasses: boolean;
  viewMode: 'active' | 'archived';
  onArchiveClassAction: (params: { classId: string; isArchivedView: boolean }) => Promise<void>;
  onDeleteClassAction: (params: { classId: string }) => Promise<void>;
};

export default function ClassesStageContent({
  classes,
  isLoadingClasses,
  hasAccessibleClasses,
  viewMode,
  onArchiveClassAction,
  onDeleteClassAction,
}: ClassesStageContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveClassId, setArchiveClassId] = useState<string | null>(null);
  const [archiveClassName, setArchiveClassName] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteClassId, setDeleteClassId] = useState<string | null>(null);
  const [deleteClassName, setDeleteClassName] = useState<string>('');
  const {
    studentCounts,
    isCreatingClass,
    createClassError,
    fetchStudentCounts,
    handleCreateClassSubmit,
    clearCreateClassError,
  } = useClassesWorkspaceActions({
    onCreateSuccess: () => {
      setIsModalOpen(false);
      void refreshDashboardClassesForUserAction();
    },
  });

  const isArchivedView = viewMode === 'archived';
  const classOwnerMap = new Map(classes.map((cls) => [cls.id, cls.is_owner !== false]));
  const showInitialClassesLoading = isLoadingClasses && !hasAccessibleClasses;

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };

    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdownId]);

  useEffect(() => {
    void fetchStudentCounts(classes);
  }, [classes, fetchStudentCounts]);

  const handleModalClose = () => {
    clearCreateClassError();
    setIsModalOpen(false);
    void refreshDashboardClassesForUserAction();
  };

  const toggleDropdown = (classId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenDropdownId(openDropdownId === classId ? null : classId);
  };

  const handleArchiveClass = (classId: string, className: string) => {
    if (!classOwnerMap.get(classId)) {
      alert('Only the primary class owner can archive or unarchive this class.');
      return;
    }
    setArchiveClassId(classId);
    setArchiveClassName(className);
    setIsArchiveModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleConfirmArchive = async () => {
    if (!archiveClassId) return;

    try {
      await onArchiveClassAction({ classId: archiveClassId, isArchivedView });
    } catch (err) {
      console.error(`Error ${isArchivedView ? 'unarchiving' : 'archiving'} class:`, err);
      alert(`Failed to ${isArchivedView ? 'unarchive' : 'archive'} class. Please try again.`);
    } finally {
      setIsArchiveModalOpen(false);
      setArchiveClassId(null);
      setArchiveClassName('');
    }
  };

  const handleEditClass = (classId: string) => {
    setOpenDropdownId(null);
    setSelectedClassId(classId);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedClassId(null);
    void refreshDashboardClassesForUserAction();
  };

  const handleDeleteClass = (classId: string, className: string) => {
    if (!classOwnerMap.get(classId)) {
      alert('Only the primary class owner can delete this class.');
      return;
    }
    setDeleteClassId(classId);
    setDeleteClassName(className);
    setIsDeleteModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteClassId) return;

    try {
      await onDeleteClassAction({ classId: deleteClassId });
    } catch (err) {
      console.error('Error deleting class:', err);
      alert('Failed to delete class. Please try again.');
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteClassId(null);
      setDeleteClassName('');
    }
  };

  return (
    <div className="h-full min-h-0 w-full min-w-0">
      <ClassesGridBranch
        classes={classes}
        studentCounts={studentCounts}
        openDropdownId={openDropdownId}
        isArchivedView={isArchivedView}
        showInitialClassesLoading={showInitialClassesLoading}
        onToggleDropdown={toggleDropdown}
        onEdit={handleEditClass}
        onArchive={handleArchiveClass}
        onAddClass={() => !isArchivedView && setIsModalOpen(true)}
        onDelete={isArchivedView ? handleDeleteClass : undefined}
      />

      {!isArchivedView && (
        <CreateClassModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleCreateClassSubmit}
          isLoading={isCreatingClass}
          error={createClassError}
        />
      )}

      {selectedClassId && (
        <EditClassModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          classId={selectedClassId}
          onRefresh={refreshDashboardClassesForUserAction}
        />
      )}

      <ConfirmationModal
        isOpen={isArchiveModalOpen}
        onClose={() => {
          setIsArchiveModalOpen(false);
          setArchiveClassId(null);
          setArchiveClassName('');
        }}
        onConfirm={handleConfirmArchive}
        title={isArchivedView ? 'Unarchive Class' : 'Archive Class'}
        message={
          isArchivedView
            ? `Are you sure you want to unarchive "${archiveClassName}"? This class will be restored to your main dashboard.`
            : `Are you sure you want to archive "${archiveClassName}"? This class will be moved to your archived classes and removed from the main dashboard.`
        }
        confirmText={isArchivedView ? 'Unarchive' : 'Archive'}
        cancelText="Cancel"
        confirmButtonColor={isArchivedView ? 'green' : 'purple'}
        icon={
          <svg
            className={`w-6 h-6 ${isArchivedView ? 'text-green-600' : 'text-purple-600'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isArchivedView ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6m0 0l6-6m-6 6V3" />
            )}
          </svg>
        }
      />

      {isArchivedView && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeleteClassId(null);
            setDeleteClassName('');
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Class"
          message={`Are you sure you want to permanently delete "${deleteClassName}"? This action cannot be undone and will delete all students in this class.`}
          confirmText="Delete"
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
      )}
    </div>
  );
}
