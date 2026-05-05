'use client';

import { useParams } from 'next/navigation';
import StudentsWorkspace from './StudentsWorkspace';
import { useStudentsUrlState } from '@/hooks/useStudentsUrlState';

export default function StudentsView() {
  const params = useParams();
  const classId = (params?.classId as string | undefined) ?? '';
  const { currentView, isEditModeFromURL, isSeatingEditMode } = useStudentsUrlState({ classId });
  const normalizedView = currentView === 'seating' ? 'seating' : 'grid';

  return (
    <StudentsWorkspace
      classId={classId}
      currentView={normalizedView}
      isSeatingEditMode={isSeatingEditMode}
      isEditModeFromURL={isEditModeFromURL}
    />
  );
}
