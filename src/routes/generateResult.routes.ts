import { Router } from "express";
// import generateResult from "../controllers/generateResults.controller.ts";
import authenticate from "../middlewares/authenticate.ts";
import authorize from "../middlewares/authorize.ts";

const router = Router();

// router.get("/", generateResult);

// export default router;
