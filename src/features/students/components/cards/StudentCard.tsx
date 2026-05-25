'use client';

import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { normalizeAvatarPath } from '@/lib/iconUtils';
import IconSettingsWheel from '@/components/ui/icons/iconSettingsWheel';
import BaseCard from '@/components/ui/BaseCard';
import StudentCardActionsMenu from '@/features/students/components/menus/StudentCardActionsMenu';
import { useDashboardStore } from '@/features/dashboard/stores/useDashboardStore';
import { useLayoutStore } from '@/stores/useLayoutStore';

interface StudentCardProps {
  studentId: string;
  openDropdownId: string | null;
  onToggleDropdown: (studentId: string, event: React.MouseEvent) => void;
  onEdit: (studentId: string) => void;
  onDelete: (studentId: string, studentName: string) => void;
  onStudentClick: (studentId: string) => void;
  isSelected?: boolean;
  onSelectStudent?: (studentId: string) => void;
}

export default function StudentCard({
  studentId,
  openDropdownId,
  onToggleDropdown,
  onEdit,
  onDelete,
  onStudentClick,
  isSelected = false,
  onSelectStudent,
}: StudentCardProps) {
  const menuAnchorRef = useRef<HTMLButtonElement | null>(null);
  const isMultiSelectMode = useLayoutStore((s) => s.isMultiSelectMode);
  const student = useDashboardStore(
    useShallow((s) => s.students.find((x) => x.id === studentId) ?? null)
  );

  if (!student) {
    return null;
  }

  const handleCardClick = () => {
    if (isMultiSelectMode && onSelectStudent) {
      onSelectStudent(student.id);
      return;
    }
    onStudentClick(student.id);
  };

  const cardClassName =
    isMultiSelectMode && isSelected
      ? 'z-[1] hover:shadow-md ring-4 ring-blue-500'
      : 'z-[1] hover:shadow-md hover:!bg-blue-100';

  const topRightSlot = isMultiSelectMode ? (
    <div className="pointer-events-none flex h-8 w-8 flex-shrink-0 items-center justify-center" aria-hidden>
      <span
        className={[
          'relative inline-flex h-5 w-5 items-center justify-center rounded-full border-[3px] bg-white shadow-sm ring-1',
          isSelected ? 'border-blue-500 ring-blue-200/80' : 'border-gray-400 ring-gray-200/80',
        ].join(' ')}
      >
        {isSelected ? <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> : null}
      </span>
    </div>
  ) : (
    <div
      className="relative flex items-center gap-0.5"
      data-dropdown-container
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button
        ref={menuAnchorRef}
        type="button"
        onClick={(e) => onToggleDropdown(student.id, e)}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        data-dropdown-button
      >
        <IconSettingsWheel className="h-10 w-10" />
      </button>

      <StudentCardActionsMenu
        isOpen={openDropdownId === student.id}
        anchorRef={menuAnchorRef}
        studentId={student.id}
        studentName={`${student.first_name} ${student.last_name}`}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );

  return (
    <BaseCard
      data-student-card={student.id}
      className={cardClassName}
      variant="default"
      contentLayout="space-between"
      isSelected={false}
      aria-pressed={isMultiSelectMode ? isSelected : undefined}
      title={student.first_name}
      titleClassName="pointer-events-none text-gray-900"
      iconWrapperClassName="pointer-events-none"
      onClick={handleCardClick}
      topRightSlot={topRightSlot}
      icon={
        <img
          src={normalizeAvatarPath(student.avatar)}
          alt={`${student.first_name} ${student.last_name} avatar`}
          width={100}
          height={100}
          className="mb-0 mx-auto"
          decoding="async"
        />
      }
    >
      <div className="pointer-events-none w-full text-center">
        <div className="inline-flex items-center rounded-full bg-[#FDF2F0] px-3 py-1 text-xl font-bold text-red-400">
          {student.points || 0}
        </div>
      </div>
    </BaseCard>
  );
}
