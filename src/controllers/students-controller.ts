import type { NextFunction, Request, Response } from "express";
import { generateAdmissionNumber } from "../utils/generateAdmissionNumber.ts";
import db from "../database/db.ts";
import bcrypt from "bcrypt";
import Student from "../services/Students.ts";
import User from "../services/User.ts";
import type { student, user } from "../types/type.ts";
import { matchedData, validationResult } from "express-validator";
import { NotFoundError, ValidationError } from "../services/Custom-Errors.ts";
import {
	formartPaginatedResponse,
	getPaginationParams,
} from "../utils/pagination.ts";

const createStudent = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const admissionNumber = await generateAdmissionNumber(db);

	const result = validationResult(req);
	if (!result.isEmpty()) {
		return next(new ValidationError(result.array()));
	}

	const data = matchedData(req);

	const studentPassword = data.lastName.toUpperCase();
	const hashedPassword = await bcrypt.hash(studentPassword, 10);
	const ROLE = "student";
	const client = await db.sql.connect();

	try {
		await client.query("BEGIN");
		const userData: user = { role: ROLE, password: hashedPassword };
		const createdUser = await User.create(userData, client);

		// create student account
		const studentData: student = {
			userId: createdUser.id,
			admissionNumber,
			firstName: data.firstName,
			lastName: data.lastName,
			gender: data.gender,
			dateOfBirth: data.dateOfBirth,
			parentName: data.parentName,
			parentPhone: data.parentPhone,
			currentStatus: "active",
			middleName: data.middleName,
		};
		const createdStudent = await Student.create(studentData, client);
		await client.query("COMMIT");

		return res.status(201).json({
			success: true,
			message: "Student created successfully",
			data: createdStudent,
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

const getStudents = async (req: Request, res: Response, next: NextFunction) => {
	const { page, limit, skip } = getPaginationParams(req.query);
	const { students, totalCount } = await Student.getAllStudents({
		page,
		limit,
		skip,
	});

	const response = formartPaginatedResponse(students, page, limit, totalCount);
	res.status(200).json(response);
};

const deleteStudent = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const studentId = req.params.id as string;
		if (!studentId?.trim()) {
			return next(new ValidationError("Please provide a valid id"));
		}

		const result = await Student.deleteStudentById(studentId);
		if (!result) {
			return next(new NotFoundError("Student not found."));
		}

		return res.status(200).json({
			success: true,
			message: "Student successfully deleted.",
			data: { student: result },
		});
	} catch (error) {
		return next(error);
	}
};

const updateStudent = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const studentId = req.params.id as string;
		const updates = req.body;

		if (!studentId?.trim()) {
			return next(new ValidationError("Please provide a valid id"));
		}

		if (Object.keys(updates).length === 0) {
			return next(new ValidationError("No update field provided."));
		}

		const updatedStudent = await Student.updateStudent(studentId, updates);
		if (!updatedStudent) {
			return next(new NotFoundError("Student not found."));
		}

		return res.status(200).json({
			success: true,
			message: "Student updated successfully.",
			data: {
				student: updatedStudent,
			},
		});
	} catch (error) {
		next(error);
	}
};

export { createStudent, getStudents, deleteStudent, updateStudent };
