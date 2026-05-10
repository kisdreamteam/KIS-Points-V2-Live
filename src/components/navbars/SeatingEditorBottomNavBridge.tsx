'use client';

import SeatingEditorBottomNav from '@/components/navbars/SeatingEditorBottomNav';
import { useSeatingEditBottomNav } from '@/hooks/useSeatingEditBottomNav';

type Props = {
  currentClassName: string | null;
  classId: string | null;
  onEditClass: () => void;
};

/** Mount only when seating edit mode is active so `useSeatingEditBottomNav` satisfies Rules of Hooks. */
export default function SeatingEditorBottomNavBridge({ currentClassName, classId, onEditClass }: Props) {
  const seatingNav = useSeatingEditBottomNav();
  return (
    <SeatingEditorBottomNav
      currentClassName={currentClassName}
      classId={classId}
      onEditClass={onEditClass}
      {...seatingNav}
    />
  );
}
