import bcrypt from "bcrypt";
import type { Request, Response, NextFunction } from "express";
import { matchedData, validationResult } from "express-validator";
import { NotFoundError, ValidationError } from "../services/Custom-Errors.ts";
import generateTeacherNumber from "../utils/generateTeacherNumber.ts";
import db from "../database/db.ts";
import type { teacher, user } from "../types/type.ts";
import User from "../services/User.ts";
import Teacher from "../services/Teacher.ts";
import {
	formartPaginatedResponse,
	getPaginationParams,
} from "../utils/pagination.ts";

const createTeacher = async (
	req: Request,
	res: Response,
	next: NextFunction
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

	const hashedPassword = await bcrypt.hash(result.last_name.toUpperCase(), 10);
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
			firstName: result.first_name,
			middleName: result.middle_name,
			lastName: result.last_name,
			phone: result.phone,
			status: "active",
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
		// throw error;
		return next(new Error("Something went wrong"));
	} finally {
		client.release();
	}
};

const deleteTeacher = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const teacherId = req.params.id as string;
	if (!teacherId?.trim()) {
		return next(new ValidationError("Please provide a valid id"));
	}

	const client = await db.sql.connect();
	const existingTeacher = await Teacher.getTeacherById(teacherId);

	if (!existingTeacher) {
		return next(new NotFoundError("Teacher not found."));
	}

	try {
		await client.query("BEGIN");
		const deletedTeacher = await Teacher.deleteById(existingTeacher.id, client);
		const deletedUser = await User.deleteUserById(
			existingTeacher.user_id,
			client
		);
		await client.query("COMMIT");

		if (!deletedTeacher && !deletedUser) {
			return next(new NotFoundError("Teacher not found."));
		}

		return res.status(200).json({
			success: true,
			message: "Teacher successfully deleted.",
			data: { teacher: deletedTeacher },
		});
	} catch (error) {
		await client.query("ROLLBACK");
		return next(error);
	} finally {
		client.release();
	}
};

const getAllTeachers = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { page, limit, skip } = getPaginationParams(req.query);
	const { teachers, teachersCount } = await Teacher.getAllTeachers({
		page,
		limit,
		skip,
	});
	const response = formartPaginatedResponse(
		teachers,
		page,
		limit,
		teachersCount
	);
	return res.status(200).json(response);
};

export { createTeacher, deleteTeacher, getAllTeachers };
