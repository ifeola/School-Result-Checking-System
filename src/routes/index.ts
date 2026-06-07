import { Router } from "express";
import studentRouter from "./student.routes.ts";
import adminRouter from "./admin.routes.ts";
import authRouter from "./authentication.routes.ts";
import classRouter from "./class.routes.ts";
import departmentRouter from "./department.routes.ts";
import sessionRouter from "./session.routes.ts";
import teacherRouter from "./teacher.routes.ts";

const router = Router();

router.use("/students", studentRouter);
router.use("/admins", adminRouter);
router.use("/auth/login", authRouter);
router.use("/classes", classRouter);
router.use("/departments", departmentRouter);
router.use("/academic-sessions", sessionRouter);
router.use("/teachers", teacherRouter);

export default router;
