'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Student } from '@/lib/types';
import {
  clampPickCount,
  countPoolByType,
  getEligiblePool,
  getMaxPickCount,
  getPoolPickStats,
  getPoolPickedLabel,
  pickRandomStudent,
  type PickCount,
  type PickerPool,
} from '@/features/dashboard/lib/randomPickerPool';

type UseRandomPickerParams = {
  students: Student[];
  absentStudentIds: string[];
  animatePickRound: (winners: Student[], pool: Student[]) => Promise<void>;
  markSelectedStudentAsPicked: (studentId: string) => Promise<void>;
};

export function useRandomPicker({
  students,
  absentStudentIds,
  animatePickRound,
  markSelectedStudentAsPicked,
}: UseRandomPickerParams) {
  const [pickerPool, setPickerPool] = useState<PickerPool>('all');
  const [pickCount, setPickCount] = useState<PickCount>(1);
  const [pickedThisRound, setPickedThisRound] = useState<Student[]>([]);
  const [isPicking, setIsPicking] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const presentStudents = useMemo(
    () => students.filter((student) => !absentStudentIds.includes(student.id)),
    [students, absentStudentIds]
  );

  const poolPickStats = useMemo(
    () => getPoolPickStats(students, pickerPool, absentStudentIds),
    [students, pickerPool, absentStudentIds]
  );

  const poolPickedLabel = getPoolPickedLabel(pickerPool);

  const poolCounts = useMemo(
    () => countPoolByType(students, absentStudentIds),
    [students, absentStudentIds]
  );

  const eligiblePool = useMemo(
    () => getEligiblePool(students, { pool: pickerPool, absentIds: absentStudentIds }),
    [students, pickerPool, absentStudentIds]
  );

  const remainingInPool = eligiblePool.length;
  const maxPickCount = getMaxPickCount(remainingInPool);

  const allPoolPicked =
    poolPickStats.total > 0 && poolPickStats.picked === poolPickStats.total;

  useEffect(() => {
    setPickCount((current) => clampPickCount(current, remainingInPool));
  }, [remainingInPool]);

  useEffect(() => {
    if (pickerPool === 'boys' && poolCounts.boys === 0) {
      setPickerPool('all');
    } else if (pickerPool === 'girls' && poolCounts.girls === 0) {
      setPickerPool('all');
    }
  }, [pickerPool, poolCounts.boys, poolCounts.girls]);

  const clearRoundSelection = useCallback(() => {
    setPickedThisRound([]);
    setSelectedStudent(null);
  }, []);

  const runPickRound = useCallback(async () => {
    if (isPicking || eligiblePool.length === 0) return;

    setIsPicking(true);
    setPickedThisRound([]);
    setSelectedStudent(null);

    const eligiblePoolAtStart = [...eligiblePool];
    const excludedIds = new Set<string>();
    const winners: Student[] = [];
    const effectivePickCount = Math.min(pickCount, eligiblePoolAtStart.length);

    try {
      for (let i = 0; i < effectivePickCount; i += 1) {
        const pool = getEligiblePool(students, {
          pool: pickerPool,
          absentIds: absentStudentIds,
          excludeIds: excludedIds,
        });

        if (pool.length === 0) break;

        const winner = pickRandomStudent(pool);
        if (!winner) break;

        excludedIds.add(winner.id);
        winners.push(winner);
      }

      if (winners.length === 0) return;

      await animatePickRound(winners, eligiblePoolAtStart);

      setPickedThisRound(winners);
      setSelectedStudent(winners.at(-1) ?? null);

      await Promise.all(winners.map((student) => markSelectedStudentAsPicked(student.id)));
    } catch (error) {
      console.error('Random pick round failed:', error);
    } finally {
      setIsPicking(false);
    }
  }, [
    isPicking,
    eligiblePool,
    pickCount,
    students,
    pickerPool,
    absentStudentIds,
    animatePickRound,
    markSelectedStudentAsPicked,
  ]);

  return {
    pickerPool,
    setPickerPool,
    pickCount,
    setPickCount,
    pickedThisRound,
    isPicking,
    selectedStudent,
    presentStudents,
    poolPickStats,
    poolPickedLabel,
    poolCounts,
    eligiblePool,
    remainingInPool,
    maxPickCount,
    allPoolPicked,
    clearRoundSelection,
    runPickRound,
  };
}
