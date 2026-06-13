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
	body("permissionLevel")
		.trim()
		.notEmpty()
		.withMessage("Please enter permission level for admin.")
		.custom((value) => {
			if (value !== "staff_admin" && value !== "super_admin") return false;
			return true;
		})
		.escape(),
];

export default adminValidator;
