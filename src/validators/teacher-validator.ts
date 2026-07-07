import { body } from "express-validator";

const teacherValidator = [
	body("email").trim().isEmail().withMessage("Enter a valid email address."),
	body("first_name")
		.trim()
		.notEmpty()
		.withMessage("Please enter teacher's first name")
		.isLength({ min: 2 })
		.escape(),
	body("middle_name")
		.trim()
		.notEmpty()
		.withMessage("Please enter teacher's middle name")
		.isLength({ min: 2 })
		.escape(),
	body("last_name")
		.trim()
		.notEmpty()
		.withMessage("Please enter teacher's last name")
		.isLength({ min: 2 })
		.escape(),
	body("phone").escape(),
];

export default teacherValidator;
