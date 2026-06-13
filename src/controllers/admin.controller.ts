import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { matchedData, validationResult } from "express-validator";
import { ValidationError } from "../services/Custom-Errors.ts";
import db from "../database/db.ts";
import User from "../services/User.ts";
import Admin from "../services/Admin.ts";

const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
	const error = validationResult(req);
	if (!error.isEmpty()) {
		return next(new ValidationError(error.array()));
	}

	const data = matchedData(req);

	// Check if email already exists
	const existingAdmin = await User.getUserByIdentifier(data.email);
	if (existingAdmin) {
		return next(new ValidationError("Email already exists."));
	}

	const ROLE = "admin";
	const hashedPassword = await bcrypt.hash(data.lastName, 10);
	const client = await db.sql.connect();

	try {
		await client.query("BEGIN");
		const userData = await User.create(
			{
				email: data.email,
				password: hashedPassword,
				role: ROLE,
			},
			client,
		);

		const adminData = await Admin.create(
			{
				userId: userData.id,
				firstName: data.firstName,
				middleName: data.middleName,
				lastName: data.lastName,
				permissionLevel: data.permissionLevel,
			},
			client,
		);

		await client.query("COMMIT");
		return res.status(201).json({
			success: true,
			message: `Admin successfully added with ${userData.permission_level}`,
			data: {
				admin: adminData,
			},
		});
	} catch (error) {
		await client.query("ROLLBACK");
		if (error instanceof Error) {
			return next(error);
		}
		return next(new Error("Something went wrong"));
	} finally {
		client.release();
	}
};

export { createAdmin };
