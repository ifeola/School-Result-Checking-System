import { Router } from "express";
import catchError from "../utils/catchError.ts";
import {
	getAllSessions,
	getCurrentAcademicSession,
} from "../controllers/academic-session.controller.ts";
import authenticate from "../middlewares/authenticate.ts";

const router: Router = Router();

router.get("/", authenticate, catchError(getAllSessions));
router.get("/current", authenticate, catchError(getCurrentAcademicSession));

export default router;
