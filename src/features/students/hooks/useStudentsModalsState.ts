import { useCallback, useState } from 'react';
import { useModalStore } from '@/stores/useModalStore';
import { useDashboardStore } from '@/features/dashboard/stores/useDashboardStore';

type UseStudentsModalsStateOptions = {
  onRequestDeleteStudent?: (studentId: string, studentName: string) => void;
};

export function useStudentsModalsState(options: UseStudentsModalsStateOptions = {}) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const toggleDropdown = useCallback((studentId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenDropdownId((prev) => (prev === studentId ? null : studentId));
  }, []);

  const closeDropdown = useCallback(() => setOpenDropdownId(null), []);

  const handleEditStudent = useCallback((studentId: string) => {
    const studentToEdit = useDashboardStore.getState().students.find((s) => s.id === studentId);
    if (studentToEdit) {
      useModalStore.getState().openModal('edit_student', { studentId });
    }
    setOpenDropdownId(null);
  }, []);

  const handleDeleteStudent = useCallback(
    (studentId: string, studentName: string) => {
      setOpenDropdownId(null);
      options.onRequestDeleteStudent?.(studentId, studentName);
    },
    [options.onRequestDeleteStudent]
  );

  const handleStudentClick = useCallback((studentId: string) => {
    useModalStore.getState().openModal('award_points_single', { studentId });
  }, []);

  const handleWholeClassClick = useCallback(() => {
    useModalStore.getState().openModal('award_points_whole_class', {});
  }, []);

  const openAddStudentsModal = useCallback(() => {
    useModalStore.getState().openModal('add_students', {});
  }, []);

  return {
    openDropdownId,
    toggleDropdown,
    closeDropdown,
    handleEditStudent,
    handleDeleteStudent,
    handleStudentClick,
    handleWholeClassClick,
    openAddStudentsModal,
  };
}
