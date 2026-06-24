'use client';

import Image from 'next/image';
import type { Student } from '@/lib/types';
import { normalizeAvatarPath } from '@/lib/iconUtils';

type RandomPickedThisRoundProps = {
  students: Student[];
  avatarSize?: number;
};

export default function RandomPickedThisRound({ students, avatarSize = 40 }: RandomPickedThisRoundProps) {
  if (students.length === 0) return null;

  return (
    <div className="mb-5 text-left">
      <p className="text-white text-lg font-semibold mb-3 text-center">
        Picked this round ({students.length})
      </p>
      <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {students.map((student, index) => (
          <li
            key={`${student.id}-${index}`}
            className="flex items-center gap-3 bg-white/15 rounded-xl px-3 py-2"
          >
            <Image
              src={normalizeAvatarPath(student.avatar)}
              alt={`${student.first_name} ${student.last_name}`}
              width={avatarSize}
              height={avatarSize}
              className="rounded-full bg-[#FDF2F0] border-2 border-white shrink-0"
            />
            <span className="text-white font-semibold text-sm truncate">
              {student.first_name} {student.last_name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
