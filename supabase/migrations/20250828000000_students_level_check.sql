-- English level on students: nullable, constrained to A/B/C/D/FC.
-- Column is assumed to already exist; this migration adds validation only.

ALTER TABLE public.students
  DROP CONSTRAINT IF EXISTS students_level_check;

ALTER TABLE public.students
  ADD CONSTRAINT students_level_check
  CHECK (level IS NULL OR level IN ('A', 'B', 'C', 'D', 'FC'));
