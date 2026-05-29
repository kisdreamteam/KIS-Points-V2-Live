'use client';

import type { Student } from '@/lib/types';
import {
  broadcastStudentPointsUpdate,
  type StudentPointsBroadcastPayload,
} from '@/features/dashboard/lib/api/points';
import { fetchStudentsByClassId } from '@/features/students/lib/api/students';
import { useDashboardStore } from '@/features/dashboard/stores/useDashboardStore';

const studentsByClassCache = new Map<string, Student[]>();

/** Copies the current in-memory roster into the module cache so `refreshDashboardStudents(false)` cannot restore stale points. */
export function syncStudentsByClassCacheFromStore(): void {
  const { activeClassId, students } = useDashboardStore.getState();
  if (!activeClassId || students.length === 0) return;
  if (!students.every((s) => s.class_id === activeClassId)) return;
  studentsByClassCache.set(activeClassId, students.map((s) => ({ ...s })));
}

export function invalidateStudentsCacheForClass(classId: string): void {
  studentsByClassCache.delete(classId);
}

/** Invalidate roster cache for a class and refetch into the store when that class is currently active. */
export async function refreshDashboardRosterIfActive(classId: string): Promise<void> {
  invalidateStudentsCacheForClass(classId);
  const { activeClassId } = useDashboardStore.getState();
  if (activeClassId === classId) {
    await refreshDashboardStudents(true);
  }
}

export async function refreshDashboardStudents(force = false): Promise<void> {
  const { activeClassId, setStudents, setLoadingStudents } = useDashboardStore.getState();
  if (!activeClassId) {
    setStudents([]);
    setLoadingStudents(false);
    return;
  }

  const cached = studentsByClassCache.get(activeClassId);
  if (!force && cached) {
    setStudents(cached);
    setLoadingStudents(false);
    return;
  }

  try {
    setLoadingStudents(true);
    const next = await fetchStudentsByClassId(activeClassId);
    studentsByClassCache.set(activeClassId, next);
    setStudents(next);
  } catch (err) {
    console.error('Unexpected error fetching students:', err);
    setStudents([]);
  } finally {
    setLoadingStudents(false);
  }
}

/** Broadcast current in-memory point totals so other tabs stay in sync after a local award. */
export function broadcastStudentPointsFromStore(classId: string, studentIds: string[]): void {
  if (!classId || studentIds.length === 0) return;
  const idSet = new Set(studentIds);
  const updates = useDashboardStore
    .getState()
    .students.filter((s) => idSet.has(s.id))
    .map((s) => ({ studentId: s.id, points: s.points ?? 0 }));
  if (updates.length === 0) return;
  void broadcastStudentPointsUpdate({
    classId,
    emittedAt: Date.now(),
    updates,
  }).catch((err) => {
    console.warn('Failed to broadcast student points update:', err);
  });
}

export type { StudentPointsBroadcastPayload };
