import { Router } from "express";
import { getTerms } from "../controllers/term.controller.ts";
import catchError from "../utils/catchError.ts";

const router: Router = Router();

router.get("/", catchError(getTerms));

export default router;
