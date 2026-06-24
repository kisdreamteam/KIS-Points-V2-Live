'use client';

import type { ReactNode } from 'react';
import type { Student } from '@/lib/types';
import RandomFlipStudentCard from '@/features/dashboard/components/random/RandomFlipStudentCard';

const GRID_COLS = 5;

type RandomFlipCardsGridProps = {
  slotCount: number;
  displayedStudents: (Student | null)[];
  isFlipping: boolean;
  isBouncing: boolean;
  flipStepKey: number;
  isLoading?: boolean;
  hasStudents?: boolean;
};

function GridShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-full min-h-0 w-full grid-cols-5 content-start gap-2 overflow-auto p-2">
      {children}
    </div>
  );
}

export default function RandomFlipCardsGrid({
  slotCount,
  displayedStudents,
  isFlipping,
  isBouncing,
  flipStepKey,
  isLoading = false,
  hasStudents = true,
}: RandomFlipCardsGridProps) {
  if (isLoading) {
    return (
      <GridShell>
        <div className="col-span-5 flex justify-center py-4">
          <RandomFlipStudentCard
            student={null}
            isFlipping={false}
            isBouncing={false}
            flipStepKey={0}
            isLoading
            hasStudents={hasStudents}
            size="grid"
          />
        </div>
      </GridShell>
    );
  }

  if (!hasStudents) {
    return (
      <GridShell>
        <div className="col-span-5 flex justify-center py-4">
          <RandomFlipStudentCard
            student={null}
            isFlipping={false}
            isBouncing={false}
            flipStepKey={0}
            hasStudents={false}
            size="grid"
          />
        </div>
      </GridShell>
    );
  }

  const slots = Array.from({ length: slotCount }, (_, index) => displayedStudents[index] ?? null);

  return (
    <div
      className="grid h-full min-h-0 w-full content-start gap-2 overflow-auto p-2"
      style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
    >
      {slots.map((student, index) => (
        <RandomFlipStudentCard
          key={index}
          student={student}
          isFlipping={isFlipping}
          isBouncing={isBouncing}
          flipStepKey={flipStepKey}
          hasStudents={hasStudents}
          size="grid"
        />
      ))}
    </div>
  );
}
