import { Router } from "express";
import {
	createTeacher,
	deleteTeacher,
	getAllTeachers,
} from "../controllers/teachers.controller.ts";
import teacherValidator from "../validators/teacher-validator.ts";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";
import catchError from "../utils/catchError.ts";

const router: Router = Router();

router
	.get("/", catchError(getAllTeachers))
	.post(
		"/",
		teacherValidator,
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		catchError(createTeacher),
	)
	.delete(
		"/:id",
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		catchError(deleteTeacher),
	);

export default router;
