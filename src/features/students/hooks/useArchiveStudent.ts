'use client';

import { useCallback, useState } from 'react';
import { archiveStudentById } from '@/lib/api/students';
import { deleteStudentSeatAssignmentsByStudentId } from '@/lib/api/seating';
import {
  invalidateStudentsCacheForClass,
  refreshDashboardStudents,
} from '@/features/dashboard/hooks/sync/useDashboardStudentSync';
import { refreshSeatingGroupsForLayout } from '@/features/dashboard/hooks/sync/useSeatingChartDataSync';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useSeatingStore } from '@/stores/useSeatingStore';
import { useModalStore } from '@/stores/useModalStore';

type ArchiveStudentOptions = {
  onRemoveFromSelection?: (studentId: string) => void;
};

export function useArchiveStudent(classId: string, options: ArchiveStudentOptions = {}) {
  const [isArchiving, setIsArchiving] = useState(false);

  const archiveStudent = useCallback(
    async (studentId: string, _studentName: string) => {
      if (isArchiving) return;
      setIsArchiving(true);

      const { students, setStudents } = useDashboardStore.getState();
      const previousStudents = students;

      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      useSeatingStore.getState().removeStudentFromSeatingState(studentId);
      options.onRemoveFromSelection?.(studentId);

      const modalState = useModalStore.getState();
      if (modalState.selectedStudentId === studentId) {
        modalState.closeModal();
      }

      try {
        await archiveStudentById(studentId);
        await deleteStudentSeatAssignmentsByStudentId(studentId);

        invalidateStudentsCacheForClass(classId);
        await refreshDashboardStudents(true);

        const selectedLayoutId = useSeatingStore.getState().selectedLayoutId;
        if (selectedLayoutId) {
          await refreshSeatingGroupsForLayout(selectedLayoutId);
        }
      } catch (err) {
        console.error('Error archiving student:', err);
        setStudents(previousStudents);
        invalidateStudentsCacheForClass(classId);
        await refreshDashboardStudents(true);
        const selectedLayoutId = useSeatingStore.getState().selectedLayoutId;
        if (selectedLayoutId) {
          await refreshSeatingGroupsForLayout(selectedLayoutId);
        }
        alert('Failed to remove student. Please try again.');
      } finally {
        setIsArchiving(false);
      }
    },
    [classId, isArchiving, options.onRemoveFromSelection]
  );

  return { archiveStudent, isArchiving };
}
