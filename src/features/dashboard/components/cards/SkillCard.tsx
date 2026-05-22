'use client';

interface SkillCardProps {
  id: string;
  name: string;
  points: number;
  icon?: string;
  imageCacheKey: number;
  onClick: () => void;
  addCacheBuster: (iconPath: string, cacheKey?: string | number) => string;
}

export default function SkillCard({
  id,
  name,
  points,
  icon,
  imageCacheKey,
  onClick,
  addCacheBuster,
}: SkillCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white font-spartan rounded-3xl hover:bg-blue-100 hover:rounded-3xl shadow-md p-6 overflow-hidden hover:shadow-lg transition-shadow duration-200 relative group cursor-pointer aspect-square flex flex-col"
    >
      <div className="flex justify-center mb-1 pointer-events-none flex-shrink-0">
        {icon ? (
          <img
            key={`${id}-${imageCacheKey}`}
            src={addCacheBuster(icon, imageCacheKey)}
            alt={name}
            width={100}
            height={100}
            className="rounded-xl bg-[#FDF2F0] object-contain"
            decoding="async"
          />
        ) : (
          <div className="w-[100px] h-[100px] rounded-xl bg-[#FDF2F0] flex items-center justify-center">
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>
      <div className="text-center mb-0 pointer-events-none flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
      </div>
      <div className="text-center pointer-events-none mt-auto">
        <div className="inline-flex items-center px-3 py-0 rounded-full bg-[#FDF2F0] text-red-400 text-xl font-large font-bold">
          {points > 0 ? `+${points}` : points}
        </div>
      </div>
    </div>
  );
}
