import { Router } from "express";
import { getUser } from "../controllers/user.controller.ts";
import authenticate from "../middlewares/authenticate.ts";
import catchError from "../utils/catchError.ts";

const router: Router = Router();

router.get("/", authenticate, catchError(getUser));

export default router;
