import { Router } from "express";
import generateResult from "../controllers/generateResults.controller.ts";
import { expensiveLimiter } from "../middlewares/rateLimit.ts";

const router: Router = Router();

router.get("/:id/pdf", expensiveLimiter, generateResult);

export default router;
