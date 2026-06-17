import { Router } from "express";
import {
	getAssessment,
	getClassPosition,
	getPreviousAssessment,
} from "../controllers/assessment.controller.ts";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";

const router = Router();

router.get(
	"/:admission_number/results",
	authenticate,
	authorize(["student", "teacher", "super_admin", "staff_admin"]),
	getAssessment
);

router.get(
	"/:admission_number/previous/results",
	authenticate,
	authorize(["student", "teacher", "super_admin", "staff_admin"]),
	getPreviousAssessment
);

router.get(
	"/:admission_number/position",
	authenticate,
	authorize(["student", "teacher", "super_admin", "staff_admin"]),
	getClassPosition
);

export default router;
