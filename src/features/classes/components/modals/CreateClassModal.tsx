'use client';

import Modal from '@/components/ui/modals/Modal';
import CreateClassForm, { type CreateClassFormValues } from '@/features/classes/components/forms/CreateClassForm';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateClassFormValues) => void | Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export default function CreateClassModal({ isOpen, onClose, onSubmit, isLoading, error }: CreateClassModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <CreateClassForm onClose={onClose} onSubmit={onSubmit} isLoading={isLoading} error={error} />
    </Modal>
  );
}
