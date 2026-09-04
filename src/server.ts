import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import type { Application } from "express";
import { urlencoded } from "express";
import { config } from "dotenv";
import router from "./routes/index.ts";
import errorMiddleware from "./middlewares/errorMiddleware.ts";
import notFound from "./middlewares/notFound.ts";
import helmet from "helmet";

config();
const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://myschool-1pb9.onrender.com",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use("/api/v1", router);

app.use(notFound);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on localhost:${PORT}`);
});
