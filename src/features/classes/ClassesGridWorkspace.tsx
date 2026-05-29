'use client';

import StageTwoColumnSplit from '@/components/ui/StageTwoColumnSplit';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import ClassCardsGrid from './ClassCardsGrid';
import ClassesGridWorkspaceToolbar from '@/features/classes/ClassesGridWorkspaceToolbar';
import type { ClassRecord } from '@/features/classes/lib/api/classes';

export type ClassesGridWorkspaceProps = {
  classes: ClassRecord[];
  studentCounts: Record<string, number>;
  openDropdownId: string | null;
  isArchivedView: boolean;
  showInitialClassesLoading: boolean;
  onToggleDropdown: (classId: string, event: React.MouseEvent) => void;
  onEdit: (classId: string) => void;
  onArchive: (classId: string, className: string) => void;
  onAddClass: () => void;
  onDelete?: (classId: string, className: string) => void;
};

export default function ClassesGridWorkspace({
  classes,
  studentCounts,
  openDropdownId,
  isArchivedView,
  showInitialClassesLoading,
  onToggleDropdown,
  onEdit,
  onArchive,
  onAddClass,
  onDelete,
}: ClassesGridWorkspaceProps) {
  const archiveButtonText = isArchivedView ? 'Unarchive Class' : 'Archive Class';

  return (
    <StageTwoColumnSplit rightRail={<ClassesGridWorkspaceToolbar />}>
      <div className="h-full min-h-0 w-full min-w-0 max-w-full">
        {isArchivedView && (
          <div className="bg-blue-100 rounded-3xl p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Archived Classes</h1>
          </div>
        )}

        {showInitialClassesLoading ? (
          <LoadingState message={`Loading ${isArchivedView ? 'archived ' : ''}classes...`} />
        ) : classes.length === 0 ? (
          <EmptyState
            title={isArchivedView ? 'No Archived Classes' : 'Welcome to your dashboard!'}
            message={
              isArchivedView
                ? 'Classes you archive will appear here'
                : "You haven't created any classes yet. Create your first class to get started with managing your students."
            }
            buttonText={isArchivedView ? undefined : 'Create Your First Class'}
            onAddClick={isArchivedView ? undefined : onAddClass}
          />
        ) : (
          <ClassCardsGrid
            classes={classes}
            studentCounts={studentCounts}
            openDropdownId={openDropdownId}
            onToggleDropdown={onToggleDropdown}
            onEdit={onEdit}
            onArchive={onArchive}
            onAddClass={onAddClass}
            archiveButtonText={archiveButtonText}
            showAddCard={!isArchivedView}
            onDelete={onDelete}
            showDelete={isArchivedView}
          />
        )}
      </div>
    </StageTwoColumnSplit>
  );
}
