'use client';

import Image from 'next/image';
import { normalizeAvatarPath } from '@/lib/iconUtils';
import type { StudentWithPhoto } from '@/features/classes/hooks/useClassManagement';

type EditClassStudentsTabProps = {
  students: StudentWithPhoto[];
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  onAddStudent: () => void;
  onSwitchNames: () => void;
  onCancel: () => void;
  onSave: () => void;
  onFieldChange: (
    studentId: string,
    field: 'first_name' | 'last_name' | 'student_number',
    value: string | number | null
  ) => void;
  onGenderToggle: (studentId: string, gender: 'Boy' | 'Girl') => void;
};

export default function EditClassStudentsTab({
  students,
  hasUnsavedChanges,
  isLoading,
  onAddStudent,
  onSwitchNames,
  onCancel,
  onSave,
  onFieldChange,
  onGenderToggle,
}: EditClassStudentsTabProps) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onAddStudent}
        className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-blue-300 transition-colors text-left"
      >
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className="text-sm font-medium text-gray-800">Add New Student</span>
      </button>

      {students.length > 0 && (
        <div className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 uppercase">
          <div className="w-10 flex-shrink-0" />
          <span className="w-32 flex-shrink-0">First Name</span>
          <span className="w-32 flex-shrink-0">Last Name</span>
          <span className="w-20 flex-shrink-0 text-center">Student Number</span>
          <span className="w-28 flex-shrink-0 text-center">Gender</span>
        </div>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {students.map((student) => (
          <div
            key={student.id}
            className="w-full flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200"
          >
            <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
              <Image
                src={normalizeAvatarPath(student.avatar)}
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 object-cover"
              />
            </div>
            <input
              type="text"
              value={student.first_name}
              onChange={(e) => onFieldChange(student.id, 'first_name', e.target.value)}
              className="w-32 flex-shrink-0 h-9 rounded border border-gray-300 px-2 text-sm"
            />
            <input
              type="text"
              value={student.last_name ?? ''}
              onChange={(e) => onFieldChange(student.id, 'last_name', e.target.value)}
              placeholder="Last name (optional)"
              className="w-32 flex-shrink-0 h-9 rounded border border-gray-300 px-2 text-sm"
            />
            <input
              type="number"
              value={student.student_number ?? ''}
              onChange={(e) =>
                onFieldChange(student.id, 'student_number', e.target.value === '' ? null : e.target.value)
              }
              className="w-20 flex-shrink-0 h-9 rounded border border-gray-300 px-2 text-sm text-center"
            />
            <div className="w-28 flex-shrink-0 flex justify-center gap-3 text-sm">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name={`gender-${student.id}`}
                  checked={student.gender === 'Boy'}
                  onChange={() => onGenderToggle(student.id, 'Boy')}
                  className="text-blue-600"
                />
                Boy
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name={`gender-${student.id}`}
                  checked={student.gender === 'Girl'}
                  onChange={() => onGenderToggle(student.id, 'Girl')}
                  className="text-pink-600"
                />
                Girl
              </label>
            </div>
          </div>
        ))}
      </div>

      {students.length === 0 && (
        <p className="text-center text-gray-500 py-8">No students in this class yet.</p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onSwitchNames}
          disabled={isLoading || students.length === 0}
          className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Switch First and Last Names
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading || !hasUnsavedChanges}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isLoading || !hasUnsavedChanges}
            className="px-6 py-2 bg-brand-pink text-white rounded-lg font-bold hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
