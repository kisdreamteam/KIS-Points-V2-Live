'use client';

import type { Dispatch, SetStateAction } from 'react';
import type { Student } from '@/lib/types';
import type { PointsReportPanelProps } from '@/features/dashboard/PointsReportPanel';
import SeatingViewWorkspace from './SeatingViewWorkspace';
import SeatingEditorWorkspace from './SeatingEditorWorkspace';

type StudentsSeatingBranchProps = {
  classId: string;
  isSeatingEditMode: boolean;
  isEditModeFromURL: boolean;
  students: Student[];
  isMultiSelectMode: boolean;
  selectedStudentIds: string[];
  selectedGroupIds: string[];
  onSelectStudent: (studentId: string) => void;
  onSelectGroup: (groupId: string) => void;
  isPointsReportOpen: boolean;
  pointsReportPanelProps: PointsReportPanelProps;
  setIsPointsReportOpen: Dispatch<SetStateAction<boolean>>;
};

export default function StudentsSeatingBranch({
  classId,
  isSeatingEditMode,
  isEditModeFromURL,
  students,
  isMultiSelectMode,
  selectedStudentIds,
  selectedGroupIds,
  onSelectStudent,
  onSelectGroup,
  isPointsReportOpen,
  pointsReportPanelProps,
  setIsPointsReportOpen,
}: StudentsSeatingBranchProps) {
  return (
    <div className="h-full min-h-0 w-full text-white-500">
      {isSeatingEditMode || isEditModeFromURL ? (
        <SeatingEditorWorkspace classId={classId} students={students} />
      ) : (
        <SeatingViewWorkspace
          classId={classId}
          isMultiSelectMode={isMultiSelectMode}
          selectedStudentIds={selectedStudentIds}
          selectedGroupIds={selectedGroupIds}
          onSelectStudent={onSelectStudent}
          onSelectGroup={onSelectGroup}
          isPointsReportOpen={isPointsReportOpen}
          pointsReportPanelProps={pointsReportPanelProps}
          setIsPointsReportOpen={setIsPointsReportOpen}
        />
      )}
    </div>
  );
}
