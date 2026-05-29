'use client';

import { useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  subscribeToStudentPointsSync,
  type StudentPointsUpdate,
} from '@/features/dashboard/lib/api/points';
import { useDashboardStore } from '@/features/dashboard/stores/useDashboardStore';
import { useSeatingStore } from '@/features/seating/stores/useSeatingStore';
import {
  refreshDashboardStudents,
  syncStudentsByClassCacheFromStore,
  type StudentPointsBroadcastPayload,
} from '@/features/dashboard/hooks/sync/dashboardStudentRefresh';

function rosterInStoreMatchesClass(activeClassId: string): boolean {
  const { students } = useDashboardStore.getState();
  return students.length > 0 && students.every((s) => s.class_id === activeClassId);
}

function applyStudentPointsUpdates(updates: StudentPointsUpdate[]): void {
  if (updates.length === 0) return;
  const { updateStudent } = useDashboardStore.getState();
  for (const { studentId, points } of updates) {
    updateStudent(studentId, { points });
  }
  useSeatingStore.getState().syncGroupAssignmentStudentPoints(updates);
  syncStudentsByClassCacheFromStore();
}

function applyStudentPointsBroadcast(payload: StudentPointsBroadcastPayload): void {
  applyStudentPointsUpdates(payload.updates);
}

/** Mount once under the dashboard layout to sync URL `activeClassId` and load roster into the store. */
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

  useEffect(() => {
    if (!activeClassId) return;

    const { unsubscribe } = subscribeToStudentPointsSync(activeClassId, {
      onStudentPointsUpdate: (update) => applyStudentPointsUpdates([update]),
      onBroadcast: applyStudentPointsBroadcast,
    });

    return unsubscribe;
  }, [activeClassId]);

  return null;
}
