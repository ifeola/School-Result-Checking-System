import { Router } from "express";
import {
	createStudent,
	getStudents,
	deleteStudent,
	updateStudent,
} from "../controllers/students-controller.ts";
import { studentValidator } from "../validators/validators.ts";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";

const router = Router();

// Authentication endpoints for students
router
	.post(
		"/students",
		studentValidator,
		authenticate,
		authorize(["admin"]),
		createStudent,
	)
	.get("/students", authenticate, authorize(["admin", "student"]), getStudents)
	.delete("/students/:id", authenticate, authorize(["admin"]), deleteStudent)
	.patch("/students/:id", authenticate, authorize(["admin"]), updateStudent);

// router.get("/subjects", getSubjects);

export default router;
