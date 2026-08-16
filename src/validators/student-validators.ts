import { body } from "express-validator";

const studentValidator = [
	body("first_name")
		.trim()
		.notEmpty()
		.withMessage("Please enter student's first name")
		.isLength({ min: 3 })
		.escape(),

	body("last_name")
		.trim()
		.notEmpty()
		.withMessage("Please enter student's last name")
		.isLength({ min: 3 })
		.escape(),

	body("middle_name").trim().escape(),
	body("gender")
		.trim()
		.toLowerCase()
		.isIn(["male", "female"])
		.withMessage("Gender must be male or female"),

	body("parent_name")
		.trim()
		.notEmpty()
		.withMessage("Please enter student's parent's name")
		.isLength({ min: 3 })
		.escape(),

	body("parent_phone").escape(),
	body("date_of_birth")
		.notEmpty()
		.withMessage("Date of birth is required")
		.isDate()
		.withMessage("Invalid date format"),
	body("class_name")
		.notEmpty()
		.withMessage("Class is required")
		.isUUID()
		.withMessage("Invalid class id"),
	body("department_name")
		.optional({ nullable: true })
		.isUUID()
		.withMessage("Invalid department id"),
];

export { studentValidator };
