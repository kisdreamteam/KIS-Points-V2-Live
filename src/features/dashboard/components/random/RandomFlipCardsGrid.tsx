'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { Student } from '@/lib/types';
import RandomFlipStudentCard from '@/features/dashboard/components/random/RandomFlipStudentCard';
import { MAX_PICK_COUNT } from '@/features/dashboard/lib/randomPickerPool';

const GRID_COLS = 5;
const MAX_GRID_ROWS = Math.ceil(MAX_PICK_COUNT / GRID_COLS);
const TOTAL_CELLS = GRID_COLS * MAX_GRID_ROWS;

const GRID_CLASS_NAME = 'grid h-full min-h-0 w-full gap-2 overflow-hidden p-2';

function getGridStyle(): CSSProperties {
  return {
    gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${MAX_GRID_ROWS}, minmax(0, 1fr))`,
  };
}

function GridShell({ children }: { children: ReactNode }) {
  return (
    <div className={GRID_CLASS_NAME} style={getGridStyle()}>
      {children}
    </div>
  );
}

function VacantCell() {
  return <div className="min-h-0" aria-hidden />;
}

type RandomFlipCardsGridProps = {
  slotCount: number;
  displayedStudents: (Student | null)[];
  isFlipping: boolean;
  isBouncing: boolean;
  flipStepKey: number;
  isLoading?: boolean;
  hasStudents?: boolean;
};

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
        <RandomFlipStudentCard
          student={null}
          isFlipping={false}
          isBouncing={false}
          flipStepKey={0}
          isLoading
          hasStudents={hasStudents}
          size="grid"
        />
        {Array.from({ length: TOTAL_CELLS - 1 }, (_, index) => (
          <VacantCell key={`loading-vacant-${index + 1}`} />
        ))}
      </GridShell>
    );
  }

  if (!hasStudents) {
    return (
      <GridShell>
        <RandomFlipStudentCard
          student={null}
          isFlipping={false}
          isBouncing={false}
          flipStepKey={0}
          hasStudents={false}
          size="grid"
        />
        {Array.from({ length: TOTAL_CELLS - 1 }, (_, index) => (
          <VacantCell key={`empty-vacant-${index + 1}`} />
        ))}
      </GridShell>
    );
  }

  return (
    <div className={GRID_CLASS_NAME} style={getGridStyle()}>
      {Array.from({ length: TOTAL_CELLS }, (_, index) => {
        if (index >= slotCount) {
          return <VacantCell key={`vacant-${index}`} />;
        }

        return (
          <RandomFlipStudentCard
            key={index}
            student={displayedStudents[index] ?? null}
            isFlipping={isFlipping}
            isBouncing={isBouncing}
            flipStepKey={flipStepKey}
            hasStudents={hasStudents}
            size="grid"
          />
        );
      })}
    </div>
  );
}
