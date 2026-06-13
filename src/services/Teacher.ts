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
	constructor(
		userId: string,
		teacherNumber: string,
		firstName: string,
		middleName: string,
		lastName: string,
		phone: string,
	) {
		this.userId = userId;
		this.teacherNumber = teacherNumber;
		this.firstName = firstName;
		this.middleName = middleName;
		this.lastName = lastName;
		this.phone = phone;
	}

	static async create(user: teacher, client: PoolClient | Pool) {
		const queryText = `
      insert into teachers(user_id, teacher_number, middle_name, first_name, last_name, phone)
      values ($1, $2, $3, $4, $5, $6)
      returning *
    `;

		const values = [
			user.userId,
			user.teacherNumber,
			user.firstName,
			user.middleName,
			user.lastName,
			user.phone,
		];
		const data = await client.query(queryText, values);
		return data.rows[0];
	}

	static async deleteById(id: string) {
		const queryText = `
			update current_teachers
			set deleted_at = current_timestamp
			where id = $1
			returning *;
		`;
		const result = await db.query(queryText, [id]);
		return result.rows[0];
	}

	static async getAllTeachers({ limit, skip }: QueryParams) {
		const queryText = `
				select * from teachers t
				left join users u
				on u.id = t.user_id
				where t.deleted_at is null
				limit $1 offset $2;
			`;
		const countQuery = `
			select count(*) from teachers
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
			from teachers t
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
