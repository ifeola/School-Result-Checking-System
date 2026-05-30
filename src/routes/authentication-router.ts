import { Router } from "express";
import { login } from "../controllers/auth-controller.ts";
import validateUserData from "../middlewares/validator.ts";

const authRouter = Router();

authRouter.post("/auth/login", validateUserData, login);

export default authRouter;
