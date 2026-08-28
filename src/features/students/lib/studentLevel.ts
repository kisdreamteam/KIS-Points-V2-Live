export const STUDENT_ENGLISH_LEVELS = ['A', 'B', 'C', 'D', 'FC'] as const;

export type StudentEnglishLevel = (typeof STUDENT_ENGLISH_LEVELS)[number];

const LEVEL_SET = new Set<string>(STUDENT_ENGLISH_LEVELS);

export function parseStudentLevel(value: string | null | undefined): StudentEnglishLevel | null {
  if (value == null || value.trim() === '') return null;
  const trimmed = value.trim();
  if (!LEVEL_SET.has(trimmed)) {
    throw new Error(`Invalid student level: ${value}. Allowed values: A, B, C, D, FC.`);
  }
  return trimmed as StudentEnglishLevel;
}
