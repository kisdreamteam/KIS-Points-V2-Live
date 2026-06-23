-- Stable display order for point_categories (General = 0, others append by creation order).

ALTER TABLE public.point_categories
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Archive duplicate "General" rows per class+type (keep lowest id).
WITH general_duplicates AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY class_id, COALESCE(type, CASE WHEN points >= 0 THEN 'positive' ELSE 'negative' END)
      ORDER BY id ASC
    ) AS rn
  FROM public.point_categories
  WHERE COALESCE(is_archived, false) = false
    AND lower(trim(name)) = 'general'
)
UPDATE public.point_categories AS pc
SET is_archived = true
FROM general_duplicates AS gd
WHERE pc.id = gd.id
  AND gd.rn > 1;

-- Backfill sort_order per class + type group.
DO $$
DECLARE
  grp RECORD;
  row_rec RECORD;
  general_id uuid;
  next_order integer;
  resolved_type text;
BEGIN
  FOR grp IN
    SELECT DISTINCT
      class_id,
      COALESCE(type, CASE WHEN points >= 0 THEN 'positive' ELSE 'negative' END) AS category_type
    FROM public.point_categories
    WHERE COALESCE(is_archived, false) = false
  LOOP
    SELECT pc.id
    INTO general_id
    FROM public.point_categories AS pc
    WHERE pc.class_id = grp.class_id
      AND COALESCE(pc.is_archived, false) = false
      AND lower(trim(pc.name)) = 'general'
      AND COALESCE(pc.type, CASE WHEN pc.points >= 0 THEN 'positive' ELSE 'negative' END) = grp.category_type
    ORDER BY pc.id ASC
    LIMIT 1;

    IF general_id IS NOT NULL THEN
      UPDATE public.point_categories
      SET sort_order = 0
      WHERE id = general_id;

      next_order := 1;
      FOR row_rec IN
        SELECT pc.id
        FROM public.point_categories AS pc
        WHERE pc.class_id = grp.class_id
          AND COALESCE(pc.is_archived, false) = false
          AND COALESCE(pc.type, CASE WHEN pc.points >= 0 THEN 'positive' ELSE 'negative' END) = grp.category_type
          AND pc.id <> general_id
        ORDER BY pc.id ASC
      LOOP
        UPDATE public.point_categories
        SET sort_order = next_order
        WHERE id = row_rec.id;
        next_order := next_order + 1;
      END LOOP;
    ELSE
      next_order := 0;
      FOR row_rec IN
        SELECT pc.id
        FROM public.point_categories AS pc
        WHERE pc.class_id = grp.class_id
          AND COALESCE(pc.is_archived, false) = false
          AND COALESCE(pc.type, CASE WHEN pc.points >= 0 THEN 'positive' ELSE 'negative' END) = grp.category_type
        ORDER BY pc.id ASC
      LOOP
        UPDATE public.point_categories
        SET sort_order = next_order
        WHERE id = row_rec.id;
        next_order := next_order + 1;
      END LOOP;
    END IF;
  END LOOP;
END $$;
