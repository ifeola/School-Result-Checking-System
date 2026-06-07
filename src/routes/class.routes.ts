import { Router } from "express";
import { getAllClasses } from "../controllers/class.controller.ts";

const router = Router();

router.get("/", getAllClasses);

export default router;
