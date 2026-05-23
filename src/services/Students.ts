import db from "../database/db.ts";
import type { student } from "../types/type.ts";

class Student {
	public userId: string;
	public admissionNumber: string;
	public firstName: string;
	public lastName: string;
	public gender: "male" | "female";
	public dateOfBirth: Date;
	public parentName: string;
	public parentPhone: string;
	public currentStatus: "active" | "graduated" | "withdrawn";
	public middleName?: string | undefined;

	constructor(
		userId: string,
		admissionNumber: string,
		firstName: string,
		lastName: string,
		gender: "male" | "female",
		dateOfBirth: Date,
		parentName: string,
		parentPhone: string,
		currentStatus: "active" | "graduated" | "withdrawn",
		middleName?: string,
	) {
		// 2. Explicitly assign them
		this.userId = userId;
		this.admissionNumber = admissionNumber;
		this.firstName = firstName;
		this.lastName = lastName;
		this.gender = gender;
		this.dateOfBirth = dateOfBirth;
		this.parentName = parentName;
		this.parentPhone = parentPhone;
		this.currentStatus = currentStatus;
		this.middleName = middleName;
	}

	static async create(user: student) {
		const queryText = `insert into students(user_id, admission_number, first_name, last_name, gender, date_of_birth, parent_name, parent_phone, current_status, middle_name) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      returning id, admission_number, first_name, last_name, gender, date_of_birth, current_status, middle_name`;
		const values = [
			user.userId,
			user.admissionNumber,
			user.firstName,
			user.lastName,
			user.gender,
			user.dateOfBirth,
			user.parentName,
			user.parentPhone,
			user.currentStatus,
			user.middleName ?? null,
		];
		const data = await db.query(queryText, values);
		return data.rows[0];
	}
}

export default Student;
