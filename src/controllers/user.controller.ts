import type { Response, Request, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/type.ts";
import { NotFoundError, UnauthorizedError } from "../services/Custom-Errors.ts";
import Student from "../services/Students.ts";
import Teacher from "../services/Teacher.ts";

const getUser = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	const user = req.user;

	if (!user) {
		return next(new UnauthorizedError());
	}

	try {
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
	} catch (error) {
		next(error);
	}
};

export { getUser };
