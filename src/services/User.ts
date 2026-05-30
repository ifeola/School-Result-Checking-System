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

	static async getUserByIdentifier(identifier: string) {
		const queryText = `
			SELECT
				u.id,
				u.email,
				u.password_hash,
				u.role,
				s.admission_number
			FROM users u
			LEFT JOIN students s ON s.user_id = u.id
			WHERE u.email = $1
   			OR s.admission_number = $1;
		`;
		const result = await db.query(queryText, [identifier]);
		return result.rows[0];
	}
}

export default User;
