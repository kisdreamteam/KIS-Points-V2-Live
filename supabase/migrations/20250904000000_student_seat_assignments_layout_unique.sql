-- One seat assignment per student per seating layout (chart).
-- Denormalizes seating_chart_id onto student_seat_assignments for enforcement.

ALTER TABLE student_seat_assignments
ADD COLUMN IF NOT EXISTS seating_chart_id uuid;

UPDATE student_seat_assignments ssa
SET seating_chart_id = sg.seating_chart_id
FROM seating_groups sg
WHERE sg.id = ssa.seating_group_id
  AND ssa.seating_chart_id IS NULL;

-- Remove rows that cannot be tied to a layout (orphaned group references).
DELETE FROM student_seat_assignments
WHERE seating_chart_id IS NULL;

-- Keep one row per (student_id, seating_chart_id): prefer newest created_at, then highest id.
DELETE FROM student_seat_assignments
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY student_id, seating_chart_id
        ORDER BY created_at DESC NULLS LAST, id DESC
      ) AS rn
    FROM student_seat_assignments
  ) ranked
  WHERE rn > 1
);

ALTER TABLE student_seat_assignments
ALTER COLUMN seating_chart_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'student_seat_assignments_seating_chart_id_fkey'
  ) THEN
    ALTER TABLE student_seat_assignments
    ADD CONSTRAINT student_seat_assignments_seating_chart_id_fkey
    FOREIGN KEY (seating_chart_id) REFERENCES seating_charts(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'student_seat_assignments_student_layout_unique'
  ) THEN
    ALTER TABLE student_seat_assignments
    ADD CONSTRAINT student_seat_assignments_student_layout_unique
    UNIQUE (student_id, seating_chart_id);
  END IF;
END $$;
