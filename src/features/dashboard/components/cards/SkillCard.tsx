'use client';

type SkillCardSize = 'default' | 'compact';

interface SkillCardProps {
  id: string;
  name: string;
  points: number;
  icon?: string;
  imageCacheKey: number;
  onClick: () => void;
  addCacheBuster: (iconPath: string, cacheKey?: string | number) => string;
  isSelected?: boolean;
  showPointsBadge?: boolean;
  size?: SkillCardSize;
}

export default function SkillCard({
  id,
  name,
  points,
  icon,
  imageCacheKey,
  onClick,
  addCacheBuster,
  isSelected = false,
  showPointsBadge = true,
  size = 'default',
}: SkillCardProps) {
  const isCompact = size === 'compact';
  const iconSize = isCompact ? 48 : 100;

  return (
    <div
      onClick={onClick}
      className={[
        'bg-gray-50 font-spartan overflow-hidden transition-shadow duration-200 relative group cursor-pointer aspect-square flex flex-col hover:bg-blue-100',
        isCompact
          ? 'rounded-xl shadow-sm p-2 hover:shadow-md'
          : 'rounded-3xl shadow-md p-6 hover:rounded-3xl hover:shadow-lg',
        isSelected
          ? isCompact
            ? 'ring-2 ring-blue-500 ring-offset-1'
            : 'ring-2 ring-blue-500 ring-offset-2'
          : '',
      ].join(' ')}
    >
      <div
        className={[
          'flex justify-center mb-1 pointer-events-none flex-shrink-0',
          isCompact ? '' : 'hidden md:flex',
        ].join(' ')}
      >
        {icon ? (
          <img
            key={`${id}-${imageCacheKey}`}
            src={addCacheBuster(icon, imageCacheKey)}
            alt={name}
            width={iconSize}
            height={iconSize}
            className="rounded-xl object-contain"
            decoding="async"
          />
        ) : (
          <div
            className="rounded-xl bg-[#FDF2F0] flex items-center justify-center"
            style={{ width: iconSize, height: iconSize }}
          >
            <svg
              className={isCompact ? 'w-6 h-6' : 'w-12 h-12'}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>
      <div className="text-center mb-0 pointer-events-none flex-shrink-0 min-w-0 px-0.5">
        <h3
          className={[
            'font-semibold text-gray-900',
            isCompact ? 'text-[10px] sm:text-xs truncate' : 'text-xs md:text-lg overflow-hidden whitespace-nowrap',
          ].join(' ')}
        >
          {name}
        </h3>
      </div>
      {showPointsBadge ? (
        <div className="text-center pointer-events-none mt-auto">
          <div
            className={[
              'inline-flex items-center px-1 py-0 rounded-full bg-brand-cream text-red-400 font-bold',
              isCompact ? 'text-xs' : 'text-sm md:text-xl font-large',
            ].join(' ')}
          >
            {points > 0 ? `+${points}` : points}
          </div>
        </div>
      ) : null}
    </div>
  );
}
