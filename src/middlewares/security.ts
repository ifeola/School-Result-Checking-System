import cookieParser from "cookie-parser";
import cors, { type CorsOptions } from "cors";
import express, { type Application } from "express";
import helmet from "helmet";
import type { AppEnv } from "../config/env.ts";
import { ForbiddenError } from "../services/Custom-Errors.ts";

/**
 * Applies security headers and the strict CORS allowlist.
 *
 * helmet defaults are kept intact. The API returns JSON/PDF rather than HTML,
 * so the default CSP is harmless; if you later serve Swagger/HTML docs from
 * this origin, add the required sources to the CSP instead of disabling it.
 */
export const applySecurityHeaders = (app: Application, env: AppEnv) => {
	app.disable("x-powered-by");
	app.set("trust proxy", env.trustProxy);
	// Escapes <, > and & in JSON responses (XSSI hardening). JSON.parse on the
	// client returns the original characters, so the frontend is unaffected.
	app.set("json escape", true);

	app.use(
		helmet({
			// HSTS is only meaningful over HTTPS, so keep it off in local dev.
			strictTransportSecurity: env.isProduction
				? { maxAge: 15_552_000, includeSubDomains: true }
				: false,
			// The API is intentionally consumed from a different origin (Vite
			// in dev, a separate frontend host in production). CORP remains
			// meaningful for the JSON responses because CORS still applies.
			crossOriginResourcePolicy: { policy: "cross-origin" },
		}),
	);

	const corsOptions: CorsOptions = {
		origin(origin, callback) {
			// Non-browser clients (curl, server-to-server) do not send Origin.
			if (!origin) return callback(null, true);

			if (env.corsOrigins.includes(origin)) {
				return callback(null, true);
			}

			return callback(
				new ForbiddenError("Origin is not allowed by CORS."),
			);
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Accept", "Authorization", "Content-Type"],
		exposedHeaders: [
			"RateLimit",
			"RateLimit-Policy",
			"RateLimit-Reset",
			"Retry-After",
		],
		maxAge: 86_400,
		optionsSuccessStatus: 204,
	};

	app.use(cors(corsOptions));
};

export const applyBodyParsers = (app: Application, env: AppEnv) => {
	app.use(
		express.json({
			limit: env.body.jsonLimit,
			strict: true,
		}),
	);
	app.use(
		express.urlencoded({
			extended: true,
			limit: env.body.urlencodedLimit,
			parameterLimit: env.body.parameterLimit,
		}),
	);
	app.use(cookieParser());
};
