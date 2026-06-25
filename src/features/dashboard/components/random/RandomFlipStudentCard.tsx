'use client';

import Image from 'next/image';
import type { Student } from '@/lib/types';
import { normalizeAvatarPath } from '@/lib/iconUtils';

const UI_SCALE = 0.9;
const scalePx = (n: number) => Math.round(n * UI_SCALE);
const FLIP_DURATION_MS = 60;

const cardWidth = scalePx(280);
const cardMinHeight = scalePx(320);
const avatarSize = scalePx(120);

const compactCardWidth = scalePx(180);
const compactCardMinHeight = scalePx(220);
const compactAvatarSize = scalePx(80);

type CardSize = 'default' | 'compact' | 'grid';

type RandomFlipStudentCardProps = {
  student: Student | null;
  isFlipping: boolean;
  isBouncing: boolean;
  flipStepKey: number;
  isLoading?: boolean;
  hasStudents?: boolean;
  size?: CardSize;
  showPlaceholder?: boolean;
};

export default function RandomFlipStudentCard({
  student,
  isFlipping,
  isBouncing,
  flipStepKey,
  isLoading = false,
  hasStudents = true,
  size = 'default',
  showPlaceholder = true,
}: RandomFlipStudentCardProps) {
  const isGrid = size === 'grid';
  const isCompact = size === 'compact';
  const width = isGrid ? undefined : isCompact ? compactCardWidth : cardWidth;
  const minHeight = isGrid ? undefined : isCompact ? compactCardMinHeight : cardMinHeight;
  const imageSize = isCompact ? compactAvatarSize : avatarSize;
  const paddingClass = isGrid ? 'p-2' : isCompact ? 'p-4' : 'p-6';
  const nameClass = isGrid ? 'text-xs' : isCompact ? 'text-base' : 'text-xl';
  const gapClass = isGrid ? 'gap-1.5' : isCompact ? 'gap-3' : 'gap-5';
  const placeholderPy = isGrid ? '' : isCompact ? 'py-4' : 'py-8';
  const questionMarkClass = isGrid ? 'text-xl' : isCompact ? 'text-2xl' : 'text-4xl';
  const readyTextClass = isGrid ? 'text-xs' : isCompact ? 'text-sm' : 'text-lg';
  const borderClass = isGrid ? 'border-2' : 'border-4';

  const outerClassName = isGrid
    ? 'flex h-full min-h-0 w-full items-stretch justify-center'
    : 'flex items-center justify-center';

  if (isLoading) {
    return (
      <div className={outerClassName} style={{ width, minHeight }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  if (!hasStudents) {
    return (
      <div
        className={[
          'flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm',
          isGrid ? 'h-full min-h-0 w-full' : '',
        ].join(' ')}
        style={{ width, minHeight }}
      >
        <p className={`text-white/70 font-semibold px-4 text-center ${isGrid ? 'text-sm' : 'text-lg'}`}>
          No students available
        </p>
      </div>
    );
  }

  const gridAvatarClassName = `rounded-full ${borderClass} border-white bg-[#FDF2F0] shadow-lg w-[clamp(2rem,40%,4.5rem)] aspect-square h-auto object-cover`;
  const gridPlaceholderAvatarClassName = `flex items-center justify-center rounded-full ${borderClass} border-dashed border-white/50 bg-white/10 w-[clamp(2rem,40%,4.5rem)] aspect-square`;

  return (
    <div className={outerClassName} style={{ width, minHeight, perspective: '1000px' }}>
      <div
        className={[
          'w-full rounded-2xl border border-gray-200 bg-white shadow-sm',
          paddingClass,
          isGrid ? 'h-full min-h-0 flex flex-col items-center justify-center' : '',
          isBouncing ? 'random-flip-card-bounce' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          key={isFlipping ? flipStepKey : 'idle'}
          className={[
            isFlipping ? 'random-flip-card-flip' : '',
            isGrid ? 'flex h-full min-h-0 w-full flex-col items-center justify-center' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            transformStyle: 'preserve-3d',
            animationDuration: isFlipping ? `${FLIP_DURATION_MS}ms` : undefined,
          }}
        >
          {student ? (
            <div className={`flex flex-col items-center justify-center ${gapClass} min-w-0 w-full`}>
              {isGrid ? (
                <Image
                  src={normalizeAvatarPath(student.avatar)}
                  alt={`${student.first_name} ${student.last_name}`}
                  width={72}
                  height={72}
                  className={gridAvatarClassName}
                  style={{ backfaceVisibility: 'hidden' }}
                />
              ) : (
                <Image
                  src={normalizeAvatarPath(student.avatar)}
                  alt={`${student.first_name} ${student.last_name}`}
                  width={imageSize}
                  height={imageSize}
                  className={`rounded-full ${borderClass} border-white bg-[#FDF2F0] shadow-lg`}
                  style={{ backfaceVisibility: 'hidden' }}
                />
              )}
              <h3
                className={`text-center font-bold text-black px-1 leading-tight ${nameClass} ${isGrid ? 'line-clamp-2 w-full' : ''}`}
                style={{ backfaceVisibility: 'hidden' }}
              >
                {student.first_name} {student.last_name}
              </h3>
            </div>
          ) : showPlaceholder ? (
            <div
              className={`flex flex-col items-center justify-center ${gapClass} ${placeholderPy} min-w-0 w-full`}
            >
              {isGrid ? (
                <div className={gridPlaceholderAvatarClassName}>
                  <span className={`font-bold text-white/50 ${questionMarkClass}`}>?</span>
                </div>
              ) : (
                <div
                  className={`flex items-center justify-center rounded-full ${borderClass} border-dashed border-white/50 bg-white/10`}
                  style={{ width: imageSize, height: imageSize }}
                >
                  <span className={`font-bold text-white/50 ${questionMarkClass}`}>?</span>
                </div>
              )}
              <p className={`text-center font-semibold text-white/70 ${readyTextClass}`}>Ready to pick</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
