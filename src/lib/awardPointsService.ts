import {
  awardCustomPointsToStudents,
  awardPointsToStudents,
  fetchStudentIdsByClassId,
  fetchStudentIdsByClassIds,
  getAuthenticatedUserId,
} from '@/lib/api/points';
import { useDashboardStore } from '@/features/dashboard/stores/useDashboardStore';

export function filterEligibleStudentIds(targetStudentIds: string[]): string[] {
  const absentStudentIds = useDashboardStore.getState().absentStudentIds;
  return targetStudentIds.filter((id) => !absentStudentIds.includes(id));
}

export type AwardMode = 'singleStudent' | 'wholeClass' | 'multiStudent' | 'multiClass';

export interface AwardTargetContext {
  studentId: string | null;
  classId: string;
  selectedClassIds?: string[];
  selectedStudentIds?: string[];
}

export function getAwardMode(context: AwardTargetContext): AwardMode {
  if (context.selectedClassIds && context.selectedClassIds.length > 0) {
    return 'multiClass';
  }
  if (context.selectedStudentIds && context.selectedStudentIds.length > 0) {
    return 'multiStudent';
  }
  if (context.studentId) {
    return 'singleStudent';
  }
  return 'wholeClass';
}

export async function resolveAwardTargetStudentIds(context: AwardTargetContext): Promise<string[]> {
  const mode = getAwardMode(context);
  if (mode === 'multiClass') {
    const ids = await fetchStudentIdsByClassIds(context.selectedClassIds ?? []);
    return filterEligibleStudentIds(ids);
  }
  if (mode === 'multiStudent') {
    return context.selectedStudentIds ?? [];
  }
  if (mode === 'wholeClass') {
    const ids = await fetchStudentIdsByClassId(context.classId);
    return filterEligibleStudentIds(ids);
  }
  return context.studentId ? [context.studentId] : [];
}

export async function executeCategoryAward(params: {
  context: AwardTargetContext;
  categoryId: string;
  points: number;
  memo?: string;
}): Promise<string[]> {
  const studentIds = await resolveAwardTargetStudentIds(params.context);
  if (studentIds.length === 0) {
    return [];
  }
  await awardPointsToStudents({
    studentIds,
    categoryId: params.categoryId,
    points: params.points,
    memo: params.memo ?? '',
  });
  return studentIds;
}

export async function executeCustomAward(params: {
  context: AwardTargetContext;
  points: number;
  memo?: string;
}): Promise<{ teacherId: string | null; studentIds: string[] }> {
  const teacherId = await getAuthenticatedUserId();
  if (!teacherId) {
    return { teacherId: null, studentIds: [] };
  }

  const studentIds = await resolveAwardTargetStudentIds(params.context);
  if (studentIds.length === 0) {
    return { teacherId, studentIds: [] };
  }

  await awardCustomPointsToStudents({
    studentIds,
    teacherId,
    points: params.points,
    memo: params.memo,
  });

  return { teacherId, studentIds };
}
