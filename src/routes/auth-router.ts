import { Router } from "express";
import { login } from "../controllers/auth-controller.ts";
import { createStudent } from "../controllers/students-controller.ts";
import { studentValidator } from "../validators/validators.ts";

const router = Router();

// Authentication endpoints
router.post("/students", studentValidator, createStudent);
// router.get("/subjects", getSubjects);

export default router;
