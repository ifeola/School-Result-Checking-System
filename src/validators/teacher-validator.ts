import { body } from "express-validator";

const teacherValidator = [
	body("email").trim().isEmail().withMessage("Enter a valid email address."),
	body("firstName")
		.trim()
		.notEmpty()
		.withMessage("Please enter teacher's first name")
		.isLength({ min: 3 })
		.escape(),
	body("lastName")
		.trim()
		.notEmpty()
		.withMessage("Please enter student's last name")
		.isLength({ min: 3 })
		.escape(),
	body("phone").escape(),
];

export default teacherValidator;
