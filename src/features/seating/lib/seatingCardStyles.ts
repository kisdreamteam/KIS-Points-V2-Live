import type { Student } from '@/lib/types';
import { STUDENT_ENGLISH_LEVELS, type StudentEnglishLevel } from '@/features/students/lib/studentLevel';

const LEVEL_SET = new Set<string>(STUDENT_ENGLISH_LEVELS);

export const LEVEL_BORDER_WIDTH = 'border-[7px]';

/** Semantic display order for the on-canvas level key (lowest → highest). */
export const SEATING_LEVEL_LEGEND_ORDER = ['FC', 'A', 'B', 'C', 'D'] as const;

export type SeatingLevelLegendLevel = (typeof SEATING_LEVEL_LEGEND_ORDER)[number];

const LEVEL_COLOR_CLASSES: Record<
  StudentEnglishLevel,
  { border: string; swatch: string }
> = {
  FC: { border: 'border-red-500', swatch: 'bg-red-500' },
  A: { border: 'border-green-400', swatch: 'bg-green-400' },
  B: { border: 'border-yellow-300', swatch: 'bg-yellow-300' },
  C: { border: 'border-blue-400', swatch: 'bg-blue-400' },
  D: { border: 'border-blue-800', swatch: 'bg-blue-800' },
};

export type SeatingLevelLegendItem = {
  level: SeatingLevelLegendLevel;
  swatchClass: string;
};

export function getSeatingLevelLegendItems(): SeatingLevelLegendItem[] {
  return SEATING_LEVEL_LEGEND_ORDER.map((level) => ({
    level,
    swatchClass: LEVEL_COLOR_CLASSES[level].swatch,
  }));
}

export type SeatingCardStyleInput = {
  colorByGender: boolean;
  colorByLevel: boolean;
  forEditor?: boolean;
};

export type SeatingCardStyleResult = {
  backgroundClasses: string;
  borderClasses: string;
  className: string;
};

function normalizeLevel(level: string | null | undefined): string | null {
  if (level == null || level.trim() === '') return null;
  const trimmed = level.trim();
  return LEVEL_SET.has(trimmed) ? trimmed : null;
}

function getGenderBackgroundClasses(student: Student, colorByGender: boolean, forEditor: boolean): string {
  if (!colorByGender) {
    return forEditor ? 'bg-white hover:bg-gray-50' : 'bg-white';
  }
  if (student.gender === null || student.gender === undefined || student.gender === '') {
    return forEditor ? 'bg-white hover:bg-gray-50' : 'bg-white';
  }
  if (student.gender === 'Boy') {
    return forEditor ? 'bg-blue-200 hover:bg-blue-300' : 'bg-blue-200';
  }
  if (student.gender === 'Girl') {
    return forEditor ? 'bg-pink-200 hover:bg-pink-300' : 'bg-pink-200';
  }
  return forEditor ? 'bg-white hover:bg-gray-50' : 'bg-white';
}

function getThinGenderBorderClasses(student: Student): string {
  if (student.gender === 'Boy') return 'border border-blue-300';
  if (student.gender === 'Girl') return 'border border-pink-300';
  return 'border border-gray-200';
}

function getLevelBorderClasses(student: Student): string {
  const level = normalizeLevel(student.level);
  if (!level) return `${LEVEL_BORDER_WIDTH} border-gray-100/10`;
  const color = LEVEL_COLOR_CLASSES[level as StudentEnglishLevel].border;
  return `${LEVEL_BORDER_WIDTH} ${color}`;
}

export function getSeatingCardStyles(
  student: Student,
  input: SeatingCardStyleInput
): SeatingCardStyleResult {
  const forEditor = input.forEditor ?? false;
  const backgroundClasses = getGenderBackgroundClasses(student, input.colorByGender, forEditor);
  const borderClasses = input.colorByLevel
    ? getLevelBorderClasses(student)
    : getThinGenderBorderClasses(student);

  return {
    backgroundClasses,
    borderClasses,
    className: `${backgroundClasses} ${borderClasses}`,
  };
}

export function getViewMultiSelectCardClasses(): string {
  return 'bg-yellow-200 border-yellow-400';
}

export function getEditorAboutToMoveCardClasses(): string {
  return 'bg-yellow-300 border-yellow-500 hover:bg-yellow-400';
}

export function getEditorBeingPlacedCardClasses(): string {
  return 'bg-blue-300 border-blue-500 hover:bg-blue-400';
}

export function getEditorSwapSelectedCardClasses(): string {
  return 'bg-yellow-300 border-yellow-500 hover:bg-yellow-400';
}
