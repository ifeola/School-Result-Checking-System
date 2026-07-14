import { z } from "zod";
import { ADMISSION_NUMBER_REGEX } from "../constants/regex.ts";

export const resultRowSchema = z.object({
	admission_number: z
		.string("Admission number is required")
		.trim()
		.toUpperCase()
		.regex(
			ADMISSION_NUMBER_REGEX,
			"Admission number must be in the form DEAC-YEAR-0000",
		),
});
