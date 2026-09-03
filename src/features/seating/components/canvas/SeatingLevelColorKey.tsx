import type { CSSProperties } from 'react';
import { getSeatingLevelLegendItems } from '@/features/seating/lib/seatingCardStyles';

type SeatingLevelColorKeyProps = {
  visible: boolean;
  isTeacherView?: boolean;
};

export default function SeatingLevelColorKey({
  visible,
  isTeacherView = false,
}: SeatingLevelColorKeyProps) {
  if (!visible) return null;

  const labelStyle: CSSProperties | undefined = isTeacherView
    ? { display: 'inline-block', transform: 'rotate(-180deg)' }
    : undefined;

  const items = getSeatingLevelLegendItems();

  return (
    <div
      className="absolute top-3 right-3 z-[2] flex flex-col gap-1.5 pointer-events-none"
      aria-label="English level color key"
    >
      {items.map(({ level, swatchClass }) => (
        <div key={level} className="flex items-center gap-2" style={labelStyle}>
          <span
            className={`h-[18px] w-[18px] flex-shrink-0 rounded-sm ${swatchClass}`}
            aria-hidden
          />
          <span className="text-sm font-semibold text-gray-800">{level}</span>
        </div>
      ))}
    </div>
  );
}
