import { Router } from "express";
import { getAssessment } from "../controllers/assessment.controller.ts";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";

const router = Router();

router.get(
	"/:admission_number/results",
	authenticate,
	authorize(["student", "teacher", "super_admin", "staff_admin"]),
	getAssessment,
);

export default router;
