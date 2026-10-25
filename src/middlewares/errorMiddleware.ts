import type { ErrorRequestHandler } from "express";
import type { AppEnv } from "../config/env.ts";
import { CustomError } from "../services/Custom-Errors.ts";

type DatabaseError = {
	code?: string;
	status?: number;
	type?: string;
};

const isDatabaseError = (error: unknown): error is DatabaseError =>
	typeof error === "object" && error !== null && "code" in error;

const isBodyParserError = (error: unknown): error is DatabaseError =>
	typeof error === "object" &&
	error !== null &&
	("type" in error || "status" in error);

export const createErrorMiddleware =
	(env: AppEnv): ErrorRequestHandler =>
	(err: unknown, req, res, next) => {
		if (res.headersSent) {
			return next(err);
		}

		if (err instanceof CustomError) {
			return res.status(err.status).json({
				success: false,
				message: err.message,
			});
		}

		const bodyError = isBodyParserError(err) ? err : undefined;

		if (bodyError?.type === "entity.too.large" || bodyError?.status === 413) {
			return res.status(413).json({
				success: false,
				message: "Request payload is too large.",
			});
		}

		if (
			bodyError?.type === "entity.parse.failed" ||
			(err instanceof SyntaxError && "body" in err)
		) {
			return res.status(400).json({
				success: false,
				message: "Invalid JSON payload.",
			});
		}

		const databaseError = isDatabaseError(err) ? err : undefined;

		if (databaseError?.code) {
			const mapped = mapDatabaseError(databaseError.code);

			if (mapped) {
				console.error(
					`[database] ${req.method} ${req.originalUrl} (${databaseError.code})`,
				);
				return res.status(mapped.status).json({
					success: false,
					message: mapped.message,
				});
			}
		}

		console.error(`[error] ${req.method} ${req.originalUrl}`, err);

		return res.status(500).json({
			success: false,
			message: env.isProduction
				? "Internal Server Error"
				: err instanceof Error
					? err.message
					: "Internal Server Error",
		});
	};

const mapDatabaseError = (
	code: string,
): { status: number; message: string } | undefined => {
	switch (code) {
		case "23505":
			return {
				status: 409,
				message: "A record with that value already exists.",
			};
		case "23503":
			return {
				status: 409,
				message: "This record is still referenced by other data.",
			};
		case "23502":
			return {
				status: 400,
				message: "A required field is missing.",
			};
		case "22P02":
			return {
				status: 400,
				message: "Invalid input value.",
			};
		case "23514":
			return {
				status: 400,
				message: "Value violates a database constraint.",
			};
		default:
			return undefined;
	}
};

export default createErrorMiddleware;
