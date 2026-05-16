'use client';

import AwardPointsModal from '@/components/dashboard/modals/AwardPointsModal';
import type { AwardPointsModalProps } from '@/components/dashboard/modals/AwardPointsModal';
import { useAwardPointsModalController } from '@/hooks/useAwardPointsModalController';

export default function AwardPointsModalHost(props: AwardPointsModalProps) {
  const viewProps = useAwardPointsModalController(props);
  return <AwardPointsModal {...viewProps} />;
}
