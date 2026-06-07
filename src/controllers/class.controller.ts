import type { Request, Response, NextFunction } from "express";
import db from "../database/db.ts";

const getAllClasses = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const result = await db.query(`select * from classes`);
		const classes = result.rows;
		return res.status(200).json({ success: true, data: { classes } });
	} catch (error) {
		next(error);
	}
};

export { getAllClasses };
