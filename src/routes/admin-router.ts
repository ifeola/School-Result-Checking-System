import { Router } from "express";
import authenticate from "../controllers/middlewares/authenticate.ts";
import authorize from "../controllers/middlewares/authorize.ts";
import adminValidator from "../validators/admin-validator.ts";
import { createAdmin } from "../controllers/admin-controller.ts";

const adminRouter = Router();

adminRouter.post(
	"/admins",
	adminValidator,
	authenticate,
	authorize(["super_admin"]),
	createAdmin,
);

export default adminRouter;
