'use client';

import { useCallback } from 'react';
import { useParams } from 'next/navigation';
import StudentsWorkspaceContent from './StudentsWorkspaceContent';
import StudentsWorkspaceToolbar from '@/features/students/components/StudentsWorkspaceToolbar';
import WorkspaceTwoColumnSplit from '@/features/dashboard/components/frame/WorkspaceTwoColumnSplit';
import { useStudentsUrlState } from '@/hooks/useStudentsUrlState';
import { useLayoutStore } from '@/stores/useLayoutStore';

export default function StudentsWorkspace() {
  const params = useParams();
  const classId = (params?.classId as string | undefined) ?? '';
  const { currentView, isEditModeFromURL, isSeatingEditMode } = useStudentsUrlState({ classId });
  const normalizedView = currentView === 'seating' ? 'seating' : 'grid';
  const activeView = useLayoutStore((s) => s.activeView);
  const isEditMode = useLayoutStore((s) => s.isEditMode);
  const setEditClassModalOpen = useLayoutStore((s) => s.setEditClassModalOpen);

  const onEditClass = useCallback(() => {
    setEditClassModalOpen(true);
  }, [setEditClassModalOpen]);

  const toolbarColumnClassName =
    activeView === 'seating_chart' && isEditMode ? 'overflow-visible' : 'overflow-hidden';

  return (
    <WorkspaceTwoColumnSplit
      toolbarColumnClassName={toolbarColumnClassName}
      main={
        <StudentsWorkspaceContent
          classId={classId}
          currentView={normalizedView}
          isSeatingEditMode={isSeatingEditMode}
          isEditModeFromURL={isEditModeFromURL}
        />
      }
      toolbar={<StudentsWorkspaceToolbar classId={classId} onEditClass={onEditClass} />}
    />
  );
}
