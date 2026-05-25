import { Router } from "express";
import {
	createStudent,
	getStudents,
} from "../controllers/students-controller.ts";
import { studentValidator } from "../validators/validators.ts";

const router = Router();

// Authentication endpoints for students
router.post("/students", studentValidator, createStudent);
router.get("/students", getStudents);

// router.get("/subjects", getSubjects);

export default router;
