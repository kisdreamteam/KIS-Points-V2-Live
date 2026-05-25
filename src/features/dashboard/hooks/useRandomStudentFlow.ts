'use client';

import { useCallback, useState } from 'react';
import type { Student } from '@/lib/types';
import {
  fetchStudentsForRandomByClassId,
  markStudentAsPicked,
  resetPickedStudentsByClassId,
} from '@/features/students/lib/api/students';

export function useRandomStudentFlow() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const fetchStudents = useCallback(async (classId: string, options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    try {
      if (!silent) {
        setIsLoading(true);
      }
      const studentsData = await fetchStudentsForRandomByClassId(classId);
      setStudents(studentsData);
    } catch (err) {
      console.error('Unexpected error fetching students:', err);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const markSelectedStudentAsPicked = useCallback(async (studentId: string) => {
    try {
      await markStudentAsPicked(studentId);
      setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, has_been_picked: true } : s)));
    } catch (error) {
      console.error('Unexpected error marking student as picked:', error);
    }
  }, []);

  const handleResetPickedStudents = useCallback(
    async (classId: string, onAfterReset?: () => void) => {
      if (!classId || isResetting) return;
      try {
        setIsResetting(true);
        await resetPickedStudentsByClassId(classId);
        onAfterReset?.();
        await fetchStudents(classId);
      } catch (error) {
        console.error('Unexpected error resetting picked students:', error);
      } finally {
        setIsResetting(false);
      }
    },
    [fetchStudents, isResetting]
  );

  return {
    students,
    isLoading,
    isResetting,
    fetchStudents,
    markSelectedStudentAsPicked,
    handleResetPickedStudents,
  };
}
