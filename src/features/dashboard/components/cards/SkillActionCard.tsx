'use client';

type SkillActionCardSize = 'default' | 'compact';

interface SkillActionCardProps {
  title: string;
  onClick: () => void;
  borderClassName: string;
  titleClassName: string;
  iconClassName: string;
  icon: React.ReactNode;
  size?: SkillActionCardSize;
}

export default function SkillActionCard({
  title,
  onClick,
  borderClassName,
  titleClassName,
  iconClassName,
  icon,
  size = 'default',
}: SkillActionCardProps) {
  const isCompact = size === 'compact';

  return (
    <button
      onClick={onClick}
      className={[
        'bg-white font-spartan overflow-hidden transition-shadow duration-200 relative group cursor-pointer aspect-square flex flex-col border-2 border-dashed hover:bg-blue-100',
        isCompact
          ? 'rounded-xl shadow-sm p-2 hover:shadow-md'
          : 'rounded-3xl shadow-md p-4 hover:rounded-3xl hover:shadow-lg',
        borderClassName,
      ].join(' ')}
    >
      <div className="flex flex-col items-center justify-center flex-1 min-w-0">
        <div className="flex justify-center mb-1 pointer-events-none flex-shrink-0">
          <div
            className={[
              'rounded-xl bg-[#FDF2F0] flex items-center justify-center',
              isCompact ? 'p-1' : 'p-2',
              iconClassName,
            ].join(' ')}
          >
            {icon}
          </div>
        </div>
        <div className="text-center mb-1 pointer-events-none flex-shrink-0 min-w-0 px-0.5 w-full">
          <h3
            className={[
              'font-semibold truncate',
              isCompact ? 'text-[10px] sm:text-xs' : 'text-sm',
              titleClassName,
            ].join(' ')}
          >
            {title}
          </h3>
        </div>
      </div>
    </button>
  );
}
