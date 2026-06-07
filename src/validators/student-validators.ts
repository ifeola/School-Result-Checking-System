import { body } from "express-validator";

const studentValidator = [
	body("firstName")
		.trim()
		.notEmpty()
		.withMessage("Please enter student's first name")
		.isLength({ min: 3 })
		.escape(),

	body("lastName")
		.trim()
		.notEmpty()
		.withMessage("Please enter student's last name")
		.isLength({ min: 3 })
		.escape(),

	body("middleName").trim().escape(),
	body("gender")
		.trim()
		.toLowerCase()
		.isIn(["male", "female"])
		.withMessage("Gender must be male or female"),

	body("parentName")
		.trim()
		.notEmpty()
		.withMessage("Please enter student's parent's name")
		.isLength({ min: 3 })
		.escape(),

	body("parentPhone").escape(),
	body("dateOfBirth")
		.notEmpty()
		.withMessage("Date of birth is required")
		.isDate()
		.withMessage("Invalid date format"),
	body("classId")
		.notEmpty()
		.withMessage("Class is required")
		.isUUID()
		.withMessage("Invalid class id"),
	body("sessionId")
		.notEmpty()
		.withMessage("Session is required")
		.isUUID()
		.withMessage("Invalid session id"),
	body("departmentId")
		.optional({ nullable: true })
		.isUUID()
		.withMessage("Invalid department id"),
];

export { studentValidator };
