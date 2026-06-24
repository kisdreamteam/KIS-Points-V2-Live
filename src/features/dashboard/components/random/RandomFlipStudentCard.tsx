'use client';

import Image from 'next/image';
import type { Student } from '@/lib/types';
import { normalizeAvatarPath } from '@/lib/iconUtils';

const UI_SCALE = 0.9;
const scalePx = (n: number) => Math.round(n * UI_SCALE);
const FLIP_DURATION_MS = 120;

const cardWidth = scalePx(280);
const cardMinHeight = scalePx(320);
const avatarSize = scalePx(120);

const compactCardWidth = scalePx(180);
const compactCardMinHeight = scalePx(220);
const compactAvatarSize = scalePx(80);

type RandomFlipStudentCardProps = {
  student: Student | null;
  isFlipping: boolean;
  isBouncing: boolean;
  flipStepKey: number;
  isLoading?: boolean;
  hasStudents?: boolean;
  compact?: boolean;
  showPlaceholder?: boolean;
};

export default function RandomFlipStudentCard({
  student,
  isFlipping,
  isBouncing,
  flipStepKey,
  isLoading = false,
  hasStudents = true,
  compact = false,
  showPlaceholder = true,
}: RandomFlipStudentCardProps) {
  const width = compact ? compactCardWidth : cardWidth;
  const minHeight = compact ? compactCardMinHeight : cardMinHeight;
  const imageSize = compact ? compactAvatarSize : avatarSize;
  const paddingClass = compact ? 'p-4' : 'p-6';
  const nameClass = compact ? 'text-base' : 'text-xl';
  const gapClass = compact ? 'gap-3' : 'gap-5';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ width, minHeight }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  if (!hasStudents) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm"
        style={{ width, minHeight }}
      >
        <p className="text-white/70 text-lg font-semibold px-6 text-center">No students available</p>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center"
      style={{ width, minHeight, perspective: '1000px' }}
    >
      <div
        className={[
          'w-full rounded-2xl border border-white/30 bg-white/10 shadow-xl backdrop-blur-sm',
          paddingClass,
          isBouncing ? 'random-flip-card-bounce' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          key={isFlipping ? flipStepKey : 'idle'}
          className={isFlipping ? 'random-flip-card-flip' : ''}
          style={{
            transformStyle: 'preserve-3d',
            animationDuration: isFlipping ? `${FLIP_DURATION_MS}ms` : undefined,
          }}
        >
          {student ? (
            <div className={`flex flex-col items-center justify-center ${gapClass}`}>
              <Image
                src={normalizeAvatarPath(student.avatar)}
                alt={`${student.first_name} ${student.last_name}`}
                width={imageSize}
                height={imageSize}
                className="rounded-full border-4 border-white bg-[#FDF2F0] shadow-lg"
                style={{ backfaceVisibility: 'hidden' }}
              />
              <h3
                className={`text-center font-bold text-white px-2 ${nameClass}`}
                style={{ backfaceVisibility: 'hidden' }}
              >
                {student.first_name} {student.last_name}
              </h3>
            </div>
          ) : showPlaceholder ? (
            <div className={`flex flex-col items-center justify-center ${gapClass} ${compact ? 'py-4' : 'py-8'}`}>
              <div
                className="flex items-center justify-center rounded-full border-4 border-dashed border-white/50 bg-white/10"
                style={{ width: imageSize, height: imageSize }}
              >
                <span className={`font-bold text-white/50 ${compact ? 'text-2xl' : 'text-4xl'}`}>?</span>
              </div>
              <p className={`text-center font-semibold text-white/70 ${compact ? 'text-sm' : 'text-lg'}`}>
                Ready to pick
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
