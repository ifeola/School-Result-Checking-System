import type { Pool, PoolClient } from "pg";
import type { admin } from "../types/type.ts";

class Admin {
	userId: string;
	firstName: string;
	middleName: string;
	lastName: string;
	permissionLevel: "super_admin" | "staff_admin" | null;
	constructor(
		userId: string,
		firstName: string,
		middleName: string,
		lastName: string,
		permissionLevel: "super_admin" | "staff_admin" | null,
	) {
		this.userId = userId;
		this.firstName = firstName;
		this.middleName = firstName;
		this.lastName = firstName;
		this.permissionLevel = permissionLevel;
	}

	static async create(user: admin, client: PoolClient | Pool) {
		const queryText = `
      insert into admins(user_id, first_name, middle_name, last_name, permission_level)
      values ($1, $2, $3, $4, $5)
      returning *
    `;

		const values = [
			user.userId,
			user.firstName,
			user.middleName,
			user.lastName,
			user.permissionLevel,
		];
		const data = await client.query(queryText, values);
		return data.rows[0];
	}
}

export default Admin;
