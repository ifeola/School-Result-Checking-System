import { Router } from "express";
import { getAssessment } from "../controllers/assessment.controller.ts";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";

const router = Router();

router.get(
	"/:id/assessment",
	authenticate,
	authorize(["student", "teacher", "admin"]),
	getAssessment,
);

export default router;
