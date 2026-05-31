import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import type { Application } from "express";
import { urlencoded } from "express";
import { config } from "dotenv";
import router from "./routes/students-router.ts";
import errorMiddleware from "./controllers/middlewares/errorMiddleware.ts";
import authRouter from "./routes/authentication-router.ts";
import teacherRouter from "./routes/teacher-router.ts";
import adminRouter from "./routes/admin-router.ts";

config();
const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use("/api/v1", router);
app.use("/api/v1", authRouter);
app.use("/api/v1", teacherRouter);
app.use("/api/v1", adminRouter);
app.use(errorMiddleware);

app.listen(PORT, () => {
	console.log(`Server running on localhost:${PORT}`);
});
