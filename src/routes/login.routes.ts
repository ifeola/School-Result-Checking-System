import { Router } from "express";
import { login } from "../controllers/auth.controller.ts";
import validateUserData from "../middlewares/validator.ts";
import {
	authLimiter,
	loginSlowDown,
} from "../middlewares/rateLimit.ts";
import catchError from "../utils/catchError.ts";

const router: Router = Router();

router.post(
	"/",
	authLimiter,
	loginSlowDown,
	validateUserData,
	catchError(login),
);

export default router;
