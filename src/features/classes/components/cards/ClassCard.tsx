import Link from "next/link";
import { useRef } from "react";
import { normalizeClassIconPath } from "@/lib/iconUtils";
import IconSettingsWheel from "@/components/ui/icons/iconSettingsWheel";
import BaseCard from "@/components/ui/BaseCard";
import ClassCardActionsMenu from "@/features/classes/components/menus/ClassCardActionsMenu";
import { usePreferenceStore } from "@/stores/usePreferenceStore";

interface Class {
  id: string;
  name: string;
  icon?: string;
  is_owner?: boolean;
}

interface ClassCardProps {
  classItem: Class;
  studentCount: number;
  openDropdownId: string | null;
  onToggleDropdown: (classId: string, event: React.MouseEvent) => void;
  onEdit: (classId: string) => void;
  onArchive: (classId: string, className: string) => void;
  archiveButtonText?: string;
  onDelete?: (classId: string, className: string) => void;
  showDelete?: boolean;
}

export default function ClassCard({
  classItem,
  studentCount,
  openDropdownId,
  onToggleDropdown,
  onEdit,
  onArchive,
  archiveButtonText = "Archive Class",
  onDelete,
  showDelete = false,
}: ClassCardProps) {
  const menuAnchorRef = useRef<HTMLButtonElement | null>(null);
  const isOwner = classItem.is_owner !== false;
  const viewPreference = usePreferenceStore((s) => s.viewPreference);
  const classHref =
    viewPreference === "seating"
      ? `/dashboard/classes/${classItem.id}?view=seating`
      : `/dashboard/classes/${classItem.id}`;
  return (
    <Link href={classHref} className="block aspect-square w-full min-h-0">
      <BaseCard
        className="!aspect-auto h-full min-h-0 hover:shadow-md hover:!bg-blue-100"
        variant="default"
        title={
          <h3
            className="w-full overflow-hidden break-words text-center font-semibold text-gray-800"
            style={{
              fontSize: `clamp(0.75rem, ${Math.max(0.75, Math.min(1.5, 1.5 - (classItem.name.length - 8) * 0.04))}rem, 1.5rem)`,
              lineHeight: "1.2",
            }}
          >
            {classItem.name}
          </h3>
        }
        subtitle={
          studentCount !== undefined
            ? `${studentCount} ${studentCount === 1 ? "Student" : "Students"}`
            : "Loading..."
        }
        subtitleClassName="!text-xs !text-gray-400 !mb-0 !font-bold"
        topRightSlot={
          <div className="relative z-10">
            <button
              ref={menuAnchorRef}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleDropdown(classItem.id, e);
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 ${openDropdownId === classItem.id ? "bg-gray-100 text-gray-700" : ""
                }`}
            >
              <IconSettingsWheel className="h-5 w-5" />
            </button>

            <ClassCardActionsMenu
              isOpen={openDropdownId === classItem.id}
              anchorRef={menuAnchorRef}
              classId={classItem.id}
              className={classItem.name}
              isOwner={isOwner}
              archiveButtonText={archiveButtonText}
              showDelete={showDelete}
              onEdit={onEdit}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          </div>
        }
        titleClassName="!mb-2 flex-1 min-h-0 flex items-center justify-center px-2"
        iconWrapperClassName="!mb-2 flex-shrink-0 "
        icon={
          <img
            src={normalizeClassIconPath(classItem.icon)}
            alt={`${classItem.name} icon`}
            width={80}
            height={80}
            className="mb-0 mx-auto"
            decoding="async"
          />
        }
      >
        {!isOwner && (
          <p className="!mt-1 text-center text-[11px] font-semibold text-blue-600">Shared with you</p>
        )}
      </BaseCard>
    </Link>
  );
}
