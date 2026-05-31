import { body } from "express-validator";
import { ADMISSION_NUMBER_REGEX } from "../../constants/regex.ts";

const validateUserData = [
	body("identifier")
		.trim()
		.notEmpty()
		.withMessage("Email or admission number is required.")
		.custom((value) => {
			const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
			const isAdmissionNumber = ADMISSION_NUMBER_REGEX.test(value);

			if (!isEmail && !isAdmissionNumber) {
				throw new Error("Enter a valid email or admission number.");
			}

			return true;
		}),

	body("password")
		.trim()
		.notEmpty()
		.withMessage("Password is required.")
		.isLength({ min: 3 })
		.withMessage("Password must be at least 8 characters long."),
];

export default validateUserData;
