-- =====================================================================
-- Feature: Auto-recalculating student results (average score + position)
-- =====================================================================
--
-- ASSUMPTIONS (please confirm these match your intent):
--
-- 1. Position scope: ranked WITHIN (class_id, department_id) together,
--    for a given academic_period. For classes with departments (e.g.
--    SS1 Science/Commercial/Arts), each department is ranked on its
--    own. For classes with no department (department_id IS NULL, e.g.
--    JSS1-3), all students in the class are ranked together as one
--    group — NULL is treated as its own group, not merged with anyone.
--
-- 2. Tie handling: uses RANK() -> tied students share a position, and
--    the next position number is skipped (e.g. 1, 2, 2, 4).
--
-- 3. Missing subject scores count as 0 in the average. Since there is
--    no explicit "class_subjects" table in the current schema, the
--    "subject universe" for a (class, department, period) group is
--    inferred as the DISTINCT subjects that have actually been
--    assessed for ANY student in that group. If a student has no row
--    for one of those subjects, their average denominator still
--    includes it (effectively scoring 0 on it). If you later add an
--    explicit class_subjects/curriculum table, swap the subject-count
--    subquery in fn_recalc_group_results to read from that table
--    instead — the rest of the logic won't change.
--
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Results table
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students_results (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id         UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  academic_period_id UUID NOT NULL REFERENCES academic_periods(id) ON DELETE RESTRICT,
  class_id           UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  department_id      UUID REFERENCES departments(id) ON DELETE RESTRICT, -- NULL = class has no departments
  total_score        INT NOT NULL DEFAULT 0,
  subjects_offered   INT NOT NULL DEFAULT 0,  -- size of the inferred subject universe for the group
  subjects_taken     INT NOT NULL DEFAULT 0,  -- how many of those the student actually has a score for
  average_score      NUMERIC(5,2) NOT NULL DEFAULT 0,
  position           INT,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT NULL,
  CONSTRAINT uq_result_student_period UNIQUE (student_id, academic_period_id)
);

CREATE INDEX IF NOT EXISTS idx_results_group_period
  ON students_results (class_id, department_id, academic_period_id);

CREATE INDEX IF NOT EXISTS idx_results_student_period
  ON students_results (student_id, academic_period_id);

CREATE TRIGGER trg_students_results_updated_at
BEFORE UPDATE ON students_results
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------
-- 2. Recalculate every student's average + position for one
--    (class, department, period) group. p_department_id may be NULL.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_recalc_group_results(
  p_class_id UUID,
  p_department_id UUID,
  p_academic_period_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_subjects_offered INT;
BEGIN
  -- Subject universe: distinct subjects assessed for this group in this period
  SELECT COUNT(DISTINCT sa.subject_id)
  INTO v_subjects_offered
  FROM students_assessments sa
  JOIN students_enrollments se
    ON se.student_id = sa.student_id
   AND se.academic_period_id = sa.academic_period_id
  WHERE se.class_id = p_class_id
    AND se.department_id IS NOT DISTINCT FROM p_department_id
    AND sa.academic_period_id = p_academic_period_id
    AND sa.deleted_at IS NULL
    AND se.deleted_at IS NULL;

  -- Upsert one row per actively-enrolled student in this group
  INSERT INTO students_results (
    student_id, academic_period_id, class_id, department_id,
    total_score, subjects_offered, subjects_taken, average_score
  )
  SELECT
    se.student_id,
    p_academic_period_id,
    p_class_id,
    p_department_id,
    COALESCE(SUM(sa.total_score), 0),
    v_subjects_offered,
    COUNT(sa.id),
    CASE
      WHEN v_subjects_offered > 0
        THEN ROUND(COALESCE(SUM(sa.total_score), 0)::NUMERIC / v_subjects_offered, 2)
      ELSE 0
    END
  FROM students_enrollments se
  LEFT JOIN students_assessments sa
    ON sa.student_id = se.student_id
   AND sa.academic_period_id = se.academic_period_id
   AND sa.deleted_at IS NULL
  WHERE se.class_id = p_class_id
    AND se.department_id IS NOT DISTINCT FROM p_department_id
    AND se.academic_period_id = p_academic_period_id
    AND se.deleted_at IS NULL
  GROUP BY se.student_id
  ON CONFLICT (student_id, academic_period_id)
  DO UPDATE SET
    total_score       = EXCLUDED.total_score,
    subjects_offered   = EXCLUDED.subjects_offered,
    subjects_taken     = EXCLUDED.subjects_taken,
    average_score       = EXCLUDED.average_score,
    class_id            = EXCLUDED.class_id,
    department_id       = EXCLUDED.department_id,
    updated_at          = now();

  -- Re-rank the whole group. RANK() = ties share a position,
  -- next position skips (1, 2, 2, 4).
  UPDATE students_results sr
  SET position = ranked.pos,
      updated_at = now()
  FROM (
    SELECT id, RANK() OVER (ORDER BY average_score DESC) AS pos
    FROM students_results
    WHERE class_id = p_class_id
      AND department_id IS NOT DISTINCT FROM p_department_id
      AND academic_period_id = p_academic_period_id
  ) ranked
  WHERE sr.id = ranked.id;
END;
$$ LANGUAGE plpgsql;


-- ---------------------------------------------------------------------
-- 3. Trigger: any insert/update/delete on students_assessments
--    (including soft-deletes via deleted_at) cascades a recalc
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_fn_students_assessments_recalc()
RETURNS TRIGGER AS $$
DECLARE
  v_class_id UUID;
  v_department_id UUID;
  v_old_class_id UUID;
  v_old_department_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT class_id, department_id INTO v_class_id, v_department_id
    FROM students_enrollments
    WHERE student_id = OLD.student_id
      AND academic_period_id = OLD.academic_period_id
      AND deleted_at IS NULL
    LIMIT 1;

    IF v_class_id IS NOT NULL THEN
      PERFORM fn_recalc_group_results(v_class_id, v_department_id, OLD.academic_period_id);
    END IF;

    RETURN OLD;
  END IF;

  -- INSERT or UPDATE
  SELECT class_id, department_id INTO v_class_id, v_department_id
  FROM students_enrollments
  WHERE student_id = NEW.student_id
    AND academic_period_id = NEW.academic_period_id
    AND deleted_at IS NULL
  LIMIT 1;

  IF v_class_id IS NOT NULL THEN
    PERFORM fn_recalc_group_results(v_class_id, v_department_id, NEW.academic_period_id);
  END IF;

  -- Edge case: if an UPDATE moved the row to a different student/period,
  -- also recalc the group it left behind.
  IF TG_OP = 'UPDATE' AND (
       OLD.student_id IS DISTINCT FROM NEW.student_id
    OR OLD.academic_period_id IS DISTINCT FROM NEW.academic_period_id
  ) THEN
    SELECT class_id, department_id INTO v_old_class_id, v_old_department_id
    FROM students_enrollments
    WHERE student_id = OLD.student_id
      AND academic_period_id = OLD.academic_period_id
      AND deleted_at IS NULL
    LIMIT 1;

    IF v_old_class_id IS NOT NULL THEN
      PERFORM fn_recalc_group_results(v_old_class_id, v_old_department_id, OLD.academic_period_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_students_assessments_recalc
AFTER INSERT OR UPDATE OR DELETE ON students_assessments
FOR EACH ROW
EXECUTE FUNCTION trg_fn_students_assessments_recalc();