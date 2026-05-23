'use client';

import type { Student } from '@/lib/types';
import SeatingViewWorkspaceContent from './SeatingViewWorkspaceContent';
import SeatingEditorWorkspaceContent from './SeatingEditorWorkspaceContent';

type StudentsSeatingBranchProps = {
  classId: string;
  isSeatingEditMode: boolean;
  isEditModeFromURL: boolean;
  students: Student[];
  isMultiSelectMode: boolean;
  selectedStudentIds: string[];
  onSelectStudent: (studentId: string) => void;
};

export default function StudentsSeatingBranch({
  classId,
  isSeatingEditMode,
  isEditModeFromURL,
  students,
  isMultiSelectMode,
  selectedStudentIds,
  onSelectStudent,
}: StudentsSeatingBranchProps) {
  return (
    <div className="h-full min-h-0 w-full text-white-500">
      {isSeatingEditMode || isEditModeFromURL ? (
        <SeatingEditorWorkspaceContent classId={classId} students={students} />
      ) : (
        <SeatingViewWorkspaceContent
          classId={classId}
          isMultiSelectMode={isMultiSelectMode}
          selectedStudentIds={selectedStudentIds}
          onSelectStudent={onSelectStudent}
        />
      )}
    </div>
  );
}
