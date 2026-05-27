import type { GroupAssignment, SeatingGroupRecord } from '@/features/seating/lib/api/seating';
import { filterEligibleStudentIds } from '@/features/dashboard/lib/awardPointsService';

export function getStudentIdsForGroup(
  groupId: string,
  groupAssignmentsById: Record<string, GroupAssignment[]>
): string[] {
  const assignments = groupAssignmentsById[groupId] ?? [];
  return assignments.map((a) => a.student.id);
}

export function getPresentStudentIdsForGroup(
  groupId: string,
  groupAssignmentsById: Record<string, GroupAssignment[]>
): string[] {
  return filterEligibleStudentIds(getStudentIdsForGroup(groupId, groupAssignmentsById));
}

export function getAwardableGroupIds(
  groups: SeatingGroupRecord[],
  groupAssignmentsById: Record<string, GroupAssignment[]>
): string[] {
  return groups
    .filter((g) => getPresentStudentIdsForGroup(g.id, groupAssignmentsById).length > 0)
    .map((g) => g.id);
}

export function getStudentIdsForGroups(
  groupIds: string[],
  groupAssignmentsById: Record<string, GroupAssignment[]>
): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const groupId of groupIds) {
    for (const studentId of getStudentIdsForGroup(groupId, groupAssignmentsById)) {
      if (!seen.has(studentId)) {
        seen.add(studentId);
        ids.push(studentId);
      }
    }
  }
  return ids;
}

export function resolveAwardableStudentIds(
  selectedStudentIds: string[],
  selectedGroupIds: string[],
  groupAssignmentsById: Record<string, GroupAssignment[]>
): string[] {
  const fromGroups = getStudentIdsForGroups(selectedGroupIds, groupAssignmentsById);
  const presentFromGroups = filterEligibleStudentIds(fromGroups);
  return [...new Set([...selectedStudentIds, ...presentFromGroups])];
}
