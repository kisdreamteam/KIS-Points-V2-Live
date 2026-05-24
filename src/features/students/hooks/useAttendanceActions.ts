'use client';

import { useCallback } from 'react';
import { logAbsence, removeAbsence } from '@/lib/api/attendanceService';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useUserStore } from '@/stores/useUserStore';

export function useAttendanceActions() {
  const toggleAttendance = useCallback(async (studentId: string) => {
    const classId = useDashboardStore.getState().activeClassId;
    const teacherId = useUserStore.getState().teacherProfile?.id;
    if (!classId || !teacherId) return;

    const { absentStudentIds, setAbsentStudentIds } = useDashboardStore.getState();
    const previous = absentStudentIds;
    const isAbsent = previous.includes(studentId);
    const next = isAbsent
      ? previous.filter((id) => id !== studentId)
      : [...previous, studentId];

    setAbsentStudentIds(next);

    try {
      if (isAbsent) {
        await removeAbsence(studentId);
      } else {
        await logAbsence(studentId, classId, teacherId);
      }
    } catch {
      setAbsentStudentIds(previous);
    }
  }, []);

  return { toggleAttendance };
}
