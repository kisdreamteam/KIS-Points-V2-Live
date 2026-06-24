'use client';

import type { Student } from '@/lib/types';
import type { PickCount } from '@/features/dashboard/lib/randomPickerPool';
import RandomFlipStudentCard from '@/features/dashboard/components/random/RandomFlipStudentCard';

type RandomFlipCardsGridProps = {
  slotCount: PickCount;
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
      <div className="flex h-full min-h-0 w-full flex-col items-center justify-start overflow-y-auto py-2">
        <RandomFlipStudentCard
          student={null}
          isFlipping={false}
          isBouncing={false}
          flipStepKey={0}
          isLoading
          hasStudents={hasStudents}
          compact={false}
        />
      </div>
    );
  }

  if (!hasStudents) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col items-center justify-start overflow-y-auto py-2">
        <RandomFlipStudentCard
          student={null}
          isFlipping={false}
          isBouncing={false}
          flipStepKey={0}
          hasStudents={false}
          compact={false}
        />
      </div>
    );
  }

  const slots = Array.from({ length: slotCount }, (_, index) => displayedStudents[index] ?? null);

  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center justify-start gap-4 overflow-y-auto py-2">
      {slots.map((student, index) => (
        <RandomFlipStudentCard
          key={index}
          student={student}
          isFlipping={isFlipping}
          isBouncing={isBouncing}
          flipStepKey={flipStepKey}
          hasStudents={hasStudents}
          compact={false}
        />
      ))}
    </div>
  );
}
