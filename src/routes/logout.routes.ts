import { Router } from "express";
import { logout } from "../controllers/auth.controller.ts";
import catchError from "../utils/catchError.ts";

const router: Router = Router();

router.post("/", catchError(logout));

export default router;
