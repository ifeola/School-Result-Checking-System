import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { ConflictError } from "../services/Custom-Errors.ts";
import db from "../database/db.ts";
import User from "../services/User.ts";
import Admin from "../services/Admin.ts";
import generateAdminNumber from "../utils/generateAdminNumber.ts";
import { loadEnv } from "../config/env.ts";

const env = loadEnv();

const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
	const data = req.body as {
		email: string;
		firstName: string;
		middleName: string;
		lastName: string;
	};

	// Check if email already exists
	const existingAdmin = await User.getUserByIdentifier(data.email);
	if (existingAdmin) {
		return next(new ConflictError("Email already exists."));
	}

	const ROLE = "staff_admin";
	const adminNumber = await generateAdminNumber(db);
	const client = await db.sql.connect();

	try {
		await client.query("BEGIN");
		const hashedPassword = await bcrypt.hash(data.lastName, env.bcryptRounds);
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
				adminNumber,
			},
			client,
		);

		await client.query("COMMIT");
		return res.status(201).json({
			success: true,
			message: "Admin successfully added.",
			data: {
				admin: adminData,
			},
		});
	} catch (error) {
		await client.query("ROLLBACK");
		throw error;
	} finally {
		client.release();
	}
};

export { createAdmin };
