'use client';

import { useCallback, useState } from 'react';
import type { CreateClassFormValues } from '@/features/classes/components/forms/CreateClassForm';
import {
  createClassForCurrentUser,
  fetchStudentCountsByClassIds,
  type ClassRecord,
} from '@/lib/api/classes';

type UseClassesWorkspaceActionsParams = {
  onCreateSuccess: () => void;
};

export function useClassesWorkspaceActions({ onCreateSuccess }: UseClassesWorkspaceActionsParams) {
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [createClassError, setCreateClassError] = useState<string | null>(null);

  const fetchStudentCounts = useCallback(async (classes: ClassRecord[]) => {
    try {
      const classIds = classes.map((cls) => cls.id);
      if (classIds.length === 0) {
        setStudentCounts({});
        return;
      }
      const countsMap = await fetchStudentCountsByClassIds(classIds);
      setStudentCounts(countsMap);
    } catch (err) {
      console.error('Error fetching student counts:', err);
    }
  }, []);

  const handleCreateClassSubmit = useCallback(
    async (values: CreateClassFormValues) => {
      setCreateClassError(null);
      setIsCreatingClass(true);
      try {
        await createClassForCurrentUser({
          className: values.className,
          grade: values.grade,
          schoolYear: values.schoolYear,
          icon: values.icon,
        });
        onCreateSuccess();
      } catch (err) {
        console.error('Unexpected error creating class:', err);
        setCreateClassError(err instanceof Error ? err.message : 'Failed to create class. Please try again.');
      } finally {
        setIsCreatingClass(false);
      }
    },
    [onCreateSuccess]
  );

  const clearCreateClassError = useCallback(() => {
    setCreateClassError(null);
  }, []);

  return {
    studentCounts,
    isCreatingClass,
    createClassError,
    fetchStudentCounts,
    handleCreateClassSubmit,
    clearCreateClassError,
  };
}
