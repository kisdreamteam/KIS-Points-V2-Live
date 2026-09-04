-- Grant class owner + collaborators access to point event ledgers via the student's class.
-- Uses SECURITY DEFINER helpers from prior migration:
--   public.is_class_owner(uuid)
--   public.is_collaborator_for_class(uuid)
--
-- Ledgers have student_id (not class_id). Append-only for point_events (no UPDATE/DELETE).
-- custom_point_events allows DELETE for points-reset flows.

CREATE OR REPLACE FUNCTION public.can_access_student(p_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.students s
    WHERE s.id = p_student_id
      AND (
        public.is_class_owner(s.class_id)
        OR public.is_collaborator_for_class(s.class_id)
      )
  );
$$;

REVOKE ALL ON FUNCTION public.can_access_student(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_student(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- point_events
-- ---------------------------------------------------------------------------

ALTER TABLE public.point_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS point_events_select_owner_or_collaborator ON public.point_events;
CREATE POLICY point_events_select_owner_or_collaborator
  ON public.point_events
  FOR SELECT
  TO authenticated
  USING (public.can_access_student(student_id));

DROP POLICY IF EXISTS point_events_insert_owner_or_collaborator ON public.point_events;
CREATE POLICY point_events_insert_owner_or_collaborator
  ON public.point_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    teacher_id = auth.uid()
    AND public.can_access_student(student_id)
  );

-- ---------------------------------------------------------------------------
-- custom_point_events
-- ---------------------------------------------------------------------------

ALTER TABLE public.custom_point_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS custom_point_events_select_owner_or_collaborator ON public.custom_point_events;
CREATE POLICY custom_point_events_select_owner_or_collaborator
  ON public.custom_point_events
  FOR SELECT
  TO authenticated
  USING (public.can_access_student(student_id));

DROP POLICY IF EXISTS custom_point_events_insert_owner_or_collaborator ON public.custom_point_events;
CREATE POLICY custom_point_events_insert_owner_or_collaborator
  ON public.custom_point_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    teacher_id = auth.uid()
    AND public.can_access_student(student_id)
  );

DROP POLICY IF EXISTS custom_point_events_delete_owner_or_collaborator ON public.custom_point_events;
CREATE POLICY custom_point_events_delete_owner_or_collaborator
  ON public.custom_point_events
  FOR DELETE
  TO authenticated
  USING (public.can_access_student(student_id));
