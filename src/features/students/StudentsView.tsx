'use client';

import { useCallback } from 'react';
import { useParams } from 'next/navigation';
import StudentsWorkspace from './StudentsWorkspace';
import StudentsStageToolbar from '@/features/students/components/StudentsStageToolbar';
import StageTwoColumnLayout from '@/features/dashboard/components/frame/StageTwoColumnLayout';
import { useStudentsUrlState } from '@/hooks/useStudentsUrlState';
import { useLayoutStore } from '@/stores/useLayoutStore';

export default function StudentsView() {
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
    <StageTwoColumnLayout
      toolbarColumnClassName={toolbarColumnClassName}
      main={
        <StudentsWorkspace
          classId={classId}
          currentView={normalizedView}
          isSeatingEditMode={isSeatingEditMode}
          isEditModeFromURL={isEditModeFromURL}
        />
      }
      toolbar={<StudentsStageToolbar classId={classId} onEditClass={onEditClass} />}
    />
  );
}
