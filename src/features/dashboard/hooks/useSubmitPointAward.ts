import { useCallback, useMemo, useState } from 'react';
import type { PointCategory, Student } from '@/lib/types';
import {
  filterEligibleStudentIds,
  getAwardMode,
  resolveAwardTargetStudentIds,
  type AwardTargetContext,
  type AwardMode,
} from '@/features/dashboard/lib/awardPointsTargets';
import { awardCustomPointsToStudents, awardPointsToStudents, getAuthenticatedUserId } from '@/features/dashboard/lib/api/points';
import {
  broadcastStudentPointsFromStore,
  syncStudentsByClassCacheFromStore,
} from '@/features/dashboard/hooks/sync/dashboardStudentRefresh';
import { useDashboardStore } from '@/features/dashboard/stores/useDashboardStore';

interface UseSubmitPointAwardParams {
  context: AwardTargetContext;
  student: Student | null;
  className?: string;
  classIcon?: string;
  onRefresh?: () => void;
  onPointsAwarded?: (awardInfo: {
    studentAvatar: string;
    studentFirstName: string;
    pointsDelta: number;
    categoryName: string;
    categoryIcon?: string;
  }) => void;
  onAwardComplete?: (selectedIds: string[], type: 'classes' | 'students') => void;
  onClose: () => void;
  /** When true, do not call `onRefresh` after a successful award (dashboard roster already updated optimistically). */
  skipRefreshAfterAward?: boolean;
}

export function useSubmitPointAward({
  context,
  student,
  className,
  classIcon,
  onRefresh,
  onPointsAwarded,
  onAwardComplete,
  onClose,
  skipRefreshAfterAward = false,
}: UseSubmitPointAwardParams) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode = useMemo<AwardMode>(() => getAwardMode(context), [context]);

  const toEligibleStudentIds = useCallback(
    (studentIds: string[]) => filterEligibleStudentIds(studentIds),
    []
  );

  const afterAwardSuccess = useCallback(
    (pointsValue: number, categoryName: string, categoryIcon?: string) => {
      if (mode === 'multiClass' && context.selectedClassIds && onAwardComplete) {
        onAwardComplete(context.selectedClassIds, 'classes');
      }
      if (mode === 'multiStudent' && context.selectedStudentIds && onAwardComplete) {
        onAwardComplete(context.selectedStudentIds, 'students');
      }

      if (onRefresh && !skipRefreshAfterAward) {
        onRefresh();
      }

      if (onPointsAwarded) {
        if (mode === 'multiStudent' && context.selectedStudentIds) {
          onPointsAwarded({
            studentAvatar: classIcon || '/images/dashboard/student-avatars/avatar-01.png',
            studentFirstName: `${context.selectedStudentIds.length} ${
              context.selectedStudentIds.length === 1 ? 'Student' : 'Students'
            }`,
            pointsDelta: pointsValue,
            categoryName,
            categoryIcon,
          });
        } else if (mode === 'wholeClass') {
          onPointsAwarded({
            studentAvatar: classIcon || '/images/dashboard/student-avatars/avatar-01.png',
            studentFirstName: className || 'Whole Class',
            pointsDelta: pointsValue,
            categoryName,
            categoryIcon,
          });
        } else if (student) {
          onPointsAwarded({
            studentAvatar: student.avatar || '/images/dashboard/student-avatars/avatar-01.png',
            studentFirstName: student.first_name,
            pointsDelta: pointsValue,
            categoryName,
            categoryIcon,
          });
        }
      }

      onClose();
    },
    [
      mode,
      context.selectedClassIds,
      context.selectedStudentIds,
      onAwardComplete,
      onRefresh,
      onPointsAwarded,
      classIcon,
      className,
      student,
      onClose,
      skipRefreshAfterAward,
    ]
  );

  const awardSkill = useCallback(
    async (category: PointCategory) => {
      setIsSubmitting(true);
      setError(null);
      const points = category.points ?? category.default_points ?? 0;
      try {
        const studentIds = await resolveAwardTargetStudentIds(context);
        const eligibleStudentIds =
          mode === 'wholeClass' || mode === 'multiClass'
            ? toEligibleStudentIds(studentIds)
            : studentIds;
        if (eligibleStudentIds.length === 0) {
          alert('No present students found for the current selection.');
          return false;
        }

        const { applyPointsDelta } = useDashboardStore.getState();
        applyPointsDelta(eligibleStudentIds, points);
        syncStudentsByClassCacheFromStore();

        try {
          await awardPointsToStudents({
            studentIds: eligibleStudentIds,
            categoryId: category.id,
            points,
            memo: '',
          });
        } catch (apiErr) {
          applyPointsDelta(eligibleStudentIds, -points);
          syncStudentsByClassCacheFromStore();
          throw apiErr;
        }

        broadcastStudentPointsFromStore(context.classId, eligibleStudentIds);
        afterAwardSuccess(points, category.name, category.icon);
        return true;
      } catch (err) {
        console.error('Unexpected error awarding points:', err);
        setError('Failed to award points. Please try again.');
        alert('Failed to award points. Please try again.');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [afterAwardSuccess, context, mode, toEligibleStudentIds]
  );

  const awardCustom = useCallback(
    async (customPoints: number, customMemo: string) => {
      if (customPoints === 0 || customPoints === null || customPoints === undefined || isNaN(customPoints)) {
        alert('Please enter a valid point value (positive or negative, but not zero).');
        return false;
      }

      setIsSubmitting(true);
      setError(null);
      try {
        const teacherId = await getAuthenticatedUserId();
        if (!teacherId) {
          alert('You must be logged in to award custom points.');
          return false;
        }

        const studentIds = await resolveAwardTargetStudentIds(context);
        const eligibleStudentIds =
          mode === 'wholeClass' || mode === 'multiClass'
            ? toEligibleStudentIds(studentIds)
            : studentIds;
        if (eligibleStudentIds.length === 0) {
          alert('No present students found for the current selection.');
          return false;
        }

        const { applyPointsDelta } = useDashboardStore.getState();
        applyPointsDelta(eligibleStudentIds, customPoints);
        syncStudentsByClassCacheFromStore();

        try {
          await awardCustomPointsToStudents({
            studentIds: eligibleStudentIds,
            teacherId,
            points: customPoints,
            memo: customMemo,
          });
        } catch (apiErr) {
          applyPointsDelta(eligibleStudentIds, -customPoints);
          syncStudentsByClassCacheFromStore();
          throw apiErr;
        }

        broadcastStudentPointsFromStore(context.classId, eligibleStudentIds);
        afterAwardSuccess(customPoints, customMemo || 'Custom Points');
        return true;
      } catch (err) {
        console.error('Unexpected error awarding custom points:', err);
        setError('Failed to award custom points. Please try again.');
        alert('Failed to award custom points. Please try again.');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [afterAwardSuccess, context, mode, toEligibleStudentIds]
  );

  return {
    isSubmitting,
    error,
    awardSkill,
    awardCustom,
  };
}
