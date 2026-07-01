import db from "../database/db.ts";
import type { StudentQuery } from "../types/type.ts";
import type { QueryParams } from "../utils/pagination.ts";

class Assessment {
	static async getCurrentByAdmissionNumber(
		admissionNumber: string,
		queryParams: { term: string; session: string },
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
	static async getAllResults(
		{ limit, skip }: QueryParams,
		query: StudentQuery,
	) {
		let queryText = `
      SELECT 
        st.first_name,
        st.middle_name,
        st.last_name,
        st.gender,
        st.admission_number,
        ap.session_name,
        tm.term_name,
        dp.department_name,
        cl.class_name,
        sj.subject_name,
        ass.assignment_score,
        ass.test_score,
        ass.exam_score,
        ass.total_score,
        ass.grade,
        ass.remark
      FROM assessments ass
      JOIN students st
        ON st.id = ass.student_id
      JOIN subjects sj
        ON sj.id = ass.subject_id
      JOIN academic_periods ap
        ON ap.id = ass.academic_period_id
      JOIN terms tm
        ON tm.id = ap.term_id
      JOIN classes cl
        ON cl.id = ass.class_id
      JOIN students_enrollments se
        ON se.student_id = st.id
      LEFT JOIN departments dp        
        ON dp.id = se.department_id
    `;

		let countQuery = `select count(st.id) 
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
      join students_enrollments se
        on se.student_id = st.id
      left join departments dp
        on dp.id = se.department_id
	`;

		const conditions: string[] = [];
		const params: (string | number)[] = [];

		if (query.search) {
			params.push(`%${query.search}%`);
			conditions.push(`
       ( st.first_name ilike $${params.length}
        or st.middle_name ilike $${params.length}
        or st.last_name ilike $${params.length}
        )
        `);
		}

		if (query.term_name) {
			params.push(query.term_name);
			conditions.push(`tm.term_name = $${params.length}`);
		}

		if (query.session_name) {
			params.push(query.session_name);
			conditions.push(`ap.session_name = $${params.length}`);
		}

		if (query.admission_number) {
			params.push(query.admission_number);
			conditions.push(`st.admission_number = $${params.length}`);
		}

		if (query.class_name) {
			params.push(query.class_name);
			conditions.push(`cl.class_name = $${params.length}`);
		}

		if (query.department_name) {
			params.push(query.department_name);
			conditions.push(`dp.department_name = $${params.length}`);
		}

		if (conditions.length > 0) {
			const whereClause = `where ${conditions.join(" and ")}`;
			queryText += whereClause;
			countQuery += whereClause;
		}

		// Sorting
		const allowedSortFields = [
			"created_at",
			"first_name",
			"last_name",
			"admission_number",
			"current_status",
		];
		const sortBy = allowedSortFields.includes(query.sort_by as string)
			? query.sort_by
			: "admission_number";
		const sortOrder = query.sort_order === "asc" ? "ASC" : "DESC";
		queryText += ` ORDER BY st.${sortBy} ${sortOrder}`;

		// Pagination
		params.push(limit);
		queryText += ` LIMIT $${params.length}`;
		params.push(skip);
		queryText += ` OFFSET $${params.length}`;

		const [response, totalRecords] = await Promise.all([
			db.query(queryText, params),
			db.query(countQuery, params.slice(0, params.length - 2)),
		]);
		return {
			results: response.rows,
			totalRecords: parseInt(totalRecords.rows[0].count, 10),
		};
	}
}

export default Assessment;
