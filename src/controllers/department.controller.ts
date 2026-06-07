import type { Request, Response, NextFunction } from "express";
import db from "../database/db.ts";

const getAllDepartments = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const result = await db.query(`select * from departments`);
		const departments = result.rows;
		return res.status(200).json({ success: true, data: { departments } });
	} catch (error) {
		next(error);
	}
};

export { getAllDepartments };
