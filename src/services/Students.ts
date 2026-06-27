import type { Pool, PoolClient } from "pg";
import db from "../database/db.ts";
import type { queryValue, student, StudentQuery } from "../types/type.ts";
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
		middleName?: string
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
      select s.id, s.user_id,
			s.admission_number,
			s.first_name,
			s.last_name,
			s.middle_name,
			s.gender,
			to_char(s.date_of_birth, 'YYYY-MM-DD') as date_of_birth,
			s.parent_name,
			s.parent_phone,
			s.current_status,
			cl.class_name,
			de.department_name,
			u.role,
			s.deleted_at
			from students s
			left join students_enrollments se
				on se.student_id = s.id
			left join users u
				on u.id = s.user_id
			left join classes cl
				on se.class_id = cl.id
			left join departments de
				on se.department_id = de.id
			where s.id = $1
				or s.user_id = $1
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

	static async getAllStudents(
		{ limit, skip }: QueryParams,
		query: StudentQuery
	) {
		let queryText = `
      select s.id, s.user_id,
			s.admission_number,
			s.first_name,
			s.last_name,
			s.middle_name,
			s.gender,
			to_char(s.date_of_birth, 'YYYY-MM-DD') as date_of_birth,
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
		let countQuery = `SELECT COUNT(DISTINCT s.id) FROM students s
			left join students_enrollments se
					on se.student_id = s.id
			left join classes cl
				on se.class_id = cl.id
			left join departments de
				on se.department_id = de.id
	`;
		const conditions: string[] = [];
		const params: (string | number)[] = [];

		if (query.search) {
			params.push(`%${query.search}%`);
			conditions.push(`
    (
      s.first_name ILIKE $${params.length}
      OR s.last_name ILIKE $${params.length}
      OR s.admission_number ILIKE $${params.length}
    )
  `);
		}

		if (query.current_status) {
			params.push(query.current_status);
			conditions.push(`s.current_status = $${params.length}`);
		}

		if (query.gender) {
			params.push(query.gender);
			conditions.push(`s.gender = $${params.length}`);
		}

		if (query.class_name) {
			params.push(query.class_name);
			conditions.push(`cl.class_name = $${params.length}`);
		}

		if (query.department_name) {
			params.push(query.department_name);
			conditions.push(`de.department_name = $${params.length}`);
		}

		if (conditions.length > 0) {
			const whereClause = ` WHERE ${conditions.join(" AND ")}`;
			countQuery += whereClause;
			queryText += whereClause;
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
		const sortOrder = query.sort_order === "desc" ? "DESC" : "ASC";
		queryText += ` ORDER BY s.${sortBy} ${sortOrder}`;

		// Pagination
		params.push(limit);
		queryText += ` LIMIT $${params.length}`;
		params.push(skip);
		queryText += ` OFFSET $${params.length}`;

		const [dataResult, countResult] = await Promise.all([
			db.query(queryText, params),
			db.query(countQuery, params.slice(0, params.length - 2)),
		]);

		return {
			students: dataResult.rows,
			totalCount: parseInt(countResult.rows[0].count, 10),
		};
	}
}

export default Student;
