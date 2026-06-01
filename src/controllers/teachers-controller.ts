import bcrypt from "bcrypt";
import type { Request, Response, NextFunction } from "express";
import { matchedData, validationResult } from "express-validator";
import { ValidationError } from "../services/Custom-Errors.ts";
import generateTeacherNumber from "../utils/generateTeacherNumber.ts";
import db from "../database/db.ts";
import type { teacher, user } from "../types/type.ts";
import User from "../services/User.ts";
import Teacher from "../services/Teacher.ts";

const createTeacher = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	// Generate teacher's reg number
	const teacherNumber = await generateTeacherNumber(db);
	const error = validationResult(req);
	if (!error.isEmpty()) {
		return next(new ValidationError(error.array()));
	}
	const result = matchedData(req);

	// Check if email already exists
	const existingTeacher = await User.getUserByIdentifier(result.email);
	if (existingTeacher) {
		return next(new ValidationError("Email already exists."));
	}

	const hashedPassword = await bcrypt.hash(result.lastName.toUpperCase(), 10);
	const ROLE = "teacher";
	const client = await db.sql.connect();

	try {
		await client.query("BEGIN");
		const userData: user = {
			email: result.email,
			password: hashedPassword,
			role: ROLE,
		};

		const createdUser = await User.create(userData, client);
		const teacherData: teacher = {
			userId: createdUser.id,
			teacherNumber,
			firstName: result.firstName,
			lastName: result.lastName,
			phone: result.phone,
		};

		const createdTeacher = await Teacher.create(teacherData, client);
		await client.query("COMMIT");

		return res.status(201).json({
			success: true,
			message: "Teacher successfully created.",
			data: {
				teacher: {
					...createdTeacher,
				},
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

export { createTeacher };
