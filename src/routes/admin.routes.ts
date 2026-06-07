import { Router } from "express";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";
import adminValidator from "../validators/admin-validator.ts";
import { createAdmin } from "../controllers/admin.controller.ts";

const router = Router();

router
	.post(
		"/",
		adminValidator,
		authenticate,
		authorize(["super_admin"]),
		createAdmin,
	)
	.delete("/", authenticate, authorize(["super_admin"]));

export default router;
