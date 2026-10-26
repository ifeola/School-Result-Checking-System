import express, { type Application } from "express";
import { loadEnv, type AppEnv } from "./config/env.ts";
import { createErrorMiddleware } from "./middlewares/errorMiddleware.ts";
import notFound from "./middlewares/notFound.ts";
import { createRateLimiters, globalLimiter } from "./middlewares/rateLimit.ts";
import {
	applyBodyParsers,
	applySecurityHeaders,
} from "./middlewares/security.ts";
import router from "./routes/index.ts";

export type CreateAppOptions = {
	env?: AppEnv;
};

export const createApp = (options: CreateAppOptions = {}): Application => {
	const env = options.env ?? loadEnv();
	const app = express();

	// Route-level limiters read their concrete instances from app.locals. This
	// keeps limits configurable per app instance (useful in tests).
	app.locals.rateLimiters = createRateLimiters(env);

	applySecurityHeaders(app, env);
	app.use("/api/v1", globalLimiter);
	applyBodyParsers(app, env);

	// Shallow liveness probe for the reverse proxy / platform health check.
	// It intentionally does not touch the database.
	app.get("/health", (_req, res) => {
		res.status(200).json({ status: "ok" });
	});

	app.use("/api/v1", router);

	app.use(notFound);
	app.use(createErrorMiddleware(env));

	return app;
};

export default createApp;
