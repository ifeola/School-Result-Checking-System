import db from "../database/db.ts";

class Assessment {
	static async getByAdmissionNumber(admissionNumber: string) {
		const queryText = `
      select st.first_name, st.last_name, st.middle_name, st.admission_number,  cl.class_name, tm.term_name, ascc.session_name, sj.subject_name, ass.assignment_score, ass.test_score, ass.exam_score, ass.total_score, ass.grade, ass.remark
        from assessments ass
      left join students st
        on st.id = ass.student_id
      left join subjects sj
        on sj.id = ass.subject_id
      left join academic_sessions ascc
        on ascc.id = ass.session_id
      left join terms tm
        on tm.id = ass.term_id
      left join classes cl
        on cl.id = ass.class_id
      where st.admission_number = $1;
    `;

		const response = await db.query(queryText, [admissionNumber]);
		return response.rows;
	}
}

export default Assessment;
