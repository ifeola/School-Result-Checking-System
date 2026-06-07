import { Router } from "express";
import {
	createTeacher,
	deleteTeacher,
	getAllTeachers,
} from "../controllers/teachers.controller.ts";
import teacherValidator from "../validators/teacher-validator.ts";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";

const router = Router();

router
	.get("/", getAllTeachers)
	.post(
		"/",
		teacherValidator,
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		createTeacher,
	)
	.delete(
		"/:id",
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		deleteTeacher,
	);

export default router;
