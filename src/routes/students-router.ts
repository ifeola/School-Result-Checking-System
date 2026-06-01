import { Router } from "express";
import {
	createStudent,
	getStudents,
	deleteStudent,
	updateStudent,
} from "../controllers/students-controller.ts";
import { studentValidator } from "../validators/student-validators.ts";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";

const router = Router();

// Authentication endpoints for students
router
	.post(
		"/students",
		studentValidator,
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		createStudent,
	)
	.get(
		"/students",
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		getStudents,
	)
	.patch(
		"/students/:id",
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		updateStudent,
	)
	.delete(
		"/students/:id",
		authenticate,
		authorize(["super_admin"]),
		deleteStudent,
	);

// router.get("/subjects", getSubjects);

export default router;
