import { Router } from "express";
import { param } from "express-validator";
import {
	createStudent,
	getStudents,
	getStudent,
	deleteStudent,
	updateStudent,
} from "../controllers/student.controller.ts";
import { studentValidator } from "../validators/student-validators.ts";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";

const router: Router = Router();

// Authentication endpoints for students
router
	.post(
		"/",
		studentValidator,
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		createStudent,
	)
	.get(
		"/",
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		getStudents,
	)
	.get(
		"/:id",
		param("id").isUUID().withMessage("Invalid student ID"),
		authenticate,
		authorize(["super_admin", "staff_admin", "student", "teacher"]),
		getStudent,
	)
	.patch(
		"/:id",
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		updateStudent,
	)
	.delete("/:id", authenticate, authorize(["super_admin"]), deleteStudent);

// router.get("/subjects", getSubjects);

export default router;
