import type { Pool, PoolClient } from "pg";
import db from "../database/db.ts";
import type { user } from "../types/type.ts";

class User {
	public role: "admin" | "teacher" | "student";
	public password: string;
	public email?: string | undefined;

	constructor(
		role: "admin" | "teacher" | "student",
		password: string,
		email?: string,
	) {
		this.role = role;
		this.password = password;
		this.email = email;
	}

	static async create(user: user, client: PoolClient | Pool) {
		const queryText =
			"insert into users(email, password_hash, role) values($1, $2, $3) returning id";
		const values = [user.email ?? null, user.password, user.role];
		const result = await client.query(queryText, values);

		return result.rows[0];
	}

	static async getAllUsers() {
		const queryText = `
			select 
		`
	} 

	static async getUserByIdentifier(identifier: string) {
		const queryText = `
			SELECT
				u.id,
				u.email,
				COALESCE(s.first_name, t.first_name, a.first_name) AS first_name,
    		COALESCE(s.last_name, t.last_name, a.last_name) AS last_name,
				COALESCE(s.middle_name, t.middle_name, a.middle_name) AS middle_name,
				u.password_hash,
				u.role,
				s.admission_number,
        a.permission_level
			FROM users u
			LEFT JOIN students s ON s.user_id = u.id
      LEFT JOIN admins a on a.user_id = u.id
			LEFT JOIN teachers t on t.user_id = u.id
			WHERE u.email = $1
   			OR s.admission_number = $1
				or t.teacher_number = $1
			AND u.deleted_at IS NULL;
		`;
		const result = await db.query(queryText, [identifier]);
		return result.rows[0];
	}

	static async deleteUserById(id: string, client: Pool | PoolClient) {
		const queryText = `
			update users
			set deleted_at = CURRENT_TIMESTAMP
			where id = $1
			returning id;
		`;
		const result = await client.query(queryText, [id]);
		return result.rows[0];
	}
}

export default User;
