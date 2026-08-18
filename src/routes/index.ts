import { Router } from "express";
import studentRouter from "./student.routes.ts";
import adminRouter from "./admin.routes.ts";
import loginRouter from "./login.routes.ts";
import logoutRouter from "./logout.routes.ts";
import classRouter from "./class.routes.ts";
import departmentRouter from "./department.routes.ts";
import allSessionsRouter from "./academic-session.routes.ts";
import teacherRouter from "./teacher.routes.ts";
import userRouter from "./user.routes.ts";
import assessmentRouter from "./assessment.routes.ts";
// import generateResultRouter from "./generateResult.routes.ts";
import classPositionRouter from "./assessment.routes.ts";
import previousAssessmentRouter from "./assessment.routes.ts";
import allResultsRouter from "./assessment.routes.ts";
import resultCountsRouter from "./assessment.routes.ts";
import termsRouter from "./term.routes.ts";
import getCurrentSessionRouter from "./academic-session.routes.ts";

const router: Router = Router();

// Auth routers
router.use("/auth/login", loginRouter);
router.use("/auth/me", userRouter);
router.use("/logout", logoutRouter);

// Props router
router.use("/classes", classRouter);
router.use("/departments", departmentRouter);

// Users routes
router.use("/admins", adminRouter);
router.use("/students", studentRouter);
router.use("/teachers", teacherRouter);
router.use("/students", assessmentRouter);
router.use("/students", previousAssessmentRouter);
router.use("/students", classPositionRouter);

// Results routers
router.use("/students/results/all", allResultsRouter);
router.use("/students/results", resultCountsRouter);
// router.use("/result/:studentId/pdf", generateResultRouter);

// Academic Sessions routers
router.use("/terms", termsRouter);
router.use("/academic-sessions", getCurrentSessionRouter);
router.use("/academic-sessions", allSessionsRouter);

export default router;
