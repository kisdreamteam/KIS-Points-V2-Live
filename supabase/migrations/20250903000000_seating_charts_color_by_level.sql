-- Color by Level view setting on seating layouts (idempotent for envs that already have the column).
ALTER TABLE seating_charts
  ADD COLUMN IF NOT EXISTS color_by_level boolean NOT NULL DEFAULT false;
