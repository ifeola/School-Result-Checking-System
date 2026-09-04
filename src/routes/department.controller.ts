import type { Request, Response, NextFunction } from "express";
import db from "../database/db.ts";

const getAllDepartments = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const result = await db.query(`select * from departments`);
	const departments = result.rows;
	return res.status(200).json({ success: true, data: { departments } });
};

export { getAllDepartments };
