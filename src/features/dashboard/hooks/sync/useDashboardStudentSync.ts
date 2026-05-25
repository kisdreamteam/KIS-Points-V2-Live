'use client';

import { useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { Student } from '@/lib/types';
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

function rosterInStoreMatchesClass(activeClassId: string): boolean {
  const { students } = useDashboardStore.getState();
  return students.length > 0 && students.every((s) => s.class_id === activeClassId);
}

/** Mount once under the dashboard layout to sync URL ??`activeClassId` and load roster into the store. */
export function DashboardStudentSync() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const id = pathname?.match(/\/dashboard\/classes\/([^/]+)/)?.[1] ?? null;
    useDashboardStore.getState().setActiveClassId(id);
  }, [pathname]);

  const activeClassId = useDashboardStore((s) => s.activeClassId);

  useEffect(() => {
    if (!activeClassId) {
      void refreshDashboardStudents(false);
      return;
    }
    if (rosterInStoreMatchesClass(activeClassId)) {
      return;
    }
    void refreshDashboardStudents(false);
  }, [activeClassId]);

  return null;
}
