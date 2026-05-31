import type { Pool, PoolClient } from "pg";
import type { admin } from "../types/type.ts";

class Admin {
	userId: string;
	fullName: string;
	permissionLevel: "super_admin" | "staff_admin" | null;
	constructor(
		userId: string,
		fullName: string,
		permissionLevel: "super_admin" | "staff_admin" | null,
	) {
		this.userId = userId;
		this.fullName = fullName;
		this.permissionLevel = permissionLevel;
	}

	static async create(user: admin, client: PoolClient | Pool) {
		const queryText = `
      insert into admins(user_id, full_name, permission_level)
      values ($1, $2, $3)
      returning *
    `;

		const values = [user.userId, user.fullName, user.permissionLevel];
		const data = await client.query(queryText, values);
		return data.rows[0];
	}
}

export default Admin;
