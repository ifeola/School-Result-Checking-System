import express from "express";
import cookieParser from "cookie-parser";
import type { Application } from "express";
import { urlencoded } from "express";
import { config } from "dotenv";
import router from "./routes/auth-router.ts";

config();
const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use("/api/v1", router);

app.listen(PORT, () => {
	console.log(`Server running on localhost:${PORT}`);
});
