import { Router } from "express";
import {
	createStudent,
	getStudents,
	deleteStudent,
	updateStudent,
} from "../controllers/student.controller.ts";
import { studentValidator } from "../validators/student-validators.ts";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";

const router = Router();

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
	.patch(
		"/:id",
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		updateStudent,
	)
	.delete("/:id", authenticate, authorize(["super_admin"]), deleteStudent);

// router.get("/subjects", getSubjects);

export default router;
