import { Router } from "express";
import {
	createTeacher,
	deleteTeacher,
} from "../controllers/teachers-controller.ts";
import teacherValidator from "../validators/teacher-validator.ts";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";

const teacherRouter = Router();

teacherRouter
	.post(
		"/teachers",
		teacherValidator,
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		createTeacher,
	)
	.delete(
		"/teachers",
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		deleteTeacher,
	);

export default teacherRouter;
