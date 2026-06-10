import { Router } from "express";
import { getUser } from "../controllers/user.controller.ts";
import authenticate from "../middlewares/authenticate.ts";

const router = Router();

router.get("/", authenticate, getUser);

export default router;
