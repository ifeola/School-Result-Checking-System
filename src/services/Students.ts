import type { Pool, PoolClient } from "pg";
import db from "../database/db.ts";
import type { queryValue, student } from "../types/type.ts";
import type { QueryParams } from "../utils/pagination.ts";

class Student {
	public userId: string;
	public admissionNumber: string;
	public firstName: string;
	public lastName: string;
	public gender: "male" | "female";
	public dateOfBirth: Date;
	public parentName: string;
	public parentPhone: string;
	public currentStatus: "active" | "graduated" | "withdrawn";
	public middleName?: string | undefined;

	constructor(
		userId: string,
		admissionNumber: string,
		firstName: string,
		lastName: string,
		gender: "male" | "female",
		dateOfBirth: Date,
		parentName: string,
		parentPhone: string,
		currentStatus: "active" | "graduated" | "withdrawn",
		middleName?: string,
	) {
		// 2. Explicitly assign them
		this.userId = userId;
		this.admissionNumber = admissionNumber;
		this.firstName = firstName;
		this.lastName = lastName;
		this.gender = gender;
		this.dateOfBirth = dateOfBirth;
		this.parentName = parentName;
		this.parentPhone = parentPhone;
		this.currentStatus = currentStatus;
		this.middleName = middleName;
	}

	static async create(user: student, client: PoolClient | Pool) {
		const queryText = `insert into students(user_id, admission_number, first_name, last_name, gender, date_of_birth, parent_name, parent_phone, current_status, middle_name) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      returning id, admission_number, first_name, last_name, gender, to_char(date_of_birth, 'YYYY-MM-DD') as date_of_birth, current_status, middle_name;`;
		const values = [
			user.userId,
			user.admissionNumber,
			user.firstName,
			user.lastName,
			user.gender,
			user.dateOfBirth,
			user.parentName,
			user.parentPhone,
			user.currentStatus,
			user.middleName ?? null,
		];
		const data = await client.query(queryText, values);
		return data.rows[0];
	}

	static async getStudentById(id: string) {
		const queryText = `
      select * from current_students
      where id = $1;
    `;
		const result = await db.query(queryText, [id]);
		return result.rows[0];
	}

	static async getStudentByAdmissionNumber(admissionNumber: string) {
		const queryText = `
      select admission_number from students
      where admission_number = $1;
    `;
		const result = await db.query(queryText, [admissionNumber]);
		return result.rows;
	}

	static async deleteStudentById(id: string, client: Pool | PoolClient) {
		const queryText = `
			UPDATE students
			SET deleted_at = CURRENT_TIMESTAMP,
			current_status = 'withdrawn'
			WHERE id = $1
			returning id;
    `;
		const result = await client.query(queryText, [id]);
		return result.rows[0];
	}

	static async updateStudent(id: string, updates: Partial<student>) {
		const keys = Object.keys(updates);

		if (keys.length === 0) {
			return null;
		}

		const setClause = keys
			.map((key, index) => `${key} = $${index + 1}`)
			.join(", ");

		const values = [...Object.values(updates), id] as queryValue;
		const queryString = `
			update students
			set ${setClause}
			where id = $${values.length}
			returning *;
		`;

		const result = await db.query(queryString, values);
		return result.rows[0];
	}

	static async getAllStudents({ limit, skip }: QueryParams, query: any) {
		let queryText = `
      select s.id, s.user_id,
			s.admission_number,
			s.first_name,
			s.last_name,
			s.middle_name,
			s.gender,
			to_char(s.date_of_birth, 'YYYY-MM-DD'),
			s.parent_name,
			s.parent_phone,
			s.current_status,
			cl.class_name,
			de.department_name
			from students s
			left join students_enrollments se
				on se.student_id = s.id
			left join classes cl
				on se.class_id = cl.id
			left join departments de
				on se.department_id = de.id
    `;
		const countQuery = `SELECT COUNT(*) FROM students;`;
		const params = [];
		let paramCount = 0;

		if (query.search) {
			paramCount++;
			queryText += ` WHERE s.first_name LIKE $${paramCount}
				OR s.last_name LIKE $${paramCount}
				OR s.admission_number LIKE $${paramCount}
			`;
			params.push(query.search);
		}

		if (query.current_status) {
			paramCount++;
			queryText += `
				AND s.current_status = $${paramCount}
			`;
			params.push(query.current_status);
		}

		if (query.gender) {
			paramCount++;
			queryText += `
				AND s.gender = $${paramCount}
			`;
			params.push(query.gender);
		}

		if (query.class_name) {
			console.log(query.class_name);
			paramCount++;
			queryText += `
				AND cl.class_name = $${paramCount}
			`;
			params.push(query.class_name);
		}

		if (query.department_name) {
			paramCount++;
			queryText += `
				AND s.department_name = $${paramCount}
			`;
			params.push(query.department_name);
		}

		// Sorting
		const sortBy = query.sort_by || "created_at";
		const sortOrder = query.sort_order === "asc" ? "ASC" : "DESC";
		queryText += ` ORDER BY s.${sortBy} ${sortOrder}`;

		// Pagination
		paramCount++;
		queryText += ` LIMIT $${paramCount}`;
		params.push(limit);
		paramCount++;
		queryText += ` OFFSET $${paramCount}`;
		params.push(skip);

		const [dataResult, countResult] = await Promise.all([
			db.query(queryText, params),
			db.query(countQuery),
		]);

		return {
			students: dataResult.rows,
			totalCount: parseInt(countResult.rows[0].count, 10),
		};
	}
}

export default Student;
