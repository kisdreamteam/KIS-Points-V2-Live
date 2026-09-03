'use client';

import { useShallow } from 'zustand/react/shallow';
import { getSeatingCardStyles } from '@/features/seating/lib/seatingCardStyles';
import { useSeatingStore } from '@/features/seating/stores/useSeatingStore';
import { Student } from '@/lib/types';

export default function SeatingEditorLeftNav() {
  const { unseatedStudents, colorByGender, colorByLevel } = useSeatingStore(
    useShallow((s) => ({
      unseatedStudents: s.unseatedStudents,
      colorByGender: s.colorByGender,
      colorByLevel: s.colorByLevel,
    }))
  );
  const setSelectedStudentForGroup = useSeatingStore((s) => s.setSelectedStudentForGroup);

  const handleStudentClick = (student: Student) => {
    setSelectedStudentForGroup(student);
    // Dispatch event to indicate a student is ready to be added to a group
    window.dispatchEvent(new CustomEvent('studentSelectedForGroup', { 
      detail: { student } 
    }));
  };

  return (
    <div className="p-4 flex flex-col h-full bg-white text-brand-purple">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-center">Unseated Students</h2>
        <p className="text-sm text-center">
          Click a student to add them to a group
        </p>
      </div>

      {/* Students List - deduplicate by id to avoid duplicate React keys */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {unseatedStudents.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-center">All students are seated</p>
          </div>
        ) : (
          unseatedStudents
            .filter((student, index, self) => self.findIndex((s) => s.id === student.id) === index)
            .map((student) => {
            const cardClasses = getSeatingCardStyles(student, {
              colorByGender,
              colorByLevel,
              forEditor: true,
            }).className;

            return (
            <div
              key={student.id}
              onClick={() => handleStudentClick(student)}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${cardClasses}`}
            >
              {/* Student Name with Number */}
              <div className="flex-1 min-w-0">
                <span className="text-base font-medium text-gray-800 block truncate font-spartan">
                  {student.student_number ? `${student.student_number}. ` : ''}{student.first_name}
                </span>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-white/30">
        <div className="text-center">
          <p className="text-sm text-white/90">
            {unseatedStudents.length} unseated
          </p>
        </div>
      </div>
    </div>
  );
}

