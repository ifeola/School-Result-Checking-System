import { Router } from "express";
import { login } from "../controllers/auth.controller.ts";
import validateUserData from "../middlewares/validator.ts";

const router = Router();

router.post("/", validateUserData, login);

export default router;
