import db from "../database/db.ts";

class Assessment {
	static async getCurrentByAdmissionNumber(
		admissionNumber: string,
		queryParams: { term: string; session: string }
	) {
		let queryText = `
      select st.first_name, ap.session_name, tm.term_name, st.last_name, st.middle_name, st.admission_number,  cl.class_name, sj.subject_name, ass.assignment_score, ass.test_score, ass.exam_score, ass.total_score, ass.grade, ass.remark
        from assessments ass
      join students st
        on st.id = ass.student_id
      join subjects sj
        on sj.id = ass.subject_id
      join academic_periods ap
        on ap.id = ass.academic_period_id
      join terms tm
        on tm.id = ap.term_id
      join classes cl
        on cl.id = ass.class_id
      where st.admission_number = $1
    `;

		const conditions: string[] = [];
		const params: (string | number)[] = [admissionNumber];

		if (queryParams.term) {
			params.push(queryParams.term);
			conditions.push(`tm.term_name = $${params.length}`);
		}

		if (queryParams.session) {
			params.push(queryParams.session);
			conditions.push(`ap.session_name = $${params.length}`);
		}

		if (conditions.length === 0) {
			queryText += ` and ap.is_current = TRUE`;
		} else {
			queryText += ` and ${conditions.join(" and ")}`;
		}

		const response = await db.query(queryText, params);
		return response.rows;
	}

	static async getPreviousByAdmissionNumber(admissionNumber: string) {
		const queryText = `
      select st.first_name, ap.session_name, tm.term_name, st.last_name, st.middle_name, st.admission_number,  cl.class_name, sj.subject_name, ass.assignment_score, ass.test_score, ass.exam_score, ass.total_score, ass.grade, ass.remark
        from assessments ass
      join students st
        on st.id = ass.student_id
      join subjects sj
        on sj.id = ass.subject_id
      join academic_periods ap
        on ap.id = ass.academic_period_id
      join terms tm
        on tm.id = ap.term_id
      join classes cl
        on cl.id = ass.class_id
      where st.admission_number = $1
        and ap.position = (
          select aps.position from
          academic_periods aps
          where aps.is_current = TRUE
        ) - 1
        ORDER BY tm.term_name DESC;
    `;

		const response = await db.query(queryText, [admissionNumber]);
		return response.rows;
	}

	static async getCurrentPosition(admissionNumber: string) {
		const queryText = `select * from class_positions cp
      where cp.admission_number = $1;`;

		const response = await db.query(queryText, [admissionNumber]);
		return response.rows[0];
	}
}

export default Assessment;
