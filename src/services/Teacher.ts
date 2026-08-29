import type { Pool, PoolClient } from "pg";
import db from "../database/db.ts";
import type { teacher, TeacherQuery } from "../types/type.ts";
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
    current_status: string,
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
			SET deleted_at = CURRENT_TIMESTAMP,
			current_status = 'inactive'
			WHERE id = $1
			returning id;
		`;
    const result = await client.query(queryText, [id]);
    return result.rows[0];
  }

  static async getAllTeachers(
    { limit, skip }: QueryParams,
    query: TeacherQuery,
  ) {
    let queryText = `
				select t.id, t.staff_number, t.phone, t.current_status, t.first_name, t.last_name, t.middle_name, u.email, u.role, t.created_at from staff t
				left join users u
				on u.id = t.user_id
			`;
    let countQuery = `
			select count(*) from staff t
			left join users u
			on u.id = t.user_id
		`;

    let conditions: string[] = [];
    let params: (string | number)[] = [];

    if (query.search) {
      params.push(`%${query.search}%`);
      conditions.push(`
        (
        t.first_name ILIKE $${params.length}
        or t.last_name ILIKE $${params.length}
        or t.staff_number ILIKE $${params.length}
        )`);
    }

    if (query.status) {
      params.push(query.status);
      conditions.push(`t.current_status = $${params.length}`);
    }

    if (query.gender) {
      params.push(query.gender);
      conditions.push(`t.gender = $${params.length}`);
    }

    if (query.staff_number) {
      params.push(`%${query.staff_number}%`);
      conditions.push(`t.staff_number ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      queryText += ` where ${conditions.join(" and ")}`;
      countQuery += ` where ${conditions.join(" and ")}`;
    }

    const sortFields = [
      "current_status",
      "last_name",
      "first_name",
      "gender",
      "created_at",
      "staff_number",
    ];

    const sorted = sortFields.includes(query.sort as string)
      ? query.sort
      : "staff_number";
    const ordered = query.order === "asc" ? "ASC" : "DESC";
    queryText += ` order by t.${sorted} ${ordered}`;

    // Pagination
    if (limit > 0) {
      params.push(limit);
      queryText += ` LIMIT $${params.length}`;
    }
    params.push(skip);
    queryText += ` OFFSET $${params.length}`;

    const [teachers, teachersCount] = await Promise.all([
      await db.query(queryText, params),
      await db.query(countQuery, params.slice(0, params.length - 2)),
    ]);
    return {
      teachers: teachers.rows,
      teachersCount: parseInt(teachersCount.rows[0].count, 10),
    };
  }

  static async getTeacherById(id: string) {
    const queryText = `
      select t.id, t.user_id,
			t.staff_number,
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
