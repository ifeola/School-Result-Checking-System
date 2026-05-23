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

export type { student, user };
