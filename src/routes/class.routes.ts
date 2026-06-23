import { Router } from "express";
import { getAllClasses } from "../controllers/class.controller.ts";
import catchError from "../utils/catchError.ts";

const router: Router = Router();

router.get("/", catchError(getAllClasses));

export default router;
