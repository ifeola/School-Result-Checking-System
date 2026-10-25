import { z } from "zod";
import { ADMISSION_NUMBER_REGEX } from "../constants/regex.ts";

const controlCharacterPattern = /[\u0000-\u001F\u007F]/;

export const uuidSchema = z
	.string()
	.trim()
	.uuid("Invalid id. Expected a UUID.");

export const admissionNumberSchema = z
	.string()
	.trim()
	.transform((value) => value.toUpperCase())
	.pipe(
		z
			.string()
			.regex(
				ADMISSION_NUMBER_REGEX,
				"Admission number must be in the form DEAC-YEAR-0000.",
			),
	);

export const pageSchema = z.coerce
	.number()
	.int("Page must be a whole number.")
	.min(1, "Page must be at least 1.")
	.default(1);

export const limitSchema = z.coerce
	.number()
	.int("Limit must be a whole number.")
	.min(1, "Limit must be at least 1.")
	.max(100, "Limit cannot exceed 100.")
	.default(25);

export const searchSchema = z
	.string()
	.trim()
	.max(100, "Search term is too long.")
	.refine(
		(value) => !controlCharacterPattern.test(value),
		"Search term contains invalid characters.",
	);

export const termNameSchema = z
	.string()
	.trim()
	.min(1, "Term is required.")
	.max(50, "Term is too long.")
	.regex(
		/^[A-Za-z0-9][A-Za-z0-9 ./_-]*$/,
		"Term contains invalid characters.",
	);

export const sessionNameSchema = z
	.string()
	.trim()
	.min(1, "Session is required.")
	.max(50, "Session is too long.")
	.regex(
		/^[A-Za-z0-9][A-Za-z0-9 ./_-]*$/,
		"Session contains invalid characters.",
	);

export const sortOrderSchema = z.enum(["asc", "desc"]);

export const studentSortSchema = z.enum([
	"created_at",
	"first_name",
	"last_name",
	"admission_number",
	"current_status",
]);

export const teacherSortSchema = z.enum([
	"current_status",
	"last_name",
	"first_name",
	"gender",
	"created_at",
	"staff_number",
]);

export const assessmentSortSchema = z.enum([
	"created_at",
	"first_name",
	"last_name",
	"admission_number",
	"current_status",
]);

export const uuidParamSchema = z
	.object({
		id: uuidSchema,
	})
	.strict();

export const admissionNumberParamSchema = z
	.object({
		admission_number: admissionNumberSchema,
	})
	.strict();

export const paginationQuerySchema = z.object({
	page: pageSchema,
	limit: limitSchema,
});

const queryString = z
	.string()
	.trim()
	.max(100)
	.refine(
		(value) => !controlCharacterPattern.test(value),
		"Query value contains invalid characters.",
	);

export const studentListQuerySchema = z.object({
	page: pageSchema,
	limit: limitSchema,
	search: searchSchema.optional(),
	status: z.enum(["active", "graduated", "withdrawn"]).optional(),
	gender: z.enum(["male", "female"]).optional(),
	class_name: queryString.optional(),
	department_name: queryString.optional(),
	sort: studentSortSchema.optional(),
	order: sortOrderSchema.optional(),
});

export const teacherListQuerySchema = z.object({
	page: pageSchema,
	limit: limitSchema,
	search: searchSchema.optional(),
	status: queryString.optional(),
	gender: z.enum(["male", "female"]).optional(),
	staff_number: queryString.optional(),
	sort: teacherSortSchema.optional(),
	order: sortOrderSchema.optional(),
});

export const assessmentListQuerySchema = z.object({
	page: pageSchema,
	limit: limitSchema,
	search: searchSchema.optional(),
	term_name: termNameSchema.optional(),
	session_name: sessionNameSchema.optional(),
	admission_number: z
		.string()
		.trim()
		.max(20)
		.regex(ADMISSION_NUMBER_REGEX, "Invalid admission number.")
		.optional(),
	class_name: queryString.optional(),
	department_name: queryString.optional(),
	sort: assessmentSortSchema.optional(),
	order: sortOrderSchema.optional(),
});

export const assessmentQuerySchema = z.object({
	// The per-student endpoint historically used `term`/`session`, while the
	// PDF and list endpoints used `term_name`/`session_name`. Accept both.
	term: termNameSchema.optional(),
	session: sessionNameSchema.optional(),
	term_name: termNameSchema.optional(),
	session_name: sessionNameSchema.optional(),
});

export const resultCountsQuerySchema = z.object({
	session_name: sessionNameSchema,
});
