'use client';

import type { CSSProperties, ReactNode } from 'react';
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

function getRowCount(slotCount: number): number {
  return Math.max(1, Math.ceil(slotCount / GRID_COLS));
}

function getGridStyle(rowCount: number): CSSProperties {
  return {
    gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))`,
  };
}

function GridShell({ rowCount, children }: { rowCount: number; children: ReactNode }) {
  return (
    <div
      className="grid h-full min-h-0 w-full gap-2 overflow-hidden p-2"
      style={getGridStyle(rowCount)}
    >
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
  const rowCount = getRowCount(slotCount);

  if (isLoading) {
    return (
      <GridShell rowCount={1}>
        <div className="col-span-5 flex h-full min-h-0 justify-center">
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
      <GridShell rowCount={1}>
        <div className="col-span-5 flex h-full min-h-0 justify-center">
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
      className="grid h-full min-h-0 w-full gap-2 overflow-hidden p-2"
      style={getGridStyle(rowCount)}
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
