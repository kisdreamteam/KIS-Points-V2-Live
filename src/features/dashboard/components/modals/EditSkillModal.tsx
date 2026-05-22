'use client';

import Modal from '@/components/ui/modals/Modal';
import EditSkillForm, { type EditSkillFormSubmitPayload } from '@/features/dashboard/components/forms/EditSkillForm';
import { PointCategory } from '@/lib/types';

interface EditSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: PointCategory | null;
  positiveIcons: string[];
  negativeIcons: string[];
  isPositiveIconsDetecting: boolean;
  onEditSkillSubmit: (values: EditSkillFormSubmitPayload) => Promise<void>;
}

export default function EditSkillModal({
  isOpen,
  onClose,
  skill,
  positiveIcons,
  negativeIcons,
  isPositiveIconsDetecting,
  onEditSkillSubmit,
}: EditSkillModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <EditSkillForm
        isOpen={isOpen}
        onClose={onClose}
        skill={skill}
        positiveIcons={positiveIcons}
        negativeIcons={negativeIcons}
        isPositiveIconsDetecting={isPositiveIconsDetecting}
        onSubmit={onEditSkillSubmit}
      />
    </Modal>
  );
}
