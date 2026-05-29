'use client';

import { useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useDashboardStore } from '@/features/dashboard/stores/useDashboardStore';
import { useAwardConfirmationModal, type AwardPointsInfo } from '@/features/dashboard/hooks/useAwardConfirmationModal';
import { useModalStore } from '@/stores/useModalStore';
import { useDashboardStudentModalActions } from '@/features/dashboard/hooks/useDashboardStudentModalActions';
import {
  emitMultiStudentAwardComplete,
  emitSeatingStudentPointsDelta,
} from '@/lib/events/students';
import { normalizeClassIconPath } from '@/lib/iconUtils';
import AddStudentsModal from '@/features/students/components/modals/AddStudentsModal';
import AwardPointsModalHost from '@/features/dashboard/AwardPointsModalHost';
import EditStudentModal from '@/features/students/components/modals/EditStudentModal';
import PointsAwardedConfirmationModal from '@/features/dashboard/components/modals/PointsAwardedConfirmationModal';

export default function DashboardClassModalsHost() {
  const pathname = usePathname();
  const currentClassId = pathname?.match(/\/dashboard\/classes\/([^/]+)/)?.[1] ?? null;
  const students = useDashboardStore((s) => s.students);
  const classes = useDashboardStore((s) => s.classes);

  const modalType = useModalStore((s) => s.modalType);
  const isModalOpen = useModalStore((s) => s.isOpen);
  const selectedStudentId = useModalStore((s) => s.selectedStudentId);
  const awardTargetStudentIds = useModalStore((s) => s.awardTargetStudentIds);
  const closeModal = useModalStore((s) => s.closeModal);

  const {
    awardInfo,
    isConfirmationModalOpen,
    openAwardConfirmation,
    closeAwardConfirmation,
  } = useAwardConfirmationModal();
  const {
    isAddingStudents,
    addStudentsError,
    nextStudentNumber,
    handleStudentAdded,
    handleAddStudentsSubmit,
    handleSubmitEditStudent,
  } = useDashboardStudentModalActions({
    currentClassId,
    isModalOpen,
    modalType,
    closeModal,
  });

  const currentClass = useMemo(
    () => (currentClassId ? classes.find((c) => c.id === currentClassId) ?? null : null),
    [classes, currentClassId]
  );
  const className = currentClass?.name ?? '';
  const classIconRaw = currentClass?.icon ?? null;
  const classIcon = classIconRaw ? normalizeClassIconPath(classIconRaw) : '';

  const editingStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return students.find((s) => s.id === selectedStudentId) ?? null;
  }, [students, selectedStudentId]);

  const isAwardModal =
    isModalOpen &&
    (modalType === 'award_points_single' ||
      modalType === 'award_points_whole_class' ||
      modalType === 'award_points_multi');


  const handlePointsAwarded = useCallback(
    (info: AwardPointsInfo) => {
      const { modalType: mt, selectedStudentId: sid, awardTargetStudentIds: targetIds } =
        useModalStore.getState();
      const delta = info.pointsDelta;
      let ids: string[] = [];
      if (mt === 'award_points_single' && sid) {
        ids = [sid];
      } else if (mt === 'award_points_multi' && targetIds?.length) {
        ids = targetIds;
      } else if (mt === 'award_points_whole_class') {
        ids = useDashboardStore.getState().students.map((s) => s.id);
      }
      if (currentClassId && ids.length > 0 && Number.isFinite(delta)) {
        emitSeatingStudentPointsDelta({ classId: currentClassId, studentIds: ids, delta });
      }
      openAwardConfirmation(info);
    },
    [currentClassId, openAwardConfirmation]
  );

  const onAwardComplete = useCallback((selectedIds: string[], type: 'classes' | 'students') => {
    if (type === 'students') {
      emitMultiStudentAwardComplete({ studentIds: selectedIds });
    }
  }, []);

  if (!currentClassId) {
    return null;
  }

  return (
    <>
      {isModalOpen && modalType === 'add_students' && (
        <AddStudentsModal
          isOpen
          onClose={closeModal}
          onSubmit={handleAddStudentsSubmit}
          isLoading={isAddingStudents}
          error={addStudentsError}
          nextStudentNumber={nextStudentNumber}
          onStudentAdded={() => void handleStudentAdded()}
        />
      )}

      {isAwardModal && (
        <AwardPointsModalHost
          isOpen
          onClose={closeModal}
          student={
            modalType === 'award_points_single' && selectedStudentId
              ? students.find((s) => s.id === selectedStudentId) ?? null
              : null
          }
          classId={currentClassId}
          className={modalType === 'award_points_whole_class' ? className : undefined}
          classIcon={modalType === 'award_points_whole_class' ? classIcon : undefined}
          skipRefreshAfterAward
          onPointsAwarded={handlePointsAwarded}
          selectedStudentIds={
            modalType === 'award_points_multi' && awardTargetStudentIds?.length
              ? awardTargetStudentIds
              : undefined
          }
          onAwardComplete={onAwardComplete}
        />
      )}

      {isModalOpen && modalType === 'edit_student' && (
        <EditStudentModal
          isOpen
          onClose={closeModal}
          student={editingStudent}
          onSubmit={handleSubmitEditStudent}
        />
      )}

      {awardInfo && (
        <PointsAwardedConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={closeAwardConfirmation}
          studentAvatar={awardInfo.studentAvatar}
          studentFirstName={awardInfo.studentFirstName}
          pointsDelta={awardInfo.pointsDelta}
          categoryName={awardInfo.categoryName}
          categoryIcon={awardInfo.categoryIcon}
        />
      )}
    </>
  );
}
