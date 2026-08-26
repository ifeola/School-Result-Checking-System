import type { Request, Response, NextFunction } from "express";
import AcademicSession from "../services/Academic-Sessions.ts";
import db from "../database/db.ts";

const getCurrentAcademicSession = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const result = await AcademicSession.getCurrent();
	res.status(200).json({ success: true, current_session: { result } });
};

const getAllSessions = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const result = await db.query(
		`select distinct session_name from academic_periods;`
	);
	const sessions = result.rows;
	return res.status(200).json({ success: true, data: { sessions } });
};

export { getCurrentAcademicSession, getAllSessions };
