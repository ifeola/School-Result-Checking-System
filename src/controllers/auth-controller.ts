import type { Response, Request } from "express";
import db from "../database/db.ts";

const login = async (req: Request, res: Response) => {
	const subjects = await db.query(`
    select * from subjects
    `);
	return res.status(200).json({ data: subjects.rows });
};

export { login };
