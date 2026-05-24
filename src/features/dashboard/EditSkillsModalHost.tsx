'use client';

import EditSkillsModal from '@/features/dashboard/components/modals/EditSkillsModal';
import type { EditSkillsModalProps } from '@/features/dashboard/components/modals/EditSkillsModal';
import { useEditSkillsModalController } from '@/features/dashboard/hooks/useEditSkillsModalController';

export default function EditSkillsModalHost(props: EditSkillsModalProps) {
  const viewProps = useEditSkillsModalController(props);
  return <EditSkillsModal {...viewProps} />;
}
