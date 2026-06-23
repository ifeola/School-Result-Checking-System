import { Router } from "express";
import { getAllDepartments } from "../controllers/department.controller.ts";
import catchError from "../utils/catchError.ts";

const router: Router = Router();

router.get("/", catchError(getAllDepartments));

export default router;
