import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const editorPath = path.join(root, 'src/components/dashboard/SeatingChartEditorView.tsx');
const outPath = path.join(root, 'src/hooks/useSeatingChart.ts');

const lines = fs.readFileSync(editorPath, 'utf8').split(/\r?\n/);

const head = lines.slice(35, 169).join('\n');
const body = lines
  .slice(182, 1831)
  .map((l) => (l.length ? `  ${l}` : l))
  .join('\n');

const preamble = `'use client';

/**
 * Seating chart **editor** controller (Layer 1 integration).
 * Distinct from \`useSeatingStore\` (sidebar selection / unseated list for the editor).
 */

import { useState, useEffect, useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { Student } from '@/lib/types';
import {
  createSeatingLayout,
  deleteAssignmentsForGroupsSequential,
  deleteSeatingGroupsSequential,
  deleteStudentSeatAssignmentsForGroupIds,
  deleteStudentSeatAssignmentsForSeatingGroupId,
  deleteTeamAssignmentsAndGroup,
  fetchLayoutViewSettings,
  fetchSeatingGroupsWithAssignments,
  fetchSeatingLayoutsByClassId,
  insertSeatingGroup,
  insertSeatingGroups,
  insertStudentSeatAssignments,
  insertStudentSeatAssignmentsBatched,
  renumberSeatIndicesForGroup as renumberSeatIndicesForGroupApi,
  subscribeToSeatingChartRowUpdates,
  updateSeatingGroupFields,
  updateSeatingGroupsLayoutBatch,
} from '@/features/seating/lib/api/seating';
import type { GroupAssignment } from '@/features/seating/lib/api/seating';
import { getCoordinates, getNextIndex, getSlotIndex } from '@/features/seating/lib/seatingLogic';
import { STUDENT_EVENTS, emitSeatingEditMode } from '@/lib/events/students';

`;

let headFixed = head.replace(
  /\/\*\* Per-group assignment with seat_index for fixed-slot grid\. \*\/\r?\ntype GroupAssignment = \{ student: Student; seat_index: number \};\r?\n\r?\n/s,
  ''
);

const hookOpen = `
export interface UseSeatingChartEditorParams {
  classId: string;
  students: Student[];
  selectedLayoutId: string | null;
  setSelectedLayoutId: (id: string | null) => void;
  selectedStudentForGroup: Student | null;
  setSelectedStudentForGroup: Dispatch<SetStateAction<Student | null>>;
  setUnseatedStudents: Dispatch<SetStateAction<Student[]>>;
  unseatedStudents: Student[];
  searchParams: ReadonlyURLSearchParams | null;
  router: AppRouterInstance;
  pathname: string | null;
  showSuccessNotification: (title: string, message: string) => void;
  applyLayoutViewSettings: (data: {
    show_grid?: boolean | null;
    show_objects?: boolean | null;
    layout_orientation?: string | null;
  }) => void;
  editingGroupNameId: string | null;
}

export function useSeatingChartEditor(params: UseSeatingChartEditorParams) {
  const {
    classId,
    students,
    selectedLayoutId,
    setSelectedLayoutId,
    selectedStudentForGroup,
    setSelectedStudentForGroup,
    setUnseatedStudents,
    unseatedStudents,
    searchParams,
    router,
    pathname,
    showSuccessNotification,
    applyLayoutViewSettings,
    editingGroupNameId,
  } = params;

`;

const hookClose = `
  return {} as Record<string, unknown>;
}
`;

const full = preamble + headFixed + hookOpen + body + hookClose;

fs.writeFileSync(outPath, full);
console.log('Wrote', outPath, 'chars', full.length);
