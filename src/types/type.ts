import { type Request } from "express";

interface student {
	userId: string;
	admissionNumber: string;
	firstName: string;
	lastName: string;
	gender: "male" | "female";
	dateOfBirth: Date;
	parentName: string;
	parentPhone: string;
	currentStatus: "active" | "graduated" | "withdrawn";
	middleName?: string | undefined;
}

interface teacher {
	userId: string;
	teacherNumber: string;
	firstName: string;
	lastName: string;
	phone: string;
}

interface user {
	password: string;
	role: "admin" | "teacher" | "student";
	email?: string | undefined;
}

interface admin {
	userId: string;
	fullName: string;
	permissionLevel: "super_admin" | "staff_admin" | null;
}

type queryValue = (string | number | null | Date | boolean)[];

interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		identifier: string;
		role: string;
		permissionLevel: "super_admin" | "staff_admin" | null;
	};
}

interface enrollment {
	studentId: string;
	classId: string;
	sessionId: string;
	departmentId: string | null;
}

export type {
	student,
	user,
	queryValue,
	AuthenticatedRequest,
	teacher,
	admin,
	enrollment,
};
