import { Router } from "express";
import generateResult from "../controllers/generateResults.controller.ts";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";

const router = Router();

router.post("/", generateResult);

export default router;
