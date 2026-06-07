import db from "../database/db.ts";

class Class {
	static async getClassById(id: string) {
		const queryText = `
        select *
				from classes
        where id = $1
      `;
		const response = await db.query(queryText, [id]);
		return response.rows[0];
	}
}

class Session {
	static async getSessionById(id: string) {
		const queryText = `
        select *
				from academic_sessions
        where id = $1
      `;
		const response = await db.query(queryText, [id]);
		return response.rows[0];
	}
}

class Department {
	static async getDepartmentById(id: string) {
		const queryText = `
        select id
				from departments
        where id = $1
      `;
		const response = await db.query(queryText, [id]);
		return response.rows[0].id;
	}
}

export { Class, Session, Department };
