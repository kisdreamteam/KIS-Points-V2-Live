'use client';

import type { FC } from 'react';
import type { Student } from '@/lib/types';
import MenuSurface from '@/components/ui/menu/MenuSurface';

export interface AttendanceMenuBodyProps {
  students: Student[];
  absentStudentIds: string[];
  onToggleAbsence: (studentId: string) => void;
}

export const AttendanceMenuBody: FC<AttendanceMenuBodyProps> = ({
  students,
  absentStudentIds,
  onToggleAbsence,
}) => {
  return (
    <MenuSurface className="flex w-full flex-col overflow-hidden py-0">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="font-spartan text-base font-semibold text-brand-purple">Mark absent students</h2>
      </div>

      <div className="max-h-[min(50vh,420px)] overflow-y-auto py-1">
        {students.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-600">No students in this class.</p>
        ) : (
          students.map((student) => (
            <label
              key={student.id}
              className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-blue-200/60"
            >
              <input
                type="checkbox"
                checked={absentStudentIds.includes(student.id)}
                onChange={() => onToggleAbsence(student.id)}
                className="h-5 w-5 shrink-0 accent-brand-purple"
              />
              <span className="truncate font-spartan text-brand-purple">
                {student.student_number != null ? `${student.student_number}. ` : ''}
                {student.first_name}
                {student.last_name ? ` ${student.last_name}` : ''}
              </span>
            </label>
          ))
        )}
      </div>
    </MenuSurface>
  );
};
