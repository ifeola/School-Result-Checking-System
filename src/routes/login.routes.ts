import { Router } from "express";
import { login } from "../controllers/auth.controller.ts";
import {
	authLimiter,
	loginSlowDown,
} from "../middlewares/rateLimit.ts";
import { validate } from "../middlewares/validate.ts";
import { loginSchema } from "../schemas/auth.ts";
import catchError from "../utils/catchError.ts";

const router: Router = Router();

router.post(
	"/",
	authLimiter,
	loginSlowDown,
	validate({ body: loginSchema }),
	catchError(login),
);

export default router;
