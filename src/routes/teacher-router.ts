import { Router } from "express";
import {
	createTeacher,
	deleteTeacher,
	getAllTeachers,
} from "../controllers/teachers-controller.ts";
import teacherValidator from "../validators/teacher-validator.ts";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";

const teacherRouter = Router();

teacherRouter
	.get("/teachers", getAllTeachers)
	.post(
		"/teachers",
		teacherValidator,
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		createTeacher,
	)
	.delete(
		"/teachers/:id",
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		deleteTeacher,
	);

export default teacherRouter;
