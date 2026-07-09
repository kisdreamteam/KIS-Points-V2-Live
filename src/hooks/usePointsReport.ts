'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { listPointCategoriesByClassIds } from '@/features/dashboard/lib/api/points';
import {
  buildConsolidatedCategoryCatalog,
  listStudentCategoryPointTotals,
  resolveCategoryIdsForNameKeys,
  type ConsolidatedCategoryOption,
} from '@/features/dashboard/lib/api/pointsReport';
import { useDashboardStore } from '@/features/dashboard/stores/useDashboardStore';
import type { Student } from '@/lib/types';

export type PointsReportRow = {
  studentId: string;
  studentNumber: number | null;
  firstName: string;
  lastName: string;
  gender: string | null;
  points: number;
};

function sortStudentsByNumber(students: Student[]): Student[] {
  return [...students].sort((a, b) => {
    if (a.student_number === null && b.student_number === null) return 0;
    if (a.student_number === null) return 1;
    if (b.student_number === null) return -1;
    return a.student_number - b.student_number;
  });
}

export function usePointsReport(classId: string | undefined) {
  const students = useDashboardStore(useShallow((s) => s.students));

  const [isPointsReportOpen, setIsPointsReportOpen] = useState(false);
  const [selectedNameKeys, setSelectedNameKeys] = useState<string[]>([]);
  const [categoryCatalog, setCategoryCatalog] = useState<ConsolidatedCategoryOption[]>([]);
  const [filteredPointsByStudentId, setFilteredPointsByStudentId] = useState<Map<string, number>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFiltered = selectedNameKeys.length > 0;

  const fetchCategoryCatalog = useCallback(async () => {
    if (!classId) return;
    try {
      const categories = await listPointCategoriesByClassIds([classId]);
      setCategoryCatalog(buildConsolidatedCategoryCatalog(categories));
    } catch (err) {
      console.error('Unexpected error fetching category catalog:', err);
      setError('Failed to load point categories.');
      setCategoryCatalog([]);
    }
  }, [classId]);

  const fetchFilteredTotals = useCallback(async () => {
    if (!classId || selectedNameKeys.length === 0) {
      setFilteredPointsByStudentId(new Map());
      return;
    }

    const studentIds = students.map((s) => s.id);
    if (studentIds.length === 0) {
      setFilteredPointsByStudentId(new Map());
      return;
    }

    const categoryIds = resolveCategoryIdsForNameKeys(categoryCatalog, selectedNameKeys);
    if (categoryIds.length === 0) {
      setFilteredPointsByStudentId(new Map());
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const totals = await listStudentCategoryPointTotals({ studentIds, categoryIds });
      setFilteredPointsByStudentId(totals);
    } catch (err) {
      console.error('Unexpected error fetching filtered point totals:', err);
      setError('Failed to load filtered points.');
      setFilteredPointsByStudentId(new Map());
    } finally {
      setIsLoading(false);
    }
  }, [classId, categoryCatalog, selectedNameKeys, students]);

  useEffect(() => {
    if (!isPointsReportOpen) return;
    void fetchCategoryCatalog();
  }, [isPointsReportOpen, fetchCategoryCatalog]);

  useEffect(() => {
    if (!isPointsReportOpen) return;
    if (!isFiltered) {
      setFilteredPointsByStudentId(new Map());
      setIsLoading(false);
      return;
    }
    void fetchFilteredTotals();
  }, [isPointsReportOpen, isFiltered, fetchFilteredTotals]);

  const reportRows = useMemo((): PointsReportRow[] => {
    return sortStudentsByNumber(students).map((student) => ({
      studentId: student.id,
      studentNumber: student.student_number,
      firstName: student.first_name ?? '',
      lastName: student.last_name ?? '',
      gender: student.gender,
      points: isFiltered
        ? filteredPointsByStudentId.get(student.id) ?? 0
        : student.points ?? 0,
    }));
  }, [students, isFiltered, filteredPointsByStudentId]);

  const selectedCategoryLabels = useMemo(() => {
    const keySet = new Set(selectedNameKeys);
    return categoryCatalog
      .filter((option) => keySet.has(option.nameKey))
      .map((option) => option.displayName);
  }, [categoryCatalog, selectedNameKeys]);

  const selectTotalMode = useCallback(() => {
    setSelectedNameKeys([]);
    setError(null);
  }, []);

  const applyCategoryFilter = useCallback((nameKeys: string[]) => {
    setSelectedNameKeys(nameKeys);
    setError(null);
  }, []);

  const removeCategoryFilter = useCallback((nameKey: string) => {
    setSelectedNameKeys((prev) => prev.filter((key) => key !== nameKey));
  }, []);

  return {
    isPointsReportOpen,
    setIsPointsReportOpen,
    selectedNameKeys,
    categoryCatalog,
    isFiltered,
    isLoading,
    error,
    reportRows,
    selectedCategoryLabels,
    selectTotalMode,
    applyCategoryFilter,
    removeCategoryFilter,
  };
}
