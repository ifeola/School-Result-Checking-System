import { body } from "express-validator";

const adminValidator = [
	body("email").trim().isEmail().withMessage("Enter a valid email address."),
	body("firstName")
		.trim()
		.notEmpty()
		.withMessage("Please enter admin's first name")
		.isLength({ min: 2 })
		.escape(),
	body("middleName")
		.trim()
		.notEmpty()
		.withMessage("Please enter admin's middle name")
		.isLength({ min: 2 })
		.escape(),
	body("lastName")
		.trim()
		.notEmpty()
		.withMessage("Please enter admin's last name")
		.isLength({ min: 2 })
		.escape(),
];

export default adminValidator;
