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

interface user {
	password: string;
	role: "admin" | "teacher" | "student";
	email?: string | undefined;
}

type queryValue = (string | number | null | Date | boolean)[];

interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		identifier: string;
		role: string;
	};
}

export type { student, user, queryValue, AuthenticatedRequest };
