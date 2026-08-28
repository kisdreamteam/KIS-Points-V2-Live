import { STUDENT_ENGLISH_LEVELS } from '@/features/students/lib/studentLevel';

type StudentEnglishLevelSelectProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

const selectClassName =
  'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white';

export default function StudentEnglishLevelSelect({
  value,
  onChange,
  className,
}: StudentEnglishLevelSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className ?? selectClassName}
    >
      <option value="">Select level</option>
      {STUDENT_ENGLISH_LEVELS.map((levelOption) => (
        <option key={levelOption} value={levelOption}>
          {levelOption}
        </option>
      ))}
    </select>
  );
}
