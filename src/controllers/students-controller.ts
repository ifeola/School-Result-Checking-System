import type { Request, Response } from "express";
import { generateAdmissionNumber } from "../utils/generateAdmissionNumber.ts";
import db from "../database/db.ts";
import bcrypt from "bcrypt";
import Student from "../services/Students.ts";
import User from "../services/User.ts";
import type { student, user } from "../types/type.ts";

const createStudent = async (req: Request, res: Response) => {
	const admissionNumber = await generateAdmissionNumber(db);

	const data = req.body;

	if (!data) {
		res.status(400).json({
			success: false,
			message: "Please provide valid student details.",
		});
	}

	const studentPassword = data.lastName.toUpperCase();
	const hashedPassword = await bcrypt.hash(studentPassword, 10);
	const studentRole = "student";

	const userData: user = { role: studentRole, password: hashedPassword };
	const createdUser = await User.create(userData);

	// create student account
	const studentData: student = {
		userId: createdUser.id,
		admissionNumber,
		firstName: data.firstName,
		lastName: data.lastName,
		gender: data.gender,
		dateOfBirth: new Date(data.dateOfBirth),
		parentName: data.parentName,
		parentPhone: data.parentPhone,
		currentStatus: "active",
		middleName: data.middleName,
	};
	const createdStudent = await Student.create(studentData);
	return res.status(201).json({
		success: true,
		message: "Student created successfully",
		data: createdStudent,
	});
};

export { createStudent };
