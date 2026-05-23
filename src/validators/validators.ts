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
	body("gender").isIn(["male", "female"]),

	body("parentName")
		.trim()
		.notEmpty()
		.withMessage("Please enter student's parent's name")
		.isLength({ min: 3 })
		.escape(),

	body("parentPhone").escape(),
];

export { studentValidator };
