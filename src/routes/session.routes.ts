import { Router } from "express";
import { getAllSessions } from "../controllers/session.controller.ts";

const router = Router();

router.get("/", getAllSessions);

export default router;
