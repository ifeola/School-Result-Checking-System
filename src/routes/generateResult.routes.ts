import { Router } from "express";
import generateResult from "../controllers/generateResults.controller.ts";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";

const router: Router = Router();

router.get("/:id/pdf", generateResult);

export default router;
