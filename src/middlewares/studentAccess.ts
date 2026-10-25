import Student from "../services/Students.ts";
import {
	ForbiddenError,
	UnauthorizedError,
} from "../services/Custom-Errors.ts";
import type { AuthenticatedRequest } from "../types/type.ts";

type AuthUser = NonNullable<AuthenticatedRequest["user"]>;

export const STAFF_ROLES = [
	"super_admin",
	"staff_admin",
	"teacher",
] as const;

export const STAFF_AND_ADMIN_ROLES = [
	"super_admin",
	"staff_admin",
] as const;

export const assertStudentAdmissionAccess = async (
	user: AuthUser | undefined,
	admissionNumber: string,
) => {
	if (!user) throw new UnauthorizedError();

	// Staff and teachers may read any student's result.
	if (user.role !== "student") return;

	const ownStudent = await Student.getStudentById(user.id);

	if (!ownStudent || ownStudent.admission_number !== admissionNumber) {
		throw new ForbiddenError("You can only access your own results.");
	}
};

export const assertStudentRecordAccess = (
	user: AuthUser | undefined,
	student: { user_id?: string | null } | null | undefined,
) => {
	if (!user) throw new UnauthorizedError();

	if (user.role !== "student") return;

	if (!student?.user_id || student.user_id !== user.id) {
		throw new ForbiddenError("You can only access your own student record.");
	}
};
