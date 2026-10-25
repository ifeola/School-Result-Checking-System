import { z } from "zod";
import {
	ADMIN_NUMBER_REGEX,
	ADMISSION_NUMBER_REGEX,
	TEACHER_NUMBER_REGEX,
} from "../constants/regex.ts";
import { uuidSchema } from "./common.ts";

const emailSchema = z
	.string()
	.trim()
	.max(254, "Email is too long.")
	.email("Enter a valid email address.");

const nameSchema = (field: string, min = 2) =>
	z
		.string()
		.trim()
		.min(min, `Please enter ${field}.`)
		.max(100, `${field} is too long.`)
		.refine(
			(value) => !/[\u0000-\u001F\u007F]/.test(value),
			`${field} contains invalid characters.`,
		);

const passwordSchema = z
	.string()
	.min(1, "Password is required.")
	.max(128, "Password is too long.");

const identifierSchema = z
	.string()
	.trim()
	.min(3, "Enter a valid email or admission number.")
	.max(254, "Identifier is too long.")
	.refine((value) => {
		const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
		const isAdmissionNumber = ADMISSION_NUMBER_REGEX.test(value);
		const isTeacherNumber = TEACHER_NUMBER_REGEX.test(value);
		const isAdminNumber = ADMIN_NUMBER_REGEX.test(value);

		return (
			isEmail || isAdmissionNumber || isTeacherNumber || isAdminNumber
		);
	}, "Enter a valid email or admission number.");

const genderSchema = z
	.string()
	.trim()
	.transform((value) => value.toLowerCase())
	.pipe(z.enum(["male", "female"], "Gender must be male or female."));

const dateOfBirthSchema = z
	.string()
	.trim()
	.regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be YYYY-MM-DD.")
	.refine((value) => {
		const date = new Date(`${value}T00:00:00.000Z`);
		return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
	}, "Invalid date of birth.");

export const loginSchema = z
	.object({
		identifier: identifierSchema,
		password: passwordSchema,
	})
	.strict();

export const createAdminSchema = z
	.object({
		email: emailSchema,
		firstName: nameSchema("admin's first name"),
		middleName: nameSchema("admin's middle name"),
		lastName: nameSchema("admin's last name"),
	})
	.strict();

export const createTeacherSchema = z
	.object({
		email: emailSchema,
		first_name: nameSchema("teacher's first name"),
		middle_name: nameSchema("teacher's middle name"),
		last_name: nameSchema("teacher's last name"),
		phone: z
			.string()
			.trim()
			.max(20, "Phone number is too long.")
			.refine(
				(value) => !/[\u0000-\u001F\u007F]/.test(value),
				"Phone number contains invalid characters.",
			)
			.optional(),
	})
	.strict();

export const createStudentSchema = z
	.object({
		first_name: nameSchema("student's first name", 3),
		last_name: nameSchema("student's last name", 3),
		middle_name: z
			.string()
			.trim()
			.max(100, "Middle name is too long.")
			.refine(
				(value) => !/[\u0000-\u001F\u007F]/.test(value),
				"Middle name contains invalid characters.",
			)
			.optional(),
		gender: genderSchema,
		parent_name: nameSchema("parent's name", 3),
		parent_phone: z
			.string()
			.trim()
			.max(20, "Parent phone number is too long.")
			.refine(
				(value) => !/[\u0000-\u001F\u007F]/.test(value),
				"Parent phone number contains invalid characters.",
			)
			.optional(),
		date_of_birth: dateOfBirthSchema,
		class_name: uuidSchema,
		department_name: uuidSchema.nullable().optional(),
	})
	.strict();

export const updateStudentSchema = z
	.object({
		first_name: nameSchema("student's first name", 2).optional(),
		last_name: nameSchema("student's last name", 2).optional(),
		middle_name: z
			.string()
			.trim()
			.max(100, "Middle name is too long.")
			.refine(
				(value) => !/[\u0000-\u001F\u007F]/.test(value),
				"Middle name contains invalid characters.",
			)
			.nullable()
			.optional(),
		gender: genderSchema.optional(),
		date_of_birth: dateOfBirthSchema.optional(),
		parent_name: nameSchema("parent's name", 2).optional(),
		parent_phone: z
			.string()
			.trim()
			.max(20, "Parent phone number is too long.")
			.refine(
				(value) => !/[\u0000-\u001F\u007F]/.test(value),
				"Parent phone number contains invalid characters.",
			)
			.nullable()
			.optional(),
		current_status: z.enum(["active", "graduated", "withdrawn"]).optional(),
	})
	.strict()
	.refine(
		(value) => Object.keys(value).length > 0,
		"No update field provided.",
	);
