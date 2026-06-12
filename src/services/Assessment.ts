import db from "../database/db.ts";

class Assessment {
	static async getById(id: string) {
		const queryText = `
      select cl.class_name, tm.term_name, ascc.session_name, sj.subject_name, ass.assignment_score, ass.test_score, ass.total_score, ass.grade, ass.remark
        from assessments ass
      left join subjects sj
        on sj.id = ass.subject_id
      left join academic_sessions ascc
        on ascc.id = ass.session_id
      left join terms tm
        on tm.id = ass.term_id
      left join classes cl
        on cl.id = ass.class_id
      where ass.student_id = $1;
    `;

		const response = await db.query(queryText, [id]);
		return response.rows;
	}
}

export default Assessment;
