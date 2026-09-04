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

/** Single dashboard + seating + cache write for a batch of absolute point totals. */
function applyStudentPointsUpdates(updates: StudentPointsUpdate[]): void {
  if (updates.length === 0) return;
  useDashboardStore.getState().applyStudentPointsUpdates(updates);
  useSeatingStore.getState().syncGroupAssignmentStudentPoints(updates);
  syncStudentsByClassCacheFromStore();
}

function applyStudentPointsBroadcast(payload: StudentPointsBroadcastPayload): void {
  applyStudentPointsUpdates(payload.updates);
}

/**
 * Coalesce rapid postgres_changes (one row UPDATE per student) into one store flush
 * on the next microtask so multi-student awards do not N-refresh the roster.
 */
function createRealtimePointsCoalescer(flush: (updates: StudentPointsUpdate[]) => void) {
  const pending = new Map<string, number>();
  let scheduled = false;

  const runFlush = () => {
    scheduled = false;
    if (pending.size === 0) return;
    const updates = Array.from(pending, ([studentId, points]) => ({ studentId, points }));
    pending.clear();
    flush(updates);
  };

  return {
    enqueue(update: StudentPointsUpdate) {
      pending.set(update.studentId, update.points);
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(runFlush);
    },
    flushNow() {
      if (!scheduled && pending.size === 0) return;
      runFlush();
    },
  };
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

    const coalescer = createRealtimePointsCoalescer(applyStudentPointsUpdates);

    const { unsubscribe } = subscribeToStudentPointsSync(activeClassId, {
      onStudentPointsUpdate: (update) => coalescer.enqueue(update),
      onBroadcast: applyStudentPointsBroadcast,
    });

    return () => {
      coalescer.flushNow();
      unsubscribe();
    };
  }, [activeClassId]);

  return null;
}
