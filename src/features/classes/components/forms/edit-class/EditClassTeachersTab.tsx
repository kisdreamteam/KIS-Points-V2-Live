'use client';

import type { CollaboratorTeacher } from '@/features/classes/hooks/useClassManagement';

type EditClassTeachersTabProps = {
  newTeacherEmail: string;
  onEmailChange: (email: string) => void;
  teachers: CollaboratorTeacher[];
  isClassOwner: boolean;
  isLoading: boolean;
  onAdd: () => void;
  onRemove: (collaboratorRowId: string, label: string) => void;
};

export default function EditClassTeachersTab({
  newTeacherEmail,
  onEmailChange,
  teachers,
  isClassOwner,
  isLoading,
  onAdd,
  onRemove,
}: EditClassTeachersTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Add Teacher by Email</label>
        <div className="flex gap-2">
          <input
            type="email"
            value={newTeacherEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="name@kshcm.net"
            disabled={!isClassOwner || isLoading}
            className="flex-1 h-11 rounded-lg border border-gray-300 px-3 disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={onAdd}
            disabled={!isClassOwner || isLoading}
            className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Collaborating Teachers</label>
        <div className="min-h-[200px] border border-gray-200 rounded-lg bg-white p-4">
          {teachers.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              No teachers are currently collaborating on this class.
            </p>
          ) : (
            <ul className="space-y-2">
              {teachers.map((teacher) => {
                const label = teacher.name?.trim() || teacher.email;
                return (
                  <li
                    key={teacher.collaboratorRowId}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{label}</p>
                      {teacher.name && <p className="text-sm text-gray-500">{teacher.email}</p>}
                    </div>
                    {isClassOwner && (
                      <button
                        type="button"
                        onClick={() => onRemove(teacher.collaboratorRowId, label)}
                        disabled={isLoading}
                        className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
