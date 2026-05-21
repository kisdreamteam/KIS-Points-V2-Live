'use client';

import { Student } from '@/lib/types';
import SeatingChartEditorWorkspace from './SeatingChartEditorWorkspace';

interface SeatingChartEditorViewProps {
  classId: string;
  students: Student[];
}

export default function SeatingChartEditorView({ classId, students }: SeatingChartEditorViewProps) {
  return (
    <div className="h-full w-full min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 overflow-hidden">
        <SeatingChartEditorWorkspace classId={classId} students={students} />
      </div>
    </div>
  );
}
