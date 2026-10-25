import { Router } from "express";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";
import { validate } from "../middlewares/validate.ts";
import { createAdminSchema } from "../schemas/auth.ts";
import { createAdmin } from "../controllers/admin.controller.ts";
import catchError from "../utils/catchError.ts";

const router: Router = Router();

router
	.post(
		"/",
		authenticate,
		authorize(["super_admin", "staff_admin"]),
		validate({ body: createAdminSchema }),
		catchError(createAdmin),
	)
	.delete("/", authenticate, authorize(["super_admin"]));

export default router;
