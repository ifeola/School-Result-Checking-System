import { Router } from "express";
import { logout } from "../controllers/auth.controller.ts";

const router = Router();

router.post("/", logout);

export default router;
