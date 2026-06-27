import type { Response, Request, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/type.ts";
import { NotFoundError, UnauthorizedError } from "../services/Custom-Errors.ts";
import Student from "../services/Students.ts";
import Teacher from "../services/Teacher.ts";
import Admin from "../services/Admin.ts";

const getUsers = (req: Request, res: Response, next: NextFunction) => {};

const getUser = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	const user = req.user;

	if (!user) {
		return next(new UnauthorizedError());
	}

	if (user.role === "student") {
		const student = await Student.getStudentById(user.id);

		if (!student) {
			return next(new NotFoundError("Student not found"));
		}
		return res.status(200).json({ success: true, data: { user: student } });
	}

	if (user.role === "teacher") {
		const teacher = await Teacher.getTeacherById(user.id);

		if (!teacher) {
			return next(new NotFoundError("Teacher not found"));
		}
		return res.status(200).json({ success: true, data: { user: teacher } });
	}

	if (user.role === "admin") {
		const admin = await Admin.getAdminById(user.id);

		if (!admin) {
			return next(new NotFoundError("Admin not found"));
		}
		return res.status(200).json({ success: true, data: { user: admin } });
	}

	return next(new UnauthorizedError());
};

export { getUser };
