import { Router } from "express";
import { login } from "../controllers/auth.controller.ts";
import validateUserData from "../middlewares/validator.ts";
import catchError from "../utils/catchError.ts";

const router: Router = Router();

router.post("/", validateUserData, catchError(login));

export default router;
