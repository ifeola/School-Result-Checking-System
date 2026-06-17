import { Router } from "express";
import studentRouter from "./student.routes.ts";
import adminRouter from "./admin.routes.ts";
import loginRouter from "./login.routes.ts";
import logoutRouter from "./logout.routes.ts";
import classRouter from "./class.routes.ts";
import departmentRouter from "./department.routes.ts";
import sessionRouter from "./session.routes.ts";
import teacherRouter from "./teacher.routes.ts";
import userRouter from "./user.routes.ts";
import assessmentRouter from "./assessment.routes.ts";
import generateResultRouter from "./generateResult.routes.ts";
import classPositionRouter from "./assessment.routes.ts";
import previousAssessmentRouter from "./assessment.routes.ts"

const router = Router();

router.use("/students", studentRouter);
router.use("/admins", adminRouter);
router.use("/auth/login", loginRouter);
router.use("/logout", logoutRouter);
router.use("/classes", classRouter);
router.use("/departments", departmentRouter);
router.use("/academic-sessions", sessionRouter);
router.use("/teachers", teacherRouter);
router.use("/auth/me", userRouter);
router.use("/students", assessmentRouter);
router.use("/students", previousAssessmentRouter);
router.use("/students", classPositionRouter);
router.use("/generate-result-pdf", generateResultRouter);

export default router;
