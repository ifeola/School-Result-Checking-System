import { Router } from "express";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";
import adminValidator from "../validators/admin-validator.ts";
import { createAdmin } from "../controllers/admin.controller.ts";
import catchError from "../utils/catchError.ts";

const router: Router = Router();

router
	.post(
		"/",
		adminValidator,
		authenticate,
		authorize(["super_admin"]),
		catchError(createAdmin),
	)
	.delete("/", authenticate, authorize(["super_admin"]));

export default router;
