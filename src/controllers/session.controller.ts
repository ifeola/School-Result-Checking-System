import type { Request, Response, NextFunction } from "express";
import db from "../database/db.ts";

const getAllSessions = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const result = await db.query(
			`select distinct session_name from academic_periods`
		);
		const sessions = result.rows;
		return res.status(200).json({ success: true, data: { sessions } });
	} catch (error) {
		next(error);
	}
};

export { getAllSessions };
