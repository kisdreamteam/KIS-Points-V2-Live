'use client';

import { Student } from '@/lib/types';
import SeatingChartEditorWorkspace from './SeatingChartEditorWorkspace';

interface SeatingChartEditorViewProps {
  classId: string;
  students: Student[];
}

export default function SeatingChartEditorView({ classId, students }: SeatingChartEditorViewProps) {
  return <SeatingChartEditorWorkspace classId={classId} students={students} />;
}
