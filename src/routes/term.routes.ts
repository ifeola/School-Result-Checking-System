import { Router } from "express";
import { getTerms } from "../controllers/term.controller.ts";

const router = Router();

router.get("/", getTerms);

export default router;
