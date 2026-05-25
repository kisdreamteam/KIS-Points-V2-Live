'use client';

import { filterEligibleStudentIds } from '@/features/dashboard/lib/awardPointsService';
import { useModalStore } from '@/stores/useModalStore';

export function openMultiStudentPointsAward(
  studentIds: string[],
  options?: { excludeAbsent?: boolean }
) {
  const ids = options?.excludeAbsent ? filterEligibleStudentIds(studentIds) : studentIds;
  if (ids.length === 0) {
    alert('No present students in this group to award points to.');
    return;
  }
  useModalStore.getState().openModal('award_points_multi', { studentIds: ids });
}
