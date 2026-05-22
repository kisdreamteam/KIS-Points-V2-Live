'use client';

interface SkillActionCardProps {
  title: string;
  onClick: () => void;
  borderClassName: string;
  titleClassName: string;
  iconClassName: string;
  icon: React.ReactNode;
}

export default function SkillActionCard({
  title,
  onClick,
  borderClassName,
  titleClassName,
  iconClassName,
  icon,
}: SkillActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`bg-white font-spartan rounded-3xl hover:bg-blue-100 hover:rounded-3xl shadow-md p-4 overflow-hidden hover:shadow-lg transition-shadow duration-200 relative group cursor-pointer aspect-square flex flex-col border-2 border-dashed ${borderClassName}`}
    >
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="flex justify-center mb-1 pointer-events-none flex-shrink-0">
          <div className={`rounded-xl bg-[#FDF2F0] p-2 flex items-center justify-center ${iconClassName}`}>
            {icon}
          </div>
        </div>
        <div className="text-center mb-1 pointer-events-none flex-shrink-0">
          <h3 className={`text-sm font-semibold ${titleClassName}`}>{title}</h3>
        </div>
      </div>
    </button>
  );
}
