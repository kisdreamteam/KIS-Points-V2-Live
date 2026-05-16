'use client';

import Modal from '@/components/ui/modals/Modal';
import AddSkillForm, { type AddSkillFormSubmitValues } from '@/components/dashboard/forms/AddSkillForm';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  onSubmit: (values: AddSkillFormSubmitValues) => Promise<void>;
  skillType?: 'positive' | 'negative';
  positiveIcons: string[];
  negativeIcons: string[];
  isPositiveIconsDetecting: boolean;
}

export default function AddSkillModal({
  isOpen,
  onClose,
  classId,
  onSubmit,
  skillType = 'positive',
  positiveIcons,
  negativeIcons,
  isPositiveIconsDetecting,
}: AddSkillModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <AddSkillForm
        isOpen={isOpen}
        onClose={onClose}
        classId={classId}
        onSubmit={onSubmit}
        skillType={skillType}
        positiveIcons={positiveIcons}
        negativeIcons={negativeIcons}
        isPositiveIconsDetecting={isPositiveIconsDetecting}
      />
    </Modal>
  );
}
