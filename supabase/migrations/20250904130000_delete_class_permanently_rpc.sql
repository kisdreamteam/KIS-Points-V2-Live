-- Permanent class deletion in one transaction (owner only).
-- Explicit deletes so orphaned ledgers/seating/attendance cannot remain when
-- remote FK cascade rules are incomplete or unknown.
-- Depends on: public.is_class_owner(uuid)

CREATE OR REPLACE FUNCTION public.delete_class_permanently(p_class_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_class_id IS NULL THEN
    RAISE EXCEPTION 'class id is required';
  END IF;

  IF NOT public.is_class_owner(p_class_id) THEN
    RAISE EXCEPTION 'not authorized to delete this class'
      USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.classes c WHERE c.id = p_class_id) THEN
    RETURN;
  END IF;

  -- Seating (assignments → groups → charts)
  DELETE FROM public.student_seat_assignments
  WHERE seating_chart_id IN (
    SELECT sc.id FROM public.seating_charts sc WHERE sc.class_id = p_class_id
  );

  DELETE FROM public.seating_groups
  WHERE seating_chart_id IN (
    SELECT sc.id FROM public.seating_charts sc WHERE sc.class_id = p_class_id
  );

  DELETE FROM public.seating_charts WHERE class_id = p_class_id;

  -- Attendance
  DELETE FROM public.attendance_events WHERE class_id = p_class_id;

  -- Point ledgers (before categories / students)
  DELETE FROM public.point_events
  WHERE student_id IN (
    SELECT s.id FROM public.students s WHERE s.class_id = p_class_id
  );

  DELETE FROM public.custom_point_events
  WHERE student_id IN (
    SELECT s.id FROM public.students s WHERE s.class_id = p_class_id
  );

  DELETE FROM public.point_categories WHERE class_id = p_class_id;

  DELETE FROM public.class_collaborators WHERE class_id = p_class_id;

  DELETE FROM public.students WHERE class_id = p_class_id;

  DELETE FROM public.classes WHERE id = p_class_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_class_permanently(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_class_permanently(uuid) TO authenticated;
