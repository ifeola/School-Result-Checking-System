import { Router } from "express";
import generateResult from "../controllers/generateResults.controller.ts";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";
import { expensiveLimiter } from "../middlewares/rateLimit.ts";
import { validate } from "../middlewares/validate.ts";
import {
	assessmentQuerySchema,
	uuidParamSchema,
} from "../schemas/common.ts";
import catchError from "../utils/catchError.ts";

const router: Router = Router();

router.get(
	"/:id/pdf",
	authenticate,
	authorize(["student", "teacher", "super_admin", "staff_admin"]),
	expensiveLimiter,
	validate({ params: uuidParamSchema, query: assessmentQuerySchema }),
	catchError(generateResult),
);

export default router;
