'use client';

import AwardPointsModal from '@/features/dashboard/components/modals/AwardPointsModal';
import type { AwardPointsModalProps } from '@/features/dashboard/components/modals/AwardPointsModal';
import { useAwardPointsModalController } from '@/hooks/useAwardPointsModalController';

export default function AwardPointsModalHost(props: AwardPointsModalProps) {
  const viewProps = useAwardPointsModalController(props);
  return <AwardPointsModal {...viewProps} />;
}
