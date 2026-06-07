import type { Pool, PoolClient } from "pg";
import type { enrollment } from "../types/type.ts";

class Enrollment {
	studentId: string;
	classId: string;
	sessionId: string;
	departmentId: string;
	promoted: boolean;
	repeated: boolean;

	constructor(
		studentId: string,
		classId: string,
		sessionId: string,
		departmentId: string,
		promoted: boolean,
		repeated: boolean,
	) {
		this.studentId = studentId;
		this.classId = classId;
		this.sessionId = sessionId;
		this.departmentId = departmentId;
		this.promoted = promoted;
		this.repeated = repeated;
	}

	static async create(
		{ studentId, classId, sessionId, departmentId }: enrollment,
		client: Pool | PoolClient,
	) {
		const queryText = `
      insert into students_enrollments
        (student_id, class_id, session_id, department_id, promoted_to_next_class, repeated_class)
      values ($1, $2, $3, $4, $5, $6)
      returning *
    `;
		const values = [studentId, classId, sessionId, departmentId, false, false];
		const result = await client.query(queryText, values);
		return result.rows[0];
	}
}

export default Enrollment;
