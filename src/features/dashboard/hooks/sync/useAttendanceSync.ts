'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { fetchDailyAbsences } from '@/lib/api/attendanceService';
import { useDashboardStore } from '@/features/dashboard/stores/useDashboardStore';

export function useAttendanceSync(): void {
  const pathname = usePathname();
  const urlClassId = pathname?.match(/\/dashboard\/classes\/([^/]+)/)?.[1] ?? null;
  const storeClassId = useDashboardStore((s) => s.activeClassId);
  const classId = storeClassId ?? urlClassId;

  useEffect(() => {
    const { setAbsentStudentIds } = useDashboardStore.getState();
    setAbsentStudentIds([]);

    if (!classId) return;

    let cancelled = false;

    void (async () => {
      try {
        const ids = await fetchDailyAbsences(classId);
        if (!cancelled) setAbsentStudentIds(ids);
      } catch (err) {
        console.error('Unexpected error fetching daily absences:', err);
        if (!cancelled) setAbsentStudentIds([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [classId]);
}

export function AttendanceSync() {
  useAttendanceSync();
  return null;
}
