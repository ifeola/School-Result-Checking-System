import type { Pool, PoolClient } from "pg";
import db from "../database/db.ts";
import type { teacher } from "../types/type.ts";
import type { QueryParams } from "../utils/pagination.ts";

class Teacher {
	userId: string;
	teacherNumber: string;
	firstName: string;
	middleName: string;
	lastName: string;
	phone: string;
	current_status: string;
	constructor(
		userId: string,
		teacherNumber: string,
		firstName: string,
		middleName: string,
		lastName: string,
		phone: string,
		current_status: string
	) {
		this.userId = userId;
		this.teacherNumber = teacherNumber;
		this.firstName = firstName;
		this.middleName = middleName;
		this.lastName = lastName;
		this.phone = phone;
		this.current_status = current_status;
	}

	static async create(user: teacher, client: PoolClient | Pool) {
		const queryText = `
      insert into staff(user_id, staff_number, middle_name, first_name, last_name, phone, current_status)
      values ($1, $2, $3, $4, $5, $6, $7)
      returning *
    `;

		const values = [
			user.userId,
			user.teacherNumber,
			user.firstName,
			user.middleName,
			user.lastName,
			user.phone,
			user.status,
		];
		const data = await client.query(queryText, values);
		return data.rows[0];
	}

	static async deleteById(id: string, client: Pool | PoolClient) {
		const queryText = `
			UPDATE staff
			SET deleted_at = CURRENT_TIMESTAMP
			WHERE id = $1
			returning id;
		`;
		const result = await client.query(queryText, [id]);
		return result.rows[0];
	}

	static async getAllTeachers({ limit, skip }: QueryParams) {
		const queryText = `
				select * from staff t
				left join users u
				on u.id = t.user_id
				where t.deleted_at is null
				limit $1 offset $2;
			`;
		const countQuery = `
			select count(*) from staff
			where deleted_at is null;
		`;
		const [teachers, teachersCount] = await Promise.all([
			await db.query(queryText, [limit, skip]),
			await db.query(countQuery),
		]);
		return {
			teachers: teachers.rows,
			teachersCount: parseInt(teachersCount.rows[0].count, 10),
		};
	}

	static async getTeacherById(id: string) {
		const queryText = `
      select t.id, t.user_id,
			t.teacher_number,
			t.first_name,
			t.middle_name,
			t.last_name,
			u.email,
			t.phone,
			u.role,
			t.deleted_at
			from staff t
			left join users u
				on u.id = t.user_id
			where t.id = $1
				or t.user_id = $1
    `;
		const result = await db.query(queryText, [id]);
		return result.rows[0];
	}
}

export default Teacher;
