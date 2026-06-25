'use client';

import Image from 'next/image';
import type { Student } from '@/lib/types';
import { normalizeAvatarPath } from '@/lib/iconUtils';
import IconNoCircleX from '@/components/ui/icons/iconNoCircleX';

type RandomPointsListProps = {
  students: Student[];
  avatarSize: number;
  onRemove: (index: number) => void;
  onAward: () => void;
  disabled?: boolean;
};

export default function RandomPointsList({
  students,
  avatarSize,
  onRemove,
  onAward,
  disabled = false,
}: RandomPointsListProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
      <div className="mb-2 shrink-0">
        <h3 className="text-white text-lg font-bold">Points List</h3>
        <p className="text-white/80 text-sm">{students.length} students selected</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1 space-y-2">
        {students.map((student, index) => (
          <div
            key={`${student.id}-${index}`}
            className="bg-white/20 rounded-xl p-2 flex items-center gap-3"
          >
            <Image
              src={normalizeAvatarPath(student.avatar)}
              alt={`${student.first_name} ${student.last_name}`}
              width={avatarSize}
              height={avatarSize}
              className="rounded-xl border-2 border-white shrink-0"
            />
            <p className="text-white font-semibold text-sm flex-1 min-w-0 truncate">
              {student.first_name} {student.last_name}
            </p>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="shrink-0 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              aria-label={`Remove ${student.first_name} ${student.last_name} from list`}
              title="Remove from list"
            >
              <IconNoCircleX className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAward}
        disabled={disabled}
        className="mt-2 shrink-0 w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors shadow-lg"
      >
        Award points to students on the list
      </button>
    </div>
  );
}
