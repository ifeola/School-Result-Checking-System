import { Router } from "express";
import {
	createTeacher,
	deleteTeacher,
	getAllTeachers,
} from "../controllers/teachers.controller.ts";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";
import { validate } from "../middlewares/validate.ts";
import { createTeacherSchema } from "../schemas/auth.ts";
import {
	teacherListQuerySchema,
	uuidParamSchema,
} from "../schemas/common.ts";
import catchError from "../utils/catchError.ts";

const router: Router = Router();

router
	.get(
		"/",
		authenticate,
		authorize(["super_admin", "staff_admin", "teacher"]),
		validate({ query: teacherListQuerySchema }),
		catchError(getAllTeachers),
	)
	.post(
		"/",
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		validate({ body: createTeacherSchema }),
		catchError(createTeacher),
	)
	.delete(
		"/:id",
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		validate({ params: uuidParamSchema }),
		catchError(deleteTeacher),
	);

export default router;
