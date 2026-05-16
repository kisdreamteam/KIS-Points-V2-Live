'use client';

import EditSkillsModal from '@/components/dashboard/modals/EditSkillsModal';
import type { EditSkillsModalProps } from '@/components/dashboard/modals/EditSkillsModal';
import { useEditSkillsModalController } from '@/hooks/useEditSkillsModalController';

export default function EditSkillsModalHost(props: EditSkillsModalProps) {
  const viewProps = useEditSkillsModalController(props);
  return <EditSkillsModal {...viewProps} />;
}
