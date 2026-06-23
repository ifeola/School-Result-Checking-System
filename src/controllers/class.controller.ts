import type { Request, Response, NextFunction } from "express";
import db from "../database/db.ts";

const getAllClasses = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const result = await db.query(`select * from classes`);
	const classes = result.rows;
	return res.status(200).json({ success: true, data: { classes } });
};

export { getAllClasses };
