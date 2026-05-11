'use client';

interface StudentCardActionsMenuProps {
  isOpen: boolean;
  studentId: string;
  studentName: string;
  onEdit: (studentId: string) => void;
  onDelete: (studentId: string, studentName: string) => void;
}

export default function StudentCardActionsMenu({
  isOpen,
  studentId,
  studentName,
  onEdit,
  onDelete,
}: StudentCardActionsMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute right-0 top-9 z-[100] min-w-[200px] rounded-lg border-4 border-brand-purple bg-blue-100 py-2 shadow-lg"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(studentId);
          }}
          className="flex w-full items-center px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
        >
          {/* <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg> */}
          Edit
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(studentId, studentName);
          }}
          className="flex w-full items-center px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-gray-100"
        >
          {/* <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg> */}
          Delete
        </button>
      </div>
    </div>
  );
}
