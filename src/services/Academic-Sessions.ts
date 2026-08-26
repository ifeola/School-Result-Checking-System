import db from "../database/db.ts";

class AcademicSession {
	static async getCurrent() {
		const queryText = `
      SELECT ap.id, ap.session_name, terms.term_name, ap.starts_on, ap.ends_on, ap.is_current, ap.sequence_no, ap.updated_at
      FROM academic_periods ap
      JOIN terms
      ON terms.id = ap.term_id
      WHERE ap.is_current = TRUE;
    `;

		const response = await db.query(queryText);
		return response?.rows[0];
	}
}

export default AcademicSession;
