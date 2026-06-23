import { Router } from "express";
import { getAllSessions } from "../controllers/session.controller.ts";
import catchError from "../utils/catchError.ts";

const router: Router = Router();

router.get("/", catchError(getAllSessions));

export default router;
