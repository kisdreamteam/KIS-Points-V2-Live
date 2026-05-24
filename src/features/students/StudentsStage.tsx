'use client';

import { useParams } from 'next/navigation';
import StudentsStageContent from './StudentsStageContent';
import { useStudentsUrlState } from '@/hooks/useStudentsUrlState';

export default function StudentsStage() {
  const params = useParams();
  const classId = (params?.classId as string | undefined) ?? '';
  const { currentView, isEditModeFromURL, isSeatingEditMode } = useStudentsUrlState({ classId });
  const normalizedView = currentView === 'seating' ? 'seating' : 'grid';

  return (
    <StudentsStageContent
      classId={classId}
      currentView={normalizedView}
      isSeatingEditMode={isSeatingEditMode}
      isEditModeFromURL={isEditModeFromURL}
    />
  );
}
