'use client';

import { useCallback, useEffect, useState } from 'react';
import { refreshDashboardStudents } from '@/features/dashboard/hooks/sync/dashboardStudentRefresh';
import type { ModalType } from '@/stores/useModalStore';
import {
  getNextStartingStudentNumber,
  insertStudent,
  insertStudentsBulk,
  updateStudentById,
} from '@/features/students/lib/api/students';
import type { AddStudentsFormSubmitValues } from '@/features/students/components/forms/AddStudentsForm';
import type { EditStudentModalSubmitValues } from '@/features/students/components/modals/EditStudentModal';

type UseDashboardStudentModalActionsParams = {
  currentClassId: string | null;
  isModalOpen: boolean;
  modalType: ModalType;
  closeModal: () => void;
};

export function useDashboardStudentModalActions({
  currentClassId,
  isModalOpen,
  modalType,
  closeModal,
}: UseDashboardStudentModalActionsParams) {
  const [isAddingStudents, setIsAddingStudents] = useState(false);
  const [addStudentsError, setAddStudentsError] = useState<string | null>(null);
  const [nextStudentNumber, setNextStudentNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!(isModalOpen && modalType === 'add_students' && currentClassId)) return;
    void (async () => {
      try {
        const number = await getNextStartingStudentNumber(currentClassId);
        setNextStudentNumber(number);
      } catch {
        setNextStudentNumber(1);
      }
    })();
  }, [isModalOpen, modalType, currentClassId]);

  const handleStudentAdded = useCallback(async () => {
    await refreshDashboardStudents(true);
  }, []);

  const handleAddStudentsSubmit = useCallback(
    async (values: AddStudentsFormSubmitValues) => {
      if (!currentClassId) return;
      setIsAddingStudents(true);
      setAddStudentsError(null);
      try {
        const getRandomAvatar = () => {
          const avatarNumber = Math.floor(Math.random() * 40) + 1;
          const avatarName = `avatar-${String(avatarNumber).padStart(2, '0')}.png`;
          return `/images/dashboard/student-avatars/${avatarName}`;
        };

        if (values.mode === 'single') {
          const parts = values.studentName.split(' ');
          await insertStudent({
            first_name: parts[0],
            last_name: parts.slice(1).join(' '),
            class_id: currentClassId,
            avatar: getRandomAvatar(),
            gender: values.gender,
          });
        } else {
          const lines = values.studentList.split('\n').filter((line) => line.trim() !== '');
          const newStudents = lines.map((line) => {
            let first_name: string;
            let last_name: string;
            if (line.includes(',')) {
              const parts = line.split(',');
              last_name = parts[0].trim();
              first_name = parts[1].trim();
            } else {
              const parts = line.split(' ');
              first_name = parts[0].trim();
              last_name = parts.slice(1).join(' ').trim();
            }
            return { first_name, last_name, class_id: currentClassId, avatar: getRandomAvatar() };
          });
          await insertStudentsBulk(newStudents);
        }
      } catch (err) {
        setAddStudentsError(err instanceof Error ? err.message : 'Failed to add students.');
      } finally {
        setIsAddingStudents(false);
      }
    },
    [currentClassId]
  );

  const handleSubmitEditStudent = useCallback(
    async ({ studentId, ...patch }: EditStudentModalSubmitValues) => {
      await updateStudentById(studentId, patch);
      await refreshDashboardStudents(true);
      closeModal();
    },
    [closeModal]
  );

  return {
    isAddingStudents,
    addStudentsError,
    nextStudentNumber,
    handleStudentAdded,
    handleAddStudentsSubmit,
    handleSubmitEditStudent,
  };
}
