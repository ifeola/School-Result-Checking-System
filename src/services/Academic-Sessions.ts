import db from "../database/db.ts";

class AcademicSession {
	static async getCurrent() {
		const queryText = `
      SELECT session_name, term_name, starts_on, ends_on, is_current, position, updated_at
      FROM academic_periods
      JOIN terms
      ON terms.id = academic_periods.term_id
      WHERE is_current = TRUE;
    `;

		const response = await db.query(queryText);
		return response?.rows[0];
	}
}

export default AcademicSession;
