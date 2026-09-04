import type { GroupAssignment } from '@/features/seating/lib/api/seating';

export type GroupAssignmentsById = Record<string, GroupAssignment[]>;
export type GroupPositionsById = Record<string, { x: number; y: number }>;

export function getAssignmentsForGroup(
  byId: GroupAssignmentsById,
  groupId: string
): GroupAssignment[] {
  return byId[groupId] ?? [];
}

export function assignmentsMapToRecord(
  map: Map<string, GroupAssignment[]>
): GroupAssignmentsById {
  const out: GroupAssignmentsById = {};
  map.forEach((list, groupId) => {
    out[groupId] = list;
  });
  return out;
}

export function assignmentsRecordToMap(
  record: GroupAssignmentsById
): Map<string, GroupAssignment[]> {
  return new Map(Object.entries(record));
}

export function cloneAssignmentsRecord(source: GroupAssignmentsById): GroupAssignmentsById {
  const clone: GroupAssignmentsById = {};
  for (const [groupId, list] of Object.entries(source)) {
    clone[groupId] = list.map((a) => ({ ...a, student: { ...a.student } }));
  }
  return clone;
}

export function cloneAssignmentsMap(source: Map<string, GroupAssignment[]>): Map<string, GroupAssignment[]> {
  return assignmentsRecordToMap(cloneAssignmentsRecord(assignmentsMapToRecord(source)));
}

export function buildGroupPositionsFromGroups(
  groupsData: Array<{ id: string; position_x?: number; position_y?: number }>,
  prev: GroupPositionsById,
  options?: { preserveLocalPositions?: boolean }
): GroupPositionsById {
  const next: GroupPositionsById = { ...prev };
  groupsData.forEach((group, index) => {
    if (options?.preserveLocalPositions && next[group.id] !== undefined) return;
    if (group.position_x !== undefined && group.position_y !== undefined) {
      next[group.id] = { x: group.position_x, y: group.position_y };
    } else if (next[group.id] === undefined) {
      next[group.id] = { x: 20 + index * 20, y: 20 + index * 100 };
    }
  });
  return next;
}
