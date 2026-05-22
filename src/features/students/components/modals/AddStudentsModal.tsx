'use client';

import Modal from '@/components/ui/modals/Modal';
import AddStudentsForm, { type AddStudentsFormSubmitValues } from '@/features/students/components/forms/AddStudentsForm';

interface AddStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: AddStudentsFormSubmitValues) => void | Promise<void>;
  isLoading: boolean;
  error?: string | null;
  nextStudentNumber?: number | null;
  onStudentAdded: () => void;
}

export default function AddStudentsModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
  nextStudentNumber,
  onStudentAdded,
}: AddStudentsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <AddStudentsForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        isLoading={isLoading}
        error={error}
        nextStudentNumber={nextStudentNumber}
        onStudentAdded={onStudentAdded}
      />
    </Modal>
  );
}
