import { Router } from "express";
import {
	createStudent,
	getStudents,
	getStudent,
	deleteStudent,
	updateStudent,
} from "../controllers/student.controller.ts";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";
import { validate } from "../middlewares/validate.ts";
import {
	createStudentSchema,
	updateStudentSchema,
} from "../schemas/auth.ts";
import {
	studentListQuerySchema,
	uuidParamSchema,
} from "../schemas/common.ts";
import catchError from "../utils/catchError.ts";

const router: Router = Router();

router
	.post(
		"/",
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		validate({ body: createStudentSchema }),
		catchError(createStudent),
	)
	.get(
		"/",
		authenticate,
		authorize(["super_admin", "staff_admin", "teacher"]),
		validate({ query: studentListQuerySchema }),
		catchError(getStudents),
	)
	.get(
		"/:id",
		authenticate,
		authorize(["student", "teacher", "super_admin", "staff_admin"]),
		validate({ params: uuidParamSchema }),
		catchError(getStudent),
	)
	.patch(
		"/:id",
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		validate({ params: uuidParamSchema, body: updateStudentSchema }),
		catchError(updateStudent),
	)
	.delete(
		"/:id",
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		validate({ params: uuidParamSchema }),
		catchError(deleteStudent),
	);

export default router;
